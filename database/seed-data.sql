-- BreakTest Seed Data
-- Contains required system data and test users with known credentials

-- ======================
-- System Data (Required)
-- ======================

-- Permission Groups
INSERT INTO `groups` (name, description) VALUES
  ('Administrator', 'Can perform all actions'),
  ('Group Leader', 'Can manage self and other group members'),
  ('Billing Manager', 'Can manage billing'),
  ('Standard', 'Can interact with social network'),
  ('Restricted', 'Limited interaction with social network');

-- Permissions
INSERT INTO permissions (name, description) VALUES
  ('create_user', 'Ability to create new users'),
  ('read_user', 'Ability to read user information'),
  ('update_user', 'Ability to update users'),
  ('delete_user', 'Ability to delete user'),
  ('create_group', 'Ability to create new groups'),
  ('read_group', 'Ability to view group information'),
  ('update_group', 'Ability to modify group details'),
  ('delete_group', 'Ability to remove groups'),
  ('create_billing', 'Ability to create billing methods'),
  ('read_billing', 'Ability to view billing information'),
  ('update_billing', 'Ability to update billing details'),
  ('delete_billing', 'Ability to remove billing methods'),
  ('create_post', 'Ability to create new posts'),
  ('read_post', 'Ability to read posts'),
  ('update_post', 'Ability to edit posts'),
  ('delete_post', 'Ability to delete posts'),
  ('create_approved_post', 'Ability to create approved posts'),
  ('read_approved_post', 'Ability to view approved posts'),
  ('update_approved_post', 'Ability to edit approved posts'),
  ('delete_approved_post', 'Ability to delete approved posts');

-- Group-Permission Assignments
-- Administrator: Full access to user management
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p
WHERE g.name = 'Administrator' AND p.name IN ('create_user', 'read_user', 'update_user', 'delete_user');

-- Group Leader: Manage groups
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p
WHERE g.name = 'Group Leader' AND p.name IN ('create_group', 'read_group', 'update_group', 'delete_group');

-- Billing Manager: Manage billing
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p
WHERE g.name = 'Billing Manager' AND p.name IN ('create_billing', 'read_billing', 'update_billing', 'delete_billing');

-- Standard: Social network access
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p
WHERE g.name = 'Standard' AND p.name IN ('create_post', 'read_post', 'update_post', 'delete_post');

-- Restricted: Limited access
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p
WHERE g.name = 'Restricted' AND p.name IN ('create_approved_post', 'read_approved_post', 'update_approved_post', 'delete_approved_post');

-- Default Chat Room
INSERT INTO chat_rooms (name, description) VALUES
  ('General', 'The main chat room for all users');

-- System Email Templates
INSERT INTO system_emails (email_key, from_address, subject, html_content) VALUES
  ('signup_verification', 'noreply@prosaurus.com', 'Verify your Breakroom account',
   '<h1>Welcome to Breakroom!</h1><p>Please verify your email by clicking the link below:</p><p><a href="https://local.prosaurus.com/verify?token={{verification_token}}">Verify Email</a></p>'),
  ('password_reset', 'noreply@prosaurus.com', 'Reset Your Breakroom Password',
   '<p>Click the link to reset your password: <a href="https://local.prosaurus.com/reset-password?token={{reset_token}}">Reset Password</a></p>');

-- ======================
-- Test Users
-- ======================
-- All test users use the password: TestPassword123!
-- Hash is SHA-256(password + salt) as hex string

-- Test Admin User
-- Password: TestPassword123!
-- Salt: testsalt_admin_00000000000
-- Hash: SHA-256("TestPassword123!" + "testsalt_admin_00000000000")
INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt) VALUES
  ('testadmin', 'Test', 'Admin', 'testadmin@test.local', TRUE,
   'PLACEHOLDER_HASH_ADMIN', 'testsalt_admin_00000000000');

-- Test Standard User
-- Password: TestPassword123!
INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt) VALUES
  ('testuser', 'Test', 'User', 'testuser@test.local', TRUE,
   'PLACEHOLDER_HASH_USER', 'testsalt_user_000000000000');

-- Test Unverified User (for testing verification flow)
-- Password: TestPassword123!
INSERT INTO users (handle, first_name, last_name, email, email_verified, verification_token, verification_expires_at, hash, salt) VALUES
  ('testunverified', 'Test', 'Unverified', 'testunverified@test.local', FALSE,
   'test-verification-token-12345', DATE_ADD(NOW(), INTERVAL 1 HOUR),
   'PLACEHOLDER_HASH_UNVERIFIED', 'testsalt_unverified_000000');

-- Assign users to groups
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u, `groups` g
WHERE u.handle = 'testadmin' AND g.name = 'Administrator';

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u, `groups` g
WHERE u.handle = 'testuser' AND g.name = 'Standard';

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u, `groups` g
WHERE u.handle = 'testunverified' AND g.name = 'Restricted';

-- Add test users to the General chat room (required for badge counts to work)
INSERT INTO users_rooms (user_id, room_id, accepted)
SELECT u.id, cr.id, true
FROM users u, chat_rooms cr
WHERE u.handle IN ('testadmin', 'testuser')
AND cr.name = 'General';

-- Create default breakroom blocks for test users
INSERT INTO breakroom_blocks (user_id, block_type, content_id, x, y, w, h, title)
SELECT u.id, 'chat', (SELECT id FROM chat_rooms WHERE name = 'General'), 0, 0, 2, 2, NULL
FROM users u WHERE u.handle IN ('testadmin', 'testuser');

INSERT INTO breakroom_blocks (user_id, block_type, content_id, x, y, w, h, title)
SELECT u.id, 'blog', NULL, 2, 0, 2, 2, NULL
FROM users u WHERE u.handle IN ('testadmin', 'testuser');

INSERT INTO breakroom_blocks (user_id, block_type, content_id, x, y, w, h, title)
SELECT u.id, 'weather', NULL, 4, 0, 1, 2, NULL
FROM users u WHERE u.handle IN ('testadmin', 'testuser');

-- Create user blog settings for test users
INSERT INTO user_blog (user_id, blog_url, blog_name)
SELECT id, handle, CONCAT(handle, '''s Blog') FROM users WHERE handle IN ('testadmin', 'testuser');

-- Set bio for test users (bio column is on users table)
UPDATE users SET bio = 'Test user for automated testing' WHERE handle IN ('testadmin', 'testuser', 'testunverified');

-- Shortcuts for test users (enables drawer navigation to Sessions/Collections in Android tests)
INSERT INTO user_shortcuts (user_id, name, url, sort_order)
SELECT u.id, 'Sessions', '/sessions', 1 FROM users u WHERE u.handle IN ('testadmin', 'testuser');

INSERT INTO user_shortcuts (user_id, name, url, sort_order)
SELECT u.id, 'Collections', '/collections', 2 FROM users u WHERE u.handle IN ('testadmin', 'testuser');

-- ======================
-- EULA System Data
-- ======================

-- Event type for EULA acceptance requirement
INSERT INTO event_types (type, description) VALUES
  ('eula_required', 'User must accept the EULA before using the service');

-- Notification type linked to the EULA event
INSERT INTO notification_types (name, description, display_type, event_id, repeat_rule, is_active)
SELECT 'EULA Acceptance Required', 'Please accept the End User License Agreement to continue.', 'popup', id, 'once', 1
FROM event_types WHERE type = 'eula_required';

-- Pre-accept EULA for test users so they are not blocked by the EULA screen during tests
INSERT INTO notifications (notif_id, user_id, status)
SELECT nt.id, u.id, 'dismissed'
FROM notification_types nt
JOIN event_types et ON nt.event_id = et.id
JOIN users u ON u.handle IN ('testadmin', 'testuser')
WHERE et.type = 'eula_required';

-- ======================
-- Games / Haulonaut Test Data
-- ======================
-- A minimal, deterministic 2-sector universe so e2e tests don't depend on
-- the 1000-sector random generator. Both sectors carry the same trading
-- outpost so the outpost flow is reachable regardless of which sector a
-- freshly-created character spawns into (spawn sector is chosen at random
-- by the app, same as production).

INSERT INTO features (feature_key, name, description, is_active) VALUES
  ('games', 'Games', 'Access to the Games section', 1);

INSERT INTO feature_users (feature_id, user_id, added_method)
SELECT f.id, u.id, 'manual'
FROM features f, users u
WHERE f.feature_key = 'games' AND u.handle IN ('testadmin', 'testuser');

INSERT INTO games (game_key, name, description, is_active) VALUES
  ('haulonaut', 'Haulonaut', 'A text-based space trading and exploration game in the Trade Wars / BBS door-game tradition. Haul cargo, chart a universe of sectors, and make (or lose) your fortune.', 1);

INSERT INTO haulonaut_items (item_key, name, category, description, base_price) VALUES
  ('rations', 'Rations', 'consumable', 'Feeds your crew. Every warp burns a little.', 4),
  ('fuel', 'Fuel Cell', 'consumable', 'Extra reserve fuel.', 6),
  ('hull_plating', 'Hull Plating', 'equipment', 'Reinforces your ship''s hull.', 180),
  ('shield_generator', 'Shield Generator', 'equipment', 'Basic deflector shielding.', 400),
  ('laser_cannon', 'Laser Cannon', 'weapon', 'A modest offensive weapon.', 250);

INSERT INTO game_instances (game_id, name, status, started_at)
SELECT id, 'Test Universe', 'active', NOW() FROM games WHERE game_key = 'haulonaut';

INSERT INTO haulonaut_sectors (game_instance_id, sector_number, description)
SELECT gi.id, n.sector_number, n.description
FROM game_instances gi
JOIN games g ON g.id = gi.game_id
CROSS JOIN (
  SELECT 1 AS sector_number, 'A quiet test sector. Nothing much happens here.' AS description
  UNION ALL
  SELECT 2, 'Another quiet test sector, much like the first.'
) n
WHERE g.game_key = 'haulonaut' AND gi.name = 'Test Universe';

INSERT INTO haulonaut_sector_links (game_instance_id, from_sector_id, to_sector_id)
SELECT s1.game_instance_id, s1.id, s2.id
FROM haulonaut_sectors s1
JOIN haulonaut_sectors s2 ON s2.game_instance_id = s1.game_instance_id
JOIN game_instances gi ON gi.id = s1.game_instance_id
JOIN games g ON g.id = gi.game_id
WHERE g.game_key = 'haulonaut' AND gi.name = 'Test Universe'
  AND s1.sector_number = 1 AND s2.sector_number = 2;

INSERT INTO haulonaut_sector_links (game_instance_id, from_sector_id, to_sector_id)
SELECT s1.game_instance_id, s1.id, s2.id
FROM haulonaut_sectors s1
JOIN haulonaut_sectors s2 ON s2.game_instance_id = s1.game_instance_id
JOIN game_instances gi ON gi.id = s1.game_instance_id
JOIN games g ON g.id = gi.game_id
WHERE g.game_key = 'haulonaut' AND gi.name = 'Test Universe'
  AND s1.sector_number = 2 AND s2.sector_number = 1;

INSERT INTO haulonaut_sector_features (sector_id, feature_type, name, description)
SELECT hs.id, 'trading_outpost', 'Test Outpost', 'A small trading post for automated testing.'
FROM haulonaut_sectors hs
JOIN game_instances gi ON gi.id = hs.game_instance_id
JOIN games g ON g.id = gi.game_id
WHERE g.game_key = 'haulonaut' AND gi.name = 'Test Universe';
