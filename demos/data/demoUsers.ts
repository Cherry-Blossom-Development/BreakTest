/**
 * Demo User Credentials
 *
 * Dedicated demo users with their own chat rooms.
 * These users only see demo content, no live user data.
 */

export const DEMO_USERS = {
    // Primary user - the one being recorded/demonstrated
    primary: {
        handle: 'sarah_chen',
        email: 'sarah.chen@demo.breakroom.app',
        password: 'Welcome1',
        firstName: 'Sarah',
        lastName: 'Chen',
    },

    // External users for simulating interactions
    mike: {
        handle: 'mike_torres',
        email: 'mike.torres@demo.breakroom.app',
        password: 'Welcome1',
        firstName: 'Mike',
        lastName: 'Torres',
    },

    emma: {
        handle: 'emma_wilson',
        email: 'emma.wilson@demo.breakroom.app',
        password: 'Welcome1',
        firstName: 'Emma',
        lastName: 'Wilson',
    },
};

export const DEMO_CHAT_ROOMS = {
    demoTeam: {
        name: 'Demo Team',
        description: 'Our team chat for demos',
    },
    coffeeBreak: {
        name: 'Coffee Break',
        description: 'Casual conversations',
    },
};

export default DEMO_USERS;
