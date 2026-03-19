<#
.SYNOPSIS
    Sets up the Android test environment and runs the E2E test suite.

.DESCRIPTION
    Handles the full pre-flight checklist so tests can run without manual steps:

      1. Ensures Docker Desktop is running
      2. Ensures the Breakroom test containers are up (backend on port 3001)
      3. Ensures an Android emulator is running
      4. Ensures the Android app is built for the test API (rebuilds if needed)
      5. Resets the test database to a clean state
      6. Runs the Android E2E tests

.PARAMETER SkipDbSetup
    Skip the test database reset. Useful for quick re-runs when the DB is already clean.

.PARAMETER ForceRebuild
    Rebuild the Android app even if it is already pointing at the test environment.

.EXAMPLE
    .\run-android-tests.ps1
    .\run-android-tests.ps1 -SkipDbSetup
    .\run-android-tests.ps1 -ForceRebuild
#>
param(
    [switch]$SkipDbSetup,
    [switch]$ForceRebuild
)

$ErrorActionPreference = 'Stop'

# ─── Paths ────────────────────────────────────────────────────────────────────
$BreakTestDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BreakroomDir = Resolve-Path "$BreakTestDir\..\Breakroom"
$AndroidDir   = Resolve-Path "$BreakTestDir\..\Android"
$AndroidSdk   = if     ($env:ANDROID_HOME)      { $env:ANDROID_HOME }
                elseif ($env:ANDROID_SDK_ROOT)   { $env:ANDROID_SDK_ROOT }
                else                             { "$env:LOCALAPPDATA\Android\Sdk" }
$EmulatorExe  = "$AndroidSdk\emulator\emulator.exe"
$AdbExe       = "$AndroidSdk\platform-tools\adb.exe"
$ApkBuilt     = "$AndroidDir\app\build\outputs\apk\debug\app-debug.apk"
$ApkDeploy    = "$BreakTestDir\apps\breakroom.apk"
$AppPackage   = "com.cherryblossomdev.breakroom"

# ─── Output helpers ───────────────────────────────────────────────────────────
function Write-Step([string]$msg) {
    Write-Host ""
    Write-Host "─── $msg" -ForegroundColor Cyan
}
function Write-OK([string]$msg)   { Write-Host "  [ OK ]  $msg" -ForegroundColor Green  }
function Write-Info([string]$msg) { Write-Host "  [ .. ]  $msg" -ForegroundColor Yellow }
function Write-Fail([string]$msg) { Write-Host "  [FAIL]  $msg" -ForegroundColor Red    }

function Wait-ForPort {
    param([int]$Port, [int]$TimeoutSec = 90, [string]$Label = "service")
    Write-Info "Waiting for $Label on port $Port..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
        $ok = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port `
                                 -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($ok) { Write-OK "$Label is ready on port $Port"; return }
        Start-Sleep 3
    }
    Write-Fail "$Label did not become available on port $Port within ${TimeoutSec}s."
    exit 1
}

# ──────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Breakroom Android E2E Test Runner      " -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan

# ─── 1. Docker ────────────────────────────────────────────────────────────────
Write-Step "1/6  Docker"

$dockerReady = $false
try {
    $null = docker info 2>&1
    $dockerReady = ($LASTEXITCODE -eq 0)
} catch {}

if ($dockerReady) {
    Write-OK "Docker daemon is running"
} else {
    Write-Info "Docker not responding — starting Docker Desktop..."

    $desktopExe = @(
        "C:\Program Files\Docker\Docker\Docker Desktop.exe",
        "C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $desktopExe) {
        Write-Fail "Docker Desktop executable not found. Install Docker Desktop and try again."
        exit 1
    }

    Start-Process $desktopExe
    Write-Info "Waiting for Docker daemon (up to 90s)..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt 90) {
        Start-Sleep 5
        try {
            $null = docker info 2>&1
            if ($LASTEXITCODE -eq 0) { break }
        } catch {}
    }
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Docker daemon did not start in time. Start Docker Desktop manually and retry."
        exit 1
    }
    Write-OK "Docker is ready"
}

# ─── 2. Test containers ───────────────────────────────────────────────────────
Write-Step "2/6  Breakroom test containers (port 3001)"

$backendUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 3001 `
                                -WarningAction SilentlyContinue -InformationLevel Quiet
if ($backendUp) {
    Write-OK "Test backend already running on port 3001"
} else {
    Write-Info "Starting test containers..."
    Push-Location $BreakroomDir
    docker compose -f docker-compose.test.yml --env-file .env.test up -d
    $exitCode = $LASTEXITCODE
    Pop-Location
    if ($exitCode -ne 0) {
        Write-Fail "docker compose failed (exit $exitCode)"
        exit 1
    }
    Wait-ForPort -Port 3001 -Label "test backend" -TimeoutSec 120
}

# ─── 3. Android emulator ──────────────────────────────────────────────────────
Write-Step "3/6  Android emulator"

if (-not (Test-Path $EmulatorExe)) {
    Write-Fail "Android emulator not found at:`n    $EmulatorExe`n  Set ANDROID_HOME to your SDK path."
    exit 1
}
if (-not (Test-Path $AdbExe)) {
    Write-Fail "ADB not found at:`n    $AdbExe"
    exit 1
}

$adbOut = & $AdbExe devices 2>&1
$runningEmulator = $adbOut | Where-Object { $_ -match "^emulator-\d+\s+device$" }

if ($runningEmulator) {
    Write-OK "Emulator already running: $($runningEmulator.Trim())"
} else {
    # Pick the first AVD that matches Pixel_7, or just the first one available
    $avdList = (& $EmulatorExe -list-avds 2>&1) | Where-Object { $_.Trim() -ne "" }
    $avd = $avdList | Where-Object { $_ -match "Pixel_7" } | Select-Object -First 1
    if (-not $avd) { $avd = $avdList | Select-Object -First 1 }
    if (-not $avd) {
        Write-Fail "No Android Virtual Device found. Create one in Android Studio (Tools > Device Manager)."
        exit 1
    }

    Write-Info "Starting AVD: $($avd.Trim())"
    Start-Process -FilePath $EmulatorExe -ArgumentList "-avd `"$($avd.Trim())`"" -WindowStyle Minimized

    # Wait for ADB to see the device
    Write-Info "Waiting for emulator to connect to ADB..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt 60) {
        Start-Sleep 3
        $adbOut = & $AdbExe devices 2>&1
        if ($adbOut | Where-Object { $_ -match "^emulator-\d+" }) { break }
    }

    # Wait for full boot
    Write-Info "Waiting for boot to complete (may take 1-2 minutes)..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $booted = $false
    while ($sw.Elapsed.TotalSeconds -lt 180) {
        Start-Sleep 5
        $prop = (& $AdbExe shell getprop sys.boot_completed 2>&1).Trim()
        if ($prop -eq "1") { $booted = $true; break }
    }
    if (-not $booted) {
        Write-Fail "Emulator did not finish booting within 3 minutes."
        exit 1
    }

    # Brief settle so the launcher is interactive
    Start-Sleep 3
    Write-OK "Emulator is running and booted"
}

# ─── 4. Android build ─────────────────────────────────────────────────────────
Write-Step "4/6  Android app environment"

$activeProps = "$AndroidDir\environments\active.properties"
$localProps  = "$AndroidDir\environments\local.properties"

$activeUrl = (Get-Content $activeProps -ErrorAction SilentlyContinue |
              Where-Object { $_ -match "^BASE_URL=" }) -replace "^BASE_URL=", ""
$localUrl  = (Get-Content $localProps  -ErrorAction SilentlyContinue |
              Where-Object { $_ -match "^BASE_URL=" }) -replace "^BASE_URL=", ""

$switched = $false
if ($activeUrl -ne $localUrl) {
    Write-Info "Switching environment: '$activeUrl' -> '$localUrl'"
    & "$AndroidDir\switch-env.ps1" local
    $switched = $true
} else {
    Write-OK "Already pointing at test API ($activeUrl)"
}

if ($switched -or $ForceRebuild) {
    if ($ForceRebuild -and -not $switched) { Write-Info "Force rebuild requested" }
    Write-Info "Building Android app (approx 90s)..."
    Push-Location $AndroidDir
    & .\gradlew.bat assembleDebug --rerun-tasks
    $buildExit = $LASTEXITCODE
    Pop-Location
    if ($buildExit -ne 0) {
        Write-Fail "Gradle build failed (exit $buildExit)"
        exit 1
    }
    Write-OK "Build succeeded"

    Write-Info "Installing APK on emulator..."
    & $AdbExe install -r $ApkBuilt
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "adb install failed"
        exit 1
    }

    if (-not (Test-Path "$BreakTestDir\apps")) {
        New-Item -ItemType Directory -Path "$BreakTestDir\apps" | Out-Null
    }
    Copy-Item $ApkBuilt $ApkDeploy -Force
    Write-OK "APK installed and copied to BreakTest/apps/"
} else {
    # Verify the app is actually on the device; install from last build if not
    $installed = (& $AdbExe shell pm list packages 2>&1) | Where-Object { $_ -match $AppPackage }
    if (-not $installed) {
        if (-not (Test-Path $ApkBuilt)) {
            Write-Fail "App is not installed and no APK was found at:`n    $ApkBuilt`n  Run with -ForceRebuild to build it."
            exit 1
        }
        Write-Info "App not installed on emulator — installing existing APK..."
        & $AdbExe install -r $ApkBuilt
        Copy-Item $ApkBuilt $ApkDeploy -Force
        Write-OK "APK installed"
    } else {
        Write-OK "App already installed on emulator"
    }
}

# ─── 5. Test database ─────────────────────────────────────────────────────────
Write-Step "5/6  Test database"

if ($SkipDbSetup) {
    Write-Info "Skipped (-SkipDbSetup)"
} else {
    Write-Info "Resetting breakroom_test to a clean state..."
    Push-Location $BreakTestDir
    npx ts-node database/setup.ts
    $dbExit = $LASTEXITCODE
    Pop-Location
    if ($dbExit -ne 0) {
        Write-Fail "Database setup failed (exit $dbExit)"
        exit 1
    }
    Write-OK "Test database reset successfully"
}

# ─── 6. Run tests ─────────────────────────────────────────────────────────────
Write-Step "6/6  Running tests"
Write-Host ""

Push-Location $BreakTestDir
npm run test:android
$testExit = $LASTEXITCODE
Pop-Location

# ─── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
if ($testExit -eq 0) {
    Write-Host "  All tests passed!" -ForegroundColor Green
} else {
    Write-Host "  Tests finished with failures (exit $testExit)" -ForegroundColor Red
}
Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Restore production build:  cd ..\Android && .\restore-production.ps1" -ForegroundColor DarkGray
Write-Host ""

exit $testExit
