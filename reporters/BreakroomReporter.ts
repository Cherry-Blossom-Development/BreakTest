import WDIOReporter, { RunnerStats, SuiteStats, TestStats } from '@wdio/reporter';

interface BreakroomReporterOptions {
    apiUrl?: string;
    apiKey?: string;
    platform?: 'web' | 'android' | 'ios';
    environment?: string;
    [key: string]: unknown;
}

interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped' | 'pending';
    duration_ms?: number;
    error_message?: string;
    error_stack?: string;
}

interface SuiteResultData {
    name: string;
    file_path?: string;
    category?: string;
    duration_ms?: number;
    tests: TestResult[];
}

export default class BreakroomReporter extends WDIOReporter {
    private apiUrl: string;
    private apiKey: string;
    private platform: 'web' | 'android' | 'ios';
    private environment: string;
    private collectedSuites: Map<string, SuiteResultData> = new Map();
    private currentSuiteId: string | null = null;
    private branch: string | undefined;
    private commitHash: string | undefined;
    private _isSynchronised: boolean = true;

    constructor(options: BreakroomReporterOptions) {
        super(options as any);

        // Load from options or environment variables
        this.apiUrl = options.apiUrl || process.env.BREAKROOM_API_URL || 'https://www.prosaurus.com/api/test-results';
        this.apiKey = options.apiKey || process.env.BREAKROOM_TEST_API_KEY || '';
        this.platform = options.platform || (process.env.TEST_PLATFORM as 'web' | 'android' | 'ios') || 'web';
        this.environment = options.environment || process.env.TEST_ENVIRONMENT || 'local';

        // Try to get git info
        this.branch = process.env.GIT_BRANCH || this.getGitBranch();
        this.commitHash = process.env.GIT_COMMIT || this.getGitCommit();
    }

    private getGitBranch(): string | undefined {
        try {
            const { execSync } = require('child_process');
            return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        } catch {
            return undefined;
        }
    }

    private getGitCommit(): string | undefined {
        try {
            const { execSync } = require('child_process');
            return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        } catch {
            return undefined;
        }
    }

    onSuiteStart(suite: SuiteStats): void {
        // Only track describe() blocks, not the root
        if (suite.title) {
            const suiteId = `${suite.file}:${suite.title}`;
            this.currentSuiteId = suiteId;
            const filePath = suite.file ? suite.file.replace(/\\/g, '/') : undefined;
            // Extract category from filename (e.g., "chat.spec.ts" -> "chat")
            const category = filePath
                ? filePath.split('/').pop()?.replace('.spec.ts', '') || undefined
                : undefined;
            this.collectedSuites.set(suiteId, {
                name: suite.title,
                file_path: filePath,
                category,
                tests: []
            });
        }
    }

    onSuiteEnd(suite: SuiteStats): void {
        if (suite.title && this.currentSuiteId) {
            const suiteResult = this.collectedSuites.get(this.currentSuiteId);
            if (suiteResult) {
                suiteResult.duration_ms = suite.duration;
            }
        }
    }

    onTestPass(test: TestStats): void {
        this.addTestResult(test, 'passed');
    }

    onTestFail(test: TestStats): void {
        const errorMessage = test.errors?.[0]?.message || test.error?.message;
        const errorStack = test.errors?.[0]?.stack || test.error?.stack;
        this.addTestResult(test, 'failed', errorMessage, errorStack);
    }

    onTestSkip(test: TestStats): void {
        this.addTestResult(test, 'skipped');
    }

    private addTestResult(
        test: TestStats,
        status: 'passed' | 'failed' | 'skipped',
        errorMessage?: string,
        errorStack?: string
    ): void {
        // Find the parent suite
        const suiteId = this.currentSuiteId;
        if (!suiteId) {
            console.warn('[BreakroomReporter] Test without suite:', test.title);
            return;
        }

        const suite = this.collectedSuites.get(suiteId);
        if (!suite) {
            console.warn('[BreakroomReporter] Suite not found:', suiteId);
            return;
        }

        suite.tests.push({
            name: test.title,
            status,
            duration_ms: test.duration,
            error_message: errorMessage,
            error_stack: errorStack
        });
    }

    get isSynchronised(): boolean {
        return this._isSynchronised;
    }

    onRunnerEnd(runner: RunnerStats): void {
        // Convert suites map to array
        const suitesArray = Array.from(this.collectedSuites.values()).filter(s => s.tests.length > 0);

        if (suitesArray.length === 0) {
            console.log('[BreakroomReporter] No test results to report');
            return;
        }

        const payload = {
            platform: this.platform,
            environment: this.environment,
            branch: this.branch,
            commit_hash: this.commitHash,
            suites: suitesArray
        };

        console.log(`[BreakroomReporter] Sending ${suitesArray.length} suite(s) with ${suitesArray.reduce((acc, s) => acc + s.tests.length, 0)} test(s) to ${this.apiUrl}/runs/bulk`);

        // Mark as not synchronized to make WDIO wait
        this._isSynchronised = false;

        fetch(`${this.apiUrl}/runs/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
            },
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[BreakroomReporter] Failed to send results: ${response.status} ${response.statusText}`);
                    console.error(`[BreakroomReporter] Response: ${errorText}`);
                    return;
                }

                const result = await response.json();
                console.log(`[BreakroomReporter] Results saved successfully! Run ID: ${result.run?.id}`);
                console.log(`[BreakroomReporter] View results at: ${this.apiUrl.replace('/api/test-results', '')}/admin/test-results`);
            })
            .catch((error) => {
                console.error('[BreakroomReporter] Error sending results:', error);
            })
            .finally(() => {
                this._isSynchronised = true;
            });
    }
}
