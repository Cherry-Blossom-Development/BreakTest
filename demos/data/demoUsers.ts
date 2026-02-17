/**
 * Demo User Credentials
 *
 * These users are created in the breakroom_test database
 * specifically for demo recordings.
 */

export const DEMO_USERS = {
    // Primary user - the one being recorded/demonstrated
    primary: {
        handle: 'DemoUser',
        email: 'demo@test.local',
        password: 'DemoPass123',
        firstName: 'Demo',
        lastName: 'User',
        salt: 'demosalt_primary_0000000',
    },

    // External users for simulating interactions
    sarah: {
        handle: 'Sarah',
        email: 'sarah@test.local',
        password: 'DemoPass123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        salt: 'demosalt_sarah_00000000',
    },

    mike: {
        handle: 'Mike',
        email: 'mike@test.local',
        password: 'DemoPass123',
        firstName: 'Mike',
        lastName: 'Chen',
        salt: 'demosalt_mike_000000000',
    },

    alex: {
        handle: 'Alex',
        email: 'alex@test.local',
        password: 'DemoPass123',
        firstName: 'Alex',
        lastName: 'Rivera',
        salt: 'demosalt_alex_000000000',
    },
};

export const DEMO_CHAT_ROOMS = {
    teamChat: {
        name: 'Team Chat',
        description: 'Team discussion room',
    },
    projectUpdates: {
        name: 'Project Updates',
        description: 'Project status and updates',
    },
};

export default DEMO_USERS;
