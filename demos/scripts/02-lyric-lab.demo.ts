/**
 * Demo Script: Lyric Lab - Create a New Song
 *
 * This demo showcases:
 * 1. Navigate to Tool Shed
 * 2. Open Lyric Lab
 * 3. Create a new song idea
 *
 * Prerequisites:
 * - iOS Simulator booted with app installed
 * - User sarah_chen logged in (login happens before recording)
 *
 * Run with: npm run demo:record
 */

import { recorder } from '../services/RecordingService';
import LoginPage from '../pages/LoginPage';
import { DEMO_USERS } from '../data/demoUsers';

describe('Demo: Lyric Lab - Create New Song', () => {
    let recordingStarted = false;

    before(async () => {
        console.log('='.repeat(50));
        console.log('DEMO: Lyric Lab - Create New Song');
        console.log('='.repeat(50));

        // Login BEFORE recording starts
        console.log('Logging in as sarah_chen (not recorded)...');

        try {
            // Check if already logged in
            const toolShedTab = await $('~Tool Shed');
            if (await toolShedTab.isDisplayed()) {
                console.log('Already logged in');
                return;
            }
        } catch {
            // Not logged in, proceed with login
        }

        await LoginPage.waitForScreen();
        await LoginPage.login(
            DEMO_USERS.primary.handle,
            DEMO_USERS.primary.password
        );
        await browser.pause(2000);

        // Handle save password dialog
        await LoginPage.dismissSavePasswordDialog();
        await browser.pause(1000);

        console.log('Login complete');
    });

    after(async () => {
        if (recordingStarted) {
            recorder.stopRecording();
        }
        console.log('='.repeat(50));
        console.log('DEMO COMPLETE');
        console.log('='.repeat(50));
    });

    it('creates a new song in Lyric Lab', async () => {
        const TARGET_DURATION_MS = 30000;
        const startTime = Date.now();

        // Start recording AFTER login
        const recordingPath = recorder.startRecording('lyric-lab-demo');
        recordingStarted = true;
        console.log(`Recording to: ${recordingPath}`);
        await browser.pause(500);

        try {
            // ============================================
            // SCENE 1: Navigate to Tool Shed
            // ============================================
            console.log('\n--- Scene 1: Navigate to Tool Shed ---');

            const toolShedTab = await $('~Tool Shed');
            await toolShedTab.waitForDisplayed({ timeout: 5000 });
            await toolShedTab.click();
            await browser.pause(1000);

            // ============================================
            // SCENE 2: Open Lyric Lab
            // ============================================
            console.log('\n--- Scene 2: Open Lyric Lab ---');

            // Scroll down to find Lyric Lab if needed
            await browser.pause(500);

            // Find and tap the "Open" button for Lyric Lab
            const lyricLabOpen = await $('~lyriclabOpenButton');
            await lyricLabOpen.waitForDisplayed({ timeout: 5000 });
            await lyricLabOpen.click();
            await browser.pause(1000);

            // ============================================
            // SCENE 3: Create New Song
            // ============================================
            console.log('\n--- Scene 3: Create New Song ---');

            // Tap the + button in toolbar
            const plusButton = await $('~lyricLabPlusButton');
            await plusButton.waitForDisplayed({ timeout: 3000 });
            await plusButton.click();
            await browser.pause(500);

            // Select "New Song" from menu
            const newSongButton = await $('~newSongButton');
            await newSongButton.waitForDisplayed({ timeout: 2000 });
            await newSongButton.click();
            await browser.pause(800);

            // ============================================
            // SCENE 4: Fill in Song Details
            // ============================================
            console.log('\n--- Scene 4: Fill in Song Details ---');

            // Find the title field and type
            const titleField = await $('~songTitleField');
            await titleField.waitForDisplayed({ timeout: 3000 });
            await titleField.click();
            await browser.pause(200);

            // Type song title character by character for demo effect
            const songTitle = 'Midnight Dreams';
            for (const char of songTitle) {
                await titleField.addValue(char);
                await browser.pause(30);
            }
            await browser.pause(300);

            // Find description field
            const descField = await $('~songDescriptionField');
            await descField.click();
            await browser.pause(200);

            // Type description
            const description = 'A song about chasing your dreams';
            for (const char of description) {
                await descField.addValue(char);
                await browser.pause(25);
            }
            await browser.pause(300);

            // Dismiss keyboard by tapping outside
            try {
                await driver.hideKeyboard();
            } catch {
                // Keyboard might not be visible
            }
            await browser.pause(300);

            // ============================================
            // SCENE 5: Save the Song
            // ============================================
            console.log('\n--- Scene 5: Save the Song ---');

            // Tap Create button
            const createButton = await $('~createSongButton');
            await createButton.waitForDisplayed({ timeout: 2000 });
            await createButton.click();
            await browser.pause(1500);

            // Show the result - song should appear in list
            console.log('Song created successfully');
            await browser.pause(1000);

            // ============================================
            // Pad to 30 seconds
            // ============================================
            const elapsedMs = Date.now() - startTime;
            const remainingMs = TARGET_DURATION_MS - elapsedMs;

            if (remainingMs > 0) {
                console.log(`\nPadding ${(remainingMs / 1000).toFixed(1)}s to reach 30 seconds...`);
                await browser.pause(remainingMs);
            }

            console.log('\n--- Demo recording complete ---');

        } finally {
            const savedPath = recorder.stopRecording();
            recordingStarted = false;
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\nRecording saved to: ${savedPath} (${totalTime}s)`);
        }
    });
});
