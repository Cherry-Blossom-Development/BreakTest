/**
 * Create test users in dev/production databases
 *
 * These users are needed for automated tests to authenticate.
 * Run: npx ts-node database/create-test-users.ts [dev|production]
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

function hashPassword(password: string, salt: string): string {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function createTestUsers(env: 'dev' | 'production'): Promise<void> {
    const dbName = env === 'production' ? 'breakroom' : 'breakroom_dev';

    const connection = await mysql.createConnection({
        host: '44.225.148.34',
        port: 3306,
        user: 'DCAdminUser',
        password: '@potAtoSplatWTF99',
        database: dbName,
    });

    console.log(`Connected to ${dbName} database`);

    try {
        for (const [key, user] of Object.entries(TEST_USERS)) {
            const hash = hashPassword(user.password, user.salt);

            // Check if user exists
            const [existing] = await connection.query(
                'SELECT id FROM users WHERE handle = ?',
                [user.handle]
            ) as any;

            if (existing.length > 0) {
                console.log(`User '${user.handle}' already exists (id: ${existing[0].id})`);
                continue;
            }

            // Insert user
            await connection.query(
                `INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt)
                 VALUES (?, ?, ?, ?, TRUE, ?, ?)`,
                [user.handle, user.firstName, user.lastName, user.email, hash, user.salt]
            );

            // Get the user ID
            const [inserted] = await connection.query(
                'SELECT id FROM users WHERE handle = ?',
                [user.handle]
            ) as any;
            const userId = inserted[0].id;

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
                console.log(`Created user '${user.handle}' (id: ${userId}) in group '${user.group}'`);
            } else {
                console.log(`Created user '${user.handle}' (id: ${userId}) - group '${user.group}' not found`);
            }
        }

        // Verify
        const [users] = await connection.query(
            'SELECT handle, email, email_verified FROM users WHERE handle IN (?, ?)',
            ['testadmin', 'testuser']
        ) as any;

        console.log('\nTest users in database:');
        console.table(users);

        console.log('\nCredentials for testing:');
        console.log('  testadmin / TestPass123');
        console.log('  testuser / TestPass123');

    } finally {
        await connection.end();
    }
}

// Run
const env = (process.argv[2] || 'dev') as 'dev' | 'production';
if (env !== 'dev' && env !== 'production') {
    console.error('Usage: npx ts-node database/create-test-users.ts [dev|production]');
    process.exit(1);
}

createTestUsers(env)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Failed:', err);
        process.exit(1);
    });
