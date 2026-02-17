/**
 * Recording Service
 *
 * Controls iOS Simulator screen recording using xcrun simctl.
 * Produces MP4 videos suitable for App Store submissions.
 */

import { execSync, spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class RecordingService {
    private recordingProcess: ChildProcess | null = null;
    private outputDir: string;
    private currentRecordingPath: string | null = null;

    constructor(outputDir: string = './demos/recordings') {
        this.outputDir = outputDir;
        this.ensureOutputDir();
    }

    /**
     * Ensure the output directory exists
     */
    private ensureOutputDir(): void {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Get the UDID of the currently booted simulator
     */
    getBootedSimulatorUDID(): string {
        try {
            const result = execSync('xcrun simctl list devices booted -j', {
                encoding: 'utf8',
            });
            const data = JSON.parse(result);

            for (const runtime of Object.values(data.devices) as any[]) {
                for (const device of runtime) {
                    if (device.state === 'Booted') {
                        console.log(`Found booted simulator: ${device.name} (${device.udid})`);
                        return device.udid;
                    }
                }
            }
        } catch (error) {
            console.error('Error getting simulator UDID:', error);
        }

        throw new Error('No booted iOS simulator found. Please boot a simulator first.');
    }

    /**
     * Get information about the booted simulator
     */
    getSimulatorInfo(): { name: string; udid: string; runtime: string } | null {
        try {
            const result = execSync('xcrun simctl list devices booted -j', {
                encoding: 'utf8',
            });
            const data = JSON.parse(result);

            for (const [runtime, devices] of Object.entries(data.devices) as [string, any[]][]) {
                for (const device of devices) {
                    if (device.state === 'Booted') {
                        return {
                            name: device.name,
                            udid: device.udid,
                            runtime: runtime,
                        };
                    }
                }
            }
        } catch (error) {
            console.error('Error getting simulator info:', error);
        }
        return null;
    }

    /**
     * Start recording the simulator screen
     *
     * @param filename - Name for the output file (without extension)
     * @returns The full path to the recording file
     */
    startRecording(filename: string): string {
        if (this.recordingProcess) {
            console.warn('Recording already in progress. Stopping previous recording.');
            this.stopRecording();
        }

        const udid = this.getBootedSimulatorUDID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFilename = `${filename}_${timestamp}.mp4`;
        const outputPath = path.resolve(this.outputDir, outputFilename);

        console.log(`Starting recording: ${outputPath}`);

        this.recordingProcess = spawn('xcrun', [
            'simctl',
            'io',
            udid,
            'recordVideo',
            '--codec=h264',
            '--force',
            outputPath,
        ]);

        this.currentRecordingPath = outputPath;

        this.recordingProcess.stdout?.on('data', (data) => {
            console.log(`Recording stdout: ${data}`);
        });

        this.recordingProcess.stderr?.on('data', (data) => {
            // simctl outputs progress to stderr
            const msg = data.toString().trim();
            if (msg) {
                console.log(`Recording: ${msg}`);
            }
        });

        this.recordingProcess.on('error', (error) => {
            console.error('Recording process error:', error);
        });

        this.recordingProcess.on('close', (code) => {
            console.log(`Recording process exited with code ${code}`);
            this.recordingProcess = null;
        });

        return outputPath;
    }

    /**
     * Stop the current recording
     *
     * @returns The path to the saved recording, or null if no recording was active
     */
    stopRecording(): string | null {
        if (!this.recordingProcess) {
            console.warn('No recording in progress.');
            return null;
        }

        console.log('Stopping recording...');

        // Send SIGINT to gracefully stop recording
        this.recordingProcess.kill('SIGINT');

        // Wait for the process to finish and file to be written
        try {
            execSync('sleep 2');
        } catch {
            // Ignore sleep errors
        }

        const recordingPath = this.currentRecordingPath;
        this.recordingProcess = null;
        this.currentRecordingPath = null;

        if (recordingPath && fs.existsSync(recordingPath)) {
            const stats = fs.statSync(recordingPath);
            console.log(`Recording saved: ${recordingPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            return recordingPath;
        }

        return recordingPath;
    }

    /**
     * Take a screenshot of the simulator
     *
     * @param filename - Name for the screenshot (without extension)
     * @returns The path to the saved screenshot
     */
    takeScreenshot(filename: string): string {
        const udid = this.getBootedSimulatorUDID();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputPath = path.resolve(this.outputDir, `${filename}_${timestamp}.png`);

        console.log(`Taking screenshot: ${outputPath}`);

        execSync(`xcrun simctl io ${udid} screenshot "${outputPath}"`, {
            encoding: 'utf8',
        });

        console.log(`Screenshot saved: ${outputPath}`);
        return outputPath;
    }

    /**
     * Check if a recording is currently in progress
     */
    isRecording(): boolean {
        return this.recordingProcess !== null;
    }

    /**
     * Get the path to the current recording (if any)
     */
    getCurrentRecordingPath(): string | null {
        return this.currentRecordingPath;
    }
}

// Export singleton instance for convenience
export const recorder = new RecordingService();

export default RecordingService;
