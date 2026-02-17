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
 * - Demo API running (npm run demo:api:start)
 * - Test database setup (npm run demo:db:setup)
 * - iOS Simulator booted
 * - Demo app installed
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

    before(async () => {
        console.log('='.repeat(50));
        console.log('DEMO: Breakroom Navigation and Chat');
        console.log('='.repeat(50));

        // Connect to database for external user simulation
        await externalUser.connect();

        // Clear and seed chat room with some initial messages
        try {
            await externalUser.clearRoomMessages(DEMO_CHAT_ROOMS.teamChat.name);
            await externalUser.seedRoomWithMessages(DEMO_CHAT_ROOMS.teamChat.name, [
                { from: 'Sarah', message: 'Good morning team!' },
                { from: 'Mike', message: 'Hey everyone, ready for the standup?' },
                { from: 'Sarah', message: 'Yes! Got some updates to share.' },
            ]);
        } catch (error) {
            console.log('Note: Could not seed messages (room may not exist yet)');
        }
    });

    after(async () => {
        // Ensure recording is stopped
        if (recordingStarted) {
            recorder.stopRecording();
        }

        // Disconnect from database
        await externalUser.disconnect();

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
        await browser.pause(1000);

        try {
            // ============================================
            // SCENE 1: Login
            // ============================================
            console.log('\n--- Scene 1: Login ---');

            await LoginPage.waitForScreen();
            await browser.pause(1500); // Let viewer see login screen

            // Login with natural typing for demo effect
            await LoginPage.loginWithNaturalTyping(
                DEMO_USERS.primary.handle,
                DEMO_USERS.primary.password
            );

            // Wait for transition to Breakroom
            await browser.pause(2500);

            // ============================================
            // SCENE 2: Breakroom Overview
            // ============================================
            console.log('\n--- Scene 2: Breakroom Overview ---');

            await BreakroomPage.waitForScreen();
            await browser.pause(2000); // Let viewer see the breakroom

            // Browse through blocks
            await BreakroomPage.scrollDown();
            await browser.pause(1500);

            await BreakroomPage.scrollUp();
            await browser.pause(1500);

            // ============================================
            // SCENE 3: Expand Chat Block
            // ============================================
            console.log('\n--- Scene 3: Chat Block ---');

            // Tap on chat block to expand it
            await BreakroomPage.tapChatBlock();
            await browser.pause(2000);

            // Open full chat view
            await BreakroomPage.openFullChat();
            await browser.pause(2000);

            // ============================================
            // SCENE 4: Chat Interaction
            // ============================================
            console.log('\n--- Scene 4: Chat Interaction ---');

            await ChatPage.waitForScreen();
            await browser.pause(1500);

            // Get current message count
            const initialCount = await ChatPage.getMessageCount();

            // External user sends a message
            console.log('External user (Sarah) sending message...');
            await externalUser.sendChatMessage(
                'Sarah',
                DEMO_CHAT_ROOMS.teamChat.name,
                'Hey! How is the new feature coming along?'
            );

            // Refresh to see new message
            await browser.pause(1000);
            await ChatPage.refreshMessages();
            await browser.pause(2000);

            // Type and send a reply naturally
            console.log('Demo user sending reply...');
            await ChatPage.sendNewMessageNaturally(
                'Going great! Just finishing up the demo recording.'
            );
            await browser.pause(2000);

            // Another external user responds
            console.log('External user (Mike) sending message...');
            await externalUser.sendChatMessage(
                'Mike',
                DEMO_CHAT_ROOMS.teamChat.name,
                'Awesome! Looking forward to seeing it. 🎉'
            );

            // Refresh to see the response
            await browser.pause(1500);
            await ChatPage.refreshMessages();
            await browser.pause(2500);

            // ============================================
            // SCENE 5: Navigate Back
            // ============================================
            console.log('\n--- Scene 5: Return to Breakroom ---');

            await ChatPage.goBack();
            await browser.pause(2000);

            // Final view of Breakroom
            await BreakroomPage.waitForScreen();
            await browser.pause(2000);

            console.log('\n--- Demo recording complete ---');

        } finally {
            // Stop recording
            const savedPath = recorder.stopRecording();
            recordingStarted = false;
            console.log(`\nRecording saved to: ${savedPath}`);
        }
    });
});
