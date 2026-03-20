<#
.SYNOPSIS
    Sets up the web test environment and runs the E2E test suite.

.DESCRIPTION
    Handles the full pre-flight checklist so tests can run without manual steps:

      1. Ensures Docker Desktop is running
      2. Ensures the Breakroom test containers are up (https://test.prosaurus.com:8443)
      3. Resets the test database to a clean state
      4. Runs the web E2E tests

.PARAMETER SkipDbSetup
    Skip the test database reset. Useful for quick re-runs when the DB is already clean.

.EXAMPLE
    .\run-web-test.ps1
    .\run-web-test.ps1 -SkipDbSetup
#>
param(
    [switch]$SkipDbSetup
)

$ErrorActionPreference = 'Stop'

# --- Paths ---
$BreakTestDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BreakroomDir = Resolve-Path "$BreakTestDir\..\Breakroom"

# --- Output helpers ---
function Write-Step([string]$msg) {
    Write-Host ""
    Write-Host "--- $msg ---" -ForegroundColor Cyan
}
function Write-OK([string]$msg)   { Write-Host "  [ OK ]  $msg" -ForegroundColor Green  }
function Write-Info([string]$msg) { Write-Host "  [ .. ]  $msg" -ForegroundColor Yellow }
function Write-Fail([string]$msg) { Write-Host "  [FAIL]  $msg" -ForegroundColor Red    }

function Wait-ForPort {
    param([int]$Port, [int]$TimeoutSec = 120, [string]$Label = "service")
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

# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Breakroom Web E2E Test Runner          " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# --- 1. Docker ---
Write-Step "1/4  Docker"

$dockerReady = $false
docker info 2>$null | Out-Null
$dockerReady = ($LASTEXITCODE -eq 0)

if ($dockerReady) {
    Write-OK "Docker daemon is running"
} else {
    Write-Info "Docker not responding - starting Docker Desktop..."

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
        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { break }
        Start-Sleep 5
    }
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Docker daemon did not start in time. Start Docker Desktop manually and retry."
        exit 1
    }
    Write-OK "Docker is ready"
}

# --- 2. Test containers ---
Write-Step "2/4  Breakroom test containers (port 8443)"

$containerUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 8443 `
                                  -WarningAction SilentlyContinue -InformationLevel Quiet
if ($containerUp) {
    Write-OK "Test environment already running on port 8443"
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
    Wait-ForPort -Port 8443 -Label "test environment" -TimeoutSec 120
}

# --- 3. Test database ---
Write-Step "3/4  Test database"

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

# --- 4. Run tests ---
Write-Step "4/4  Running tests"
Write-Host ""

Push-Location $BreakTestDir
npm run test:web
$testExit = $LASTEXITCODE
Pop-Location

# --- Summary ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($testExit -eq 0) {
    Write-Host "  All tests passed!" -ForegroundColor Green
} else {
    Write-Host "  Tests finished with failures (exit $testExit)" -ForegroundColor Red
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Restore local dev:  cd ..\Breakroom && .\restore-production.ps1" -ForegroundColor DarkGray
Write-Host ""

exit $testExit
