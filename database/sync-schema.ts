/**
 * Production to Test Schema Sync Script
 *
 * This script extracts the schema from the production database and generates
 * a new schema.sql file for the test database, excluding blacklisted tables.
 *
 * Usage: npx ts-node database/sync-schema.ts
 *
 * Options:
 *   --dry-run    Show what would be generated without writing files
 *   --verbose    Show detailed output
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

// ============================================================================
// BLACKLIST CONFIGURATION
// Add table names here that should NEVER be copied to the test database
// ============================================================================
const TABLE_BLACKLIST: string[] = [
    'test_cases',
    'test_runs',
    'test_suites',
];

// ============================================================================
// Database Configuration
// ============================================================================
interface DbConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

function getProductionDbConfig(): DbConfig {
    return {
        host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '3306'),
        user: process.env.TEST_DB_USER || process.env.DB_USER || 'root',
        password: process.env.TEST_DB_PASS || process.env.DB_PASS || '',
        database: process.env.PROD_DB_NAME || 'breakroom', // Production database name
    };
}

// ============================================================================
// Schema Extraction
// ============================================================================

interface TableInfo {
    name: string;
    createStatement: string;
    referencedTables: string[];
}

/**
 * Get all table names from the database
 */
async function getTableNames(connection: mysql.Connection, database: string): Promise<string[]> {
    const [rows] = await connection.query(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
        [database]
    );
    return (rows as any[]).map(row => row.TABLE_NAME);
}

/**
 * Get the CREATE TABLE statement for a table
 */
async function getCreateTableStatement(connection: mysql.Connection, tableName: string): Promise<string> {
    const [rows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
    const row = (rows as any[])[0];
    return row['Create Table'];
}

/**
 * Extract referenced table names from a CREATE TABLE statement (foreign keys)
 */
function extractReferencedTables(createStatement: string): string[] {
    const references: string[] = [];
    const regex = /REFERENCES\s+`([^`]+)`/gi;
    let match;
    while ((match = regex.exec(createStatement)) !== null) {
        references.push(match[1]);
    }
    return [...new Set(references)]; // Remove duplicates
}

/**
 * Remove foreign key constraints that reference blacklisted tables
 */
function removeBlacklistedReferences(createStatement: string, blacklist: string[]): string {
    let result = createStatement;

    for (const tableName of blacklist) {
        // Remove CONSTRAINT lines that reference blacklisted tables
        // Using string concatenation to avoid backtick escaping issues in template literals
        const constraintRegex = new RegExp(
            '\\s*CONSTRAINT\\s+`[^`]+`\\s+FOREIGN KEY\\s+\\([^)]+\\)\\s+REFERENCES\\s+`' + tableName + '`[^,]*,?',
            'gi'
        );
        result = result.replace(constraintRegex, '');

        // Also handle case without CONSTRAINT keyword
        const fkRegex = new RegExp(
            '\\s*FOREIGN KEY\\s+\\([^)]+\\)\\s+REFERENCES\\s+`' + tableName + '`[^,]*,?',
            'gi'
        );
        result = result.replace(fkRegex, '');
    }

    // Clean up any trailing commas before the closing parenthesis
    result = result.replace(/,(\s*)\)/g, '$1)');

    return result;
}

/**
 * Sort tables by dependency order (tables with no dependencies first)
 */
function sortTablesByDependency(tables: TableInfo[], blacklist: string[]): TableInfo[] {
    const sorted: TableInfo[] = [];
    const remaining = [...tables];
    const added = new Set<string>(blacklist); // Treat blacklisted tables as already added

    // Keep processing until all tables are sorted
    let maxIterations = remaining.length * remaining.length;
    while (remaining.length > 0 && maxIterations > 0) {
        maxIterations--;

        for (let i = remaining.length - 1; i >= 0; i--) {
            const table = remaining[i];
            const unmetDependencies = table.referencedTables.filter(ref => !added.has(ref));

            if (unmetDependencies.length === 0) {
                sorted.push(table);
                added.add(table.name);
                remaining.splice(i, 1);
            }
        }
    }

    // If there are still remaining tables, there might be circular dependencies
    // Add them anyway with a warning
    if (remaining.length > 0) {
        console.warn('Warning: Possible circular dependencies detected for tables:',
            remaining.map(t => t.name).join(', '));
        sorted.push(...remaining);
    }

    return sorted;
}

/**
 * Generate DROP TABLE statements in reverse dependency order
 */
function generateDropStatements(tables: TableInfo[]): string {
    const reversed = [...tables].reverse();
    const drops = reversed.map(t => `DROP TABLE IF EXISTS \`${t.name}\`;`);
    return drops.join('\n');
}

/**
 * Main schema sync function
 */
async function syncSchema(options: { dryRun: boolean; verbose: boolean }): Promise<void> {
    const config = getProductionDbConfig();

    console.log('='.repeat(70));
    console.log('Production to Test Schema Sync');
    console.log('='.repeat(70));
    console.log(`\nSource database: ${config.database} @ ${config.host}:${config.port}`);
    console.log(`Blacklisted tables: ${TABLE_BLACKLIST.join(', ') || '(none)'}`);

    if (options.dryRun) {
        console.log('\n*** DRY RUN MODE - No files will be written ***\n');
    }

    // Connect to database
    console.log('\nConnecting to database...');
    const connection = await mysql.createConnection(config);

    try {
        // Get all tables
        const allTables = await getTableNames(connection, config.database);
        console.log(`\nFound ${allTables.length} tables in ${config.database}`);

        // Filter out blacklisted tables
        const tablesToSync = allTables.filter(name => !TABLE_BLACKLIST.includes(name));
        const skippedTables = allTables.filter(name => TABLE_BLACKLIST.includes(name));

        console.log(`Tables to sync: ${tablesToSync.length}`);
        console.log(`Tables skipped (blacklisted): ${skippedTables.length}`);

        if (skippedTables.length > 0 && options.verbose) {
            console.log(`  Skipped: ${skippedTables.join(', ')}`);
        }

        // Get CREATE statements and analyze dependencies
        console.log('\nAnalyzing table structures...');
        const tableInfos: TableInfo[] = [];

        for (const tableName of tablesToSync) {
            const createStatement = await getCreateTableStatement(connection, tableName);
            const referencedTables = extractReferencedTables(createStatement);

            // Remove references to blacklisted tables from the CREATE statement
            const cleanedStatement = removeBlacklistedReferences(createStatement, TABLE_BLACKLIST);

            tableInfos.push({
                name: tableName,
                createStatement: cleanedStatement,
                referencedTables: referencedTables.filter(ref => !TABLE_BLACKLIST.includes(ref)),
            });

            if (options.verbose) {
                const refs = referencedTables.length > 0 ? ` -> ${referencedTables.join(', ')}` : '';
                console.log(`  ${tableName}${refs}`);
            }
        }

        // Sort by dependencies
        console.log('\nSorting tables by dependency order...');
        const sortedTables = sortTablesByDependency(tableInfos, TABLE_BLACKLIST);

        // Generate schema SQL
        console.log('Generating schema SQL...');

        const header = `-- =============================================================================
-- Test Database Schema
-- Generated from production database: ${config.database}
-- Generated at: ${new Date().toISOString()}
--
-- Blacklisted tables (not included):
${TABLE_BLACKLIST.map(t => `--   - ${t}`).join('\n') || '--   (none)'}
-- =============================================================================

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

`;

        const dropSection = `-- =============================================================================
-- Drop existing tables (in reverse dependency order)
-- =============================================================================

${generateDropStatements(sortedTables)}

`;

        const createSection = `-- =============================================================================
-- Create tables (in dependency order)
-- =============================================================================

${sortedTables.map(t => t.createStatement + ';').join('\n\n')}

`;

        const footer = `
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
`;

        const fullSchema = header + dropSection + createSection + footer;

        // Write or display
        const outputPath = path.join(__dirname, 'schema.sql');

        if (options.dryRun) {
            console.log('\n--- Generated Schema Preview (first 2000 chars) ---');
            console.log(fullSchema.substring(0, 2000));
            console.log('...\n');
            console.log(`Total schema size: ${fullSchema.length} characters`);
            console.log(`Would write to: ${outputPath}`);
        } else {
            // Backup existing schema
            if (fs.existsSync(outputPath)) {
                const backupPath = outputPath + '.backup';
                fs.copyFileSync(outputPath, backupPath);
                console.log(`\nBacked up existing schema to: ${backupPath}`);
            }

            fs.writeFileSync(outputPath, fullSchema, 'utf8');
            console.log(`\nSchema written to: ${outputPath}`);
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('Summary');
        console.log('='.repeat(70));
        console.log(`Total tables in production: ${allTables.length}`);
        console.log(`Tables synced: ${sortedTables.length}`);
        console.log(`Tables blacklisted: ${skippedTables.length}`);

        if (!options.dryRun) {
            console.log(`\nNext steps:`);
            console.log(`  1. Review the generated schema.sql`);
            console.log(`  2. Run 'npm run db:setup' to apply the schema to the test database`);
        }

    } finally {
        await connection.end();
    }
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs(): { dryRun: boolean; verbose: boolean } {
    const args = process.argv.slice(2);
    return {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose') || args.includes('-v'),
    };
}

// Run if executed directly
if (require.main === module) {
    const options = parseArgs();

    syncSchema(options)
        .then(() => {
            console.log('\nSchema sync complete!');
            process.exit(0);
        })
        .catch(err => {
            console.error('\nSchema sync failed:', err);
            process.exit(1);
        });
}

export { syncSchema, TABLE_BLACKLIST };
