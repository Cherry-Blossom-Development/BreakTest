/**
 * Demo Script: Breakroom Navigation and Chat
 *
 * This demo showcases:
 * 1. Login to the app
 * 2. Browse the Breakroom home page
 * 3. Interact with chat block
 * 4. Receive messages from other users
 * 5. Send replies
 *
 * Prerequisites:
 * - iOS Simulator booted with app installed
 * - Production database accessible (uses real users)
 *
 * Run with: npm run demo:record
 */

import { recorder } from '../services/RecordingService';
import { externalUser } from '../services/ExternalUserService';
import LoginPage from '../pages/LoginPage';
import BreakroomPage from '../pages/BreakroomPage';
import ChatPage from '../pages/ChatPage';
import { DEMO_USERS, DEMO_CHAT_ROOMS } from '../data/demoUsers';

describe('Demo: Breakroom Navigation and Chat', () => {
    // Track if we started recording (for cleanup)
    let recordingStarted = false;
    let dbConnected = false;

    before(async () => {
        console.log('='.repeat(50));
        console.log('DEMO: Breakroom Navigation and Chat');
        console.log('='.repeat(50));

        // Connect to production database for external user simulation
        try {
            await externalUser.connect();
            dbConnected = true;
            console.log('Connected to database for external user simulation');
        } catch (error) {
            console.log('Note: Could not connect to database. External messages will be skipped.');
            console.log('Error:', error);
        }
    });

    after(async () => {
        // Ensure recording is stopped
        if (recordingStarted) {
            recorder.stopRecording();
        }

        // Disconnect from database
        if (dbConnected) {
            await externalUser.disconnect();
        }

        console.log('='.repeat(50));
        console.log('DEMO COMPLETE');
        console.log('='.repeat(50));
    });

    it('records the full breakroom and chat demo', async () => {
        // Start screen recording
        const recordingPath = recorder.startRecording('breakroom-chat-demo');
        recordingStarted = true;
        console.log(`Recording to: ${recordingPath}`);

        // Give recording a moment to initialize
        await browser.pause(500);

        try {
            // ============================================
            // SCENE 1: Login (if needed)
            // ============================================
            console.log('\n--- Scene 1: Login ---');

            // Check if we're already logged in (on Breakroom screen)
            let needsLogin = true;
            try {
                const isBreakroomVisible = await BreakroomPage.isDisplayed();
                if (isBreakroomVisible) {
                    console.log('Already logged in, skipping login...');
                    needsLogin = false;
                }
            } catch {
                // Not on Breakroom, need to login
            }

            if (needsLogin) {
                await LoginPage.waitForScreen();
                await browser.pause(500); // Brief view of login screen

                // Login with fast typing
                await LoginPage.loginWithFastTyping(
                    DEMO_USERS.primary.handle,
                    DEMO_USERS.primary.password
                );

                // Wait for transition to Breakroom
                await browser.pause(1500);
            }

            // ============================================
            // SCENE 2: Breakroom Overview
            // ============================================
            console.log('\n--- Scene 2: Breakroom Overview ---');

            await BreakroomPage.waitForScreen();
            await browser.pause(800); // Brief view of breakroom

            // Quick scroll to show content
            console.log('Scrolling through blocks...');
            await BreakroomPage.scrollDown();
            await browser.pause(400);

            await BreakroomPage.scrollUp();
            await browser.pause(400);

            // ============================================
            // SCENE 3: Tap on Demo Team chat block
            // ============================================
            console.log('\n--- Scene 3: Open Demo Team Chat ---');

            // Look for the Demo Team chat block
            const demoTeamBlock = await $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "Demo Team"`);

            try {
                await demoTeamBlock.waitForDisplayed({ timeout: 3000 });
                console.log('Found Demo Team block, tapping...');
                await demoTeamBlock.click();
                await browser.pause(800);

                // ============================================
                // SCENE 4: Chat Interaction
                // ============================================
                console.log('\n--- Scene 4: Chat Interaction ---');

                // Wait for chat screen
                await ChatPage.waitForScreen();
                await browser.pause(500);

                // External user (Mike) sends a message
                if (dbConnected) {
                    console.log('External user (Mike) sending message...');
                    await externalUser.sendChatMessage(
                        DEMO_USERS.mike.handle,
                        DEMO_CHAT_ROOMS.demoTeam.name,
                        'Hey Sarah! How is the demo going?'
                    );

                    // Pull to refresh to see new message
                    await browser.pause(300);
                    await ChatPage.refreshMessages();
                    await browser.pause(800);
                }

                // Sarah (primary user) sends a reply
                console.log('Demo user (Sarah) sending reply...');
                await ChatPage.sendNewMessageFast('Great! Recording now.');
                await browser.pause(800);

                // Another external user (Emma) responds
                if (dbConnected) {
                    console.log('External user (Emma) sending message...');
                    await externalUser.sendChatMessage(
                        DEMO_USERS.emma.handle,
                        DEMO_CHAT_ROOMS.demoTeam.name,
                        'Looks fantastic! 🎉'
                    );

                    // Pull to refresh
                    await browser.pause(300);
                    await ChatPage.refreshMessages();
                    await browser.pause(1000);
                }

                // ============================================
                // SCENE 5: Navigate Back
                // ============================================
                console.log('\n--- Scene 5: Return to Breakroom ---');

                await ChatPage.goBack();
                await browser.pause(500);

            } catch (error) {
                console.log('Could not find Demo Team block, showing Breakroom only');
                console.log('Error:', error);
            }

            // Final view of Breakroom
            await BreakroomPage.waitForScreen();
            await browser.pause(1000);

            console.log('\n--- Demo recording complete ---');

        } finally {
            // Stop recording
            const savedPath = recorder.stopRecording();
            recordingStarted = false;
            console.log(`\nRecording saved to: ${savedPath}`);
        }
    });
});
