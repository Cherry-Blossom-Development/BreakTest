/**
 * Test Database Setup Script
 *
 * This script initializes the test database with:
 * 1. Fresh schema (drops and recreates all tables)
 * 2. Required system data (groups, permissions, chat rooms)
 * 3. Test users with known credentials
 *
 * Usage: npx ts-node database/setup.ts
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from the target environment's config file
const testEnv = process.env.TEST_ENV || 'dev';
const envFile = path.join(__dirname, '..', `.env.test.${testEnv}`);
if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
} else {
    // Fall back to .env.test for backward compatibility
    dotenv.config({ path: path.join(__dirname, '..', '.env.test') });
}

// Test user credentials - these are used in tests
export const TEST_USERS = {
    admin: {
        handle: 'testadmin',
        email: 'testadmin@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'Admin',
        salt: 'testsalt_admin_00000000000',
    },
    standard: {
        handle: 'testuser',
        email: 'testuser@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
        salt: 'testsalt_user_000000000000',
    },
    unverified: {
        handle: 'testunverified',
        email: 'testunverified@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'Unverified',
        salt: 'testsalt_unverified_000000',
        verificationToken: 'test-verification-token-12345',
    },
};

/**
 * Hash a password with a salt using SHA-256
 * Matches the Breakroom frontend hashing algorithm
 */
function hashPassword(password: string, salt: string): string {
    const combined = password + salt;
    return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Generate password hashes for all test users
 */
function generatePasswordHashes(): Record<string, string> {
    const hashes: Record<string, string> = {};
    for (const [key, user] of Object.entries(TEST_USERS)) {
        hashes[key] = hashPassword(user.password, user.salt);
    }
    return hashes;
}

/**
 * Execute multiple SQL statements separated by semicolons
 */
async function executeSqlStatements(connection: mysql.Connection, sql: string): Promise<void> {
    // Normalize line endings
    const normalizedSql = sql.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove comments
    const withoutComments = normalizedSql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');

    // Split by semicolon followed by newline (to avoid splitting inside strings)
    const statements = withoutComments
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        if (statement.length > 0) {
            try {
                await connection.query(statement);
            } catch (err: any) {
                // Ignore "table doesn't exist" errors during DROP
                if (!err.message.includes('Unknown table') && !err.message.includes('ALGORITHM=COPY')) {
                    console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
                    throw err;
                }
            }
        }
    }
}

async function setupDatabase(): Promise<void> {
    const dbConfig = {
        host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '3306'),
        user: process.env.TEST_DB_USER || process.env.DB_USER || 'root',
        password: process.env.TEST_DB_PASS || process.env.DB_PASS || '',
        multipleStatements: true,
    };

    const dbName = process.env.TEST_DB_NAME || 'breakroom_test';

    console.log(`Connecting to database server at ${dbConfig.host}:${dbConfig.port}...`);

    // Connect without database first to create it
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Drop and recreate database for a completely clean slate
        // This ensures no orphan tables persist from previous runs
        console.log(`Dropping database '${dbName}' if exists...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        console.log(`Creating fresh database '${dbName}'...`);
        await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE \`${dbName}\``);

        // Read and execute schema
        console.log('Applying schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await executeSqlStatements(connection, schemaSql);

        // Generate password hashes
        console.log('Generating password hashes...');
        const hashes = generatePasswordHashes();
        console.log('Password hashes generated:');
        for (const [key, hash] of Object.entries(hashes)) {
            console.log(`  ${key}: ${hash.substring(0, 16)}...`);
        }

        // Read seed data and replace placeholder hashes
        console.log('Applying seed data...');
        const seedPath = path.join(__dirname, 'seed-data.sql');
        let seedSql = fs.readFileSync(seedPath, 'utf8');

        // Replace placeholder hashes with actual hashes
        seedSql = seedSql.replace('PLACEHOLDER_HASH_ADMIN', hashes.admin);
        seedSql = seedSql.replace('PLACEHOLDER_HASH_USER', hashes.standard);
        seedSql = seedSql.replace('PLACEHOLDER_HASH_UNVERIFIED', hashes.unverified);

        await executeSqlStatements(connection, seedSql);

        // Verify setup
        console.log('\nVerifying setup...');
        const [users] = await connection.query('SELECT handle, email, email_verified FROM users');
        console.log('Users created:', users);

        const [groups] = await connection.query('SELECT name FROM `groups`');
        console.log('Groups created:', (groups as any[]).map(g => g.name).join(', '));

        const [rooms] = await connection.query('SELECT name FROM chat_rooms');
        console.log('Chat rooms created:', (rooms as any[]).map(r => r.name).join(', '));

        // Record that the DB has been set up for this environment
        const statePath = path.join(__dirname, '.db-state.json');
        const state = {
            configured_for: testEnv,
            source_db: process.env.SOURCE_DB_NAME || null,
            schema_synced_at: null as string | null,
            db_setup_at: new Date().toISOString(),
        };
        if (fs.existsSync(statePath)) {
            try {
                const existing = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                state.schema_synced_at = existing.schema_synced_at || null;
                state.source_db = existing.source_db || state.source_db;
            } catch { /* ignore */ }
        }
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');

        console.log('\nTest database setup complete!');
        console.log(`Configured for: ${testEnv}`);
        console.log(`\nTest credentials:`);
        console.log(`  Admin:    ${TEST_USERS.admin.handle} / ${TEST_USERS.admin.password}`);
        console.log(`  Standard: ${TEST_USERS.standard.handle} / ${TEST_USERS.standard.password}`);

    } finally {
        await connection.end();
    }
}

// Run if executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Setup failed:', err);
            process.exit(1);
        });
}

export { setupDatabase, hashPassword, generatePasswordHashes };
