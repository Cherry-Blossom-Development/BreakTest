/**
 * Test User Credentials
 *
 * These credentials match the users created by the database setup script.
 * Use these in your tests for authentication.
 */

export const TestUsers = {
    /**
     * Admin user with Administrator group permissions
     */
    admin: {
        handle: 'testadmin',
        email: 'testadmin@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'Admin',
        fullName: 'Test Admin',
    },

    /**
     * Standard user with Standard group permissions
     */
    standard: {
        handle: 'testuser',
        email: 'testuser@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
    },

    /**
     * Unverified user for testing email verification flows
     */
    unverified: {
        handle: 'testunverified',
        email: 'testunverified@test.local',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'Unverified',
        fullName: 'Test Unverified',
        verificationToken: 'test-verification-token-12345',
    },

    /**
     * Invalid credentials for testing failed login scenarios
     */
    invalid: {
        handle: 'nonexistent',
        email: 'nonexistent@test.local',
        password: 'WrongPassword!',
    },
};

export default TestUsers;
