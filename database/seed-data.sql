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
