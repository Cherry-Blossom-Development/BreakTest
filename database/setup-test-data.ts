/**
 * Setup test data for automated testing
 *
 * This script creates:
 * - Test users (testadmin, testuser)
 * - A test chat room
 * - Breakroom blocks for all 6 widget types
 * - Sample breakroom updates
 *
 * Run: npx ts-node database/setup-test-data.ts [dev|production]
 */

import mysql from 'mysql2/promise';
import * as crypto from 'crypto';

const TEST_USERS = {
    admin: {
        handle: 'testadmin',
        email: 'testadmin@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'Admin',
        salt: 'testsalt_admin_00000000000',
        group: 'Administrator',
    },
    standard: {
        handle: 'testuser',
        email: 'testuser@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
        salt: 'testsalt_user_000000000000',
        group: 'Standard',
    },
};

// All 6 widget types with their default configurations
const WIDGET_TYPES = [
    { type: 'chat', title: 'Test Chat', x: 0, y: 0, w: 2, h: 2, needsContentId: true },
    { type: 'updates', title: 'Breakroom Updates', x: 2, y: 0, w: 2, h: 2, needsContentId: false },
    { type: 'calendar', title: 'Calendar', x: 4, y: 0, w: 1, h: 2, needsContentId: false },
    { type: 'weather', title: 'Weather', x: 0, y: 2, w: 1, h: 2, needsContentId: false },
    { type: 'news', title: 'News', x: 1, y: 2, w: 2, h: 2, needsContentId: false },
    { type: 'blog', title: 'Blog Posts', x: 3, y: 2, w: 2, h: 2, needsContentId: false },
];

function hashPassword(password: string, salt: string): string {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function setupTestData(env: 'dev' | 'production'): Promise<void> {
    const dbName = env === 'production' ? 'breakroom' : 'breakroom_dev';

    const connection = await mysql.createConnection({
        host: '44.225.148.34',
        port: 3306,
        user: 'DCAdminUser',
        password: '@potAtoSplatWTF99',
        database: dbName,
    });

    console.log(`Connected to ${dbName} database\n`);

    try {
        // Step 1: Create test users
        console.log('=== Step 1: Creating test users ===');
        const userIds: Record<string, number> = {};

        for (const [key, user] of Object.entries(TEST_USERS)) {
            const hash = hashPassword(user.password, user.salt);

            // Check if user exists
            const [existing] = await connection.query(
                'SELECT id FROM users WHERE handle = ?',
                [user.handle]
            ) as any;

            let userId: number;
            if (existing.length > 0) {
                userId = existing[0].id;
                console.log(`User '${user.handle}' already exists (id: ${userId})`);
            } else {
                // Insert user
                const [result] = await connection.query(
                    `INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt)
                     VALUES (?, ?, ?, ?, TRUE, ?, ?)`,
                    [user.handle, user.firstName, user.lastName, user.email, hash, user.salt]
                ) as any;
                userId = result.insertId;

                // Assign to group
                const [groups] = await connection.query(
                    'SELECT id FROM `groups` WHERE name = ?',
                    [user.group]
                ) as any;

                if (groups.length > 0) {
                    await connection.query(
                        'INSERT IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
                        [userId, groups[0].id]
                    );
                }
                console.log(`Created user '${user.handle}' (id: ${userId}) in group '${user.group}'`);
            }
            userIds[key] = userId;
        }

        // Step 2: Create test chat room
        console.log('\n=== Step 2: Creating test chat room ===');
        let testChatRoomId: number;

        const [existingRooms] = await connection.query(
            "SELECT id FROM chat_rooms WHERE name = 'Test Chat Room'"
        ) as any;

        if (existingRooms.length > 0) {
            testChatRoomId = existingRooms[0].id;
            console.log(`Test chat room already exists (id: ${testChatRoomId})`);
        } else {
            const [roomResult] = await connection.query(
                `INSERT INTO chat_rooms (name, description, is_default, owner_id, is_active, discoverable)
                 VALUES ('Test Chat Room', 'Chat room for automated testing', TRUE, ?, TRUE, TRUE)`,
                [userIds.admin]
            ) as any;
            testChatRoomId = roomResult.insertId;
            console.log(`Created test chat room (id: ${testChatRoomId})`);
        }

        // Step 3: Create breakroom blocks for each test user
        console.log('\n=== Step 3: Creating breakroom blocks ===');

        for (const [key, userId] of Object.entries(userIds)) {
            console.log(`\nSetting up blocks for ${key} (user ${userId}):`);

            // Check existing blocks
            const [existingBlocks] = await connection.query(
                'SELECT block_type FROM breakroom_blocks WHERE user_id = ?',
                [userId]
            ) as any;
            const existingTypes = new Set(existingBlocks.map((b: any) => b.block_type));

            for (const widget of WIDGET_TYPES) {
                if (existingTypes.has(widget.type)) {
                    console.log(`  - ${widget.type}: already exists`);
                    continue;
                }

                const contentId = widget.needsContentId ? testChatRoomId : null;

                await connection.query(
                    `INSERT INTO breakroom_blocks (user_id, block_type, content_id, x, y, w, h, title)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, widget.type, contentId, widget.x, widget.y, widget.w, widget.h, widget.title]
                );
                console.log(`  - ${widget.type}: created`);
            }
        }

        // Step 4: Ensure breakroom_updates has data
        console.log('\n=== Step 4: Checking breakroom updates ===');
        const [updates] = await connection.query(
            'SELECT COUNT(*) as count FROM breakroom_updates'
        ) as any;

        if (updates[0].count === 0) {
            console.log('Adding sample breakroom updates...');
            await connection.query(`
                INSERT INTO breakroom_updates (commit_hash, summary, created_at) VALUES
                ('abc123', 'Initial release of Breakroom widget system', NOW() - INTERVAL 7 DAY),
                ('def456', 'Added weather widget with location support', NOW() - INTERVAL 5 DAY),
                ('ghi789', 'Calendar widget now supports user timezones', NOW() - INTERVAL 3 DAY),
                ('jkl012', 'News widget integrates NPR RSS feed', NOW() - INTERVAL 1 DAY),
                ('mno345', 'Chat widget performance improvements', NOW())
            `);
            console.log('Added 5 sample updates');
        } else {
            console.log(`Breakroom updates table has ${updates[0].count} entries`);
        }

        // Step 5: Verify setup
        console.log('\n=== Step 5: Verification ===');

        for (const [key, userId] of Object.entries(userIds)) {
            const [blocks] = await connection.query(
                'SELECT block_type, title FROM breakroom_blocks WHERE user_id = ? ORDER BY block_type',
                [userId]
            ) as any;
            console.log(`\n${key} (user ${userId}) has ${blocks.length} blocks:`);
            blocks.forEach((b: any) => console.log(`  - ${b.block_type}: ${b.title}`));
        }

        console.log('\n=== Setup Complete ===');
        console.log('\nTest credentials:');
        console.log('  testadmin / TestPass123');
        console.log('  testuser / TestPass123');
        console.log('\nAll 6 widget types are now available for testing:');
        console.log('  chat, updates, calendar, weather, news, blog');

    } finally {
        await connection.end();
    }
}

// Run
const env = (process.argv[2] || 'dev') as 'dev' | 'production';
if (env !== 'dev' && env !== 'production') {
    console.error('Usage: npx ts-node database/setup-test-data.ts [dev|production]');
    process.exit(1);
}

setupTestData(env)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Failed:', err);
        process.exit(1);
    });
