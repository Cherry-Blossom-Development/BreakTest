-- =============================================================================
-- Test Database Schema
-- Generated from production database: breakroom
-- Generated at: 2026-01-24T18:38:11.789Z
--
-- Blacklisted tables (not included):
--   - test_cases
--   - test_runs
--   - test_suites
-- =============================================================================

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- Drop existing tables (in reverse dependency order)
-- =============================================================================

DROP TABLE IF EXISTS `blog_comments`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `ticket_projects`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `notification_type_groups`;
DROP TABLE IF EXISTS `notification_type_users`;
DROP TABLE IF EXISTS `notification_types`;
DROP TABLE IF EXISTS `open_positions`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `user_groups`;
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `user_skills`;
DROP TABLE IF EXISTS `users_rooms`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `breakroom_blocks`;
DROP TABLE IF EXISTS `breakroom_updates`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_rooms`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `event_types`;
DROP TABLE IF EXISTS `friends`;
DROP TABLE IF EXISTS `group_permissions`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `system_emails`;
DROP TABLE IF EXISTS `user_blog`;
DROP TABLE IF EXISTS `user_jobs`;
DROP TABLE IF EXISTS `user_shortcuts`;
DROP TABLE IF EXISTS `users`;

-- =============================================================================
-- Create tables (in dependency order)
-- =============================================================================

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `handle` varchar(32) NOT NULL,
  `first_name` varchar(32) DEFAULT NULL,
  `last_name` varchar(32) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(64) DEFAULT NULL,
  `verification_expires_at` timestamp NULL DEFAULT NULL,
  `hash` varchar(64) DEFAULT NULL,
  `salt` varchar(32) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `work_bio` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `handle` (`handle`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_shortcuts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `url` varchar(512) NOT NULL,
  `icon` varchar(32) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_shortcuts_user` (`user_id`),
  KEY `idx_user_shortcuts_order` (`user_id`,`sort_order`),
  CONSTRAINT `user_shortcuts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `company` varchar(150) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_jobs_user_id` (`user_id`),
  KEY `idx_user_jobs_start_date` (`start_date`),
  CONSTRAINT `user_jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_blog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `blog_url` varchar(500) NOT NULL,
  `blog_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blog_url` (`blog_url`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_blog_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `system_emails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_key` varchar(64) NOT NULL,
  `from_address` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `html_content` text NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_key` (`email_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_skills_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_permissions` (
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`group_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `group_permissions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friends` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `status` enum('pending','accepted','blocked') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `idx_friends_friend_id` (`friend_id`),
  KEY `idx_friends_status` (`status`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `chat_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `owner_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_chat_rooms_owner_id` (`owner_id`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_chat_messages_room_id` (`room_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `breakroom_updates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commit_hash` varchar(40) DEFAULT NULL,
  `summary` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `breakroom_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `block_type` varchar(32) NOT NULL,
  `content_id` int(11) DEFAULT NULL,
  `x` int(11) NOT NULL DEFAULT 0,
  `y` int(11) NOT NULL DEFAULT 0,
  `w` int(11) NOT NULL DEFAULT 1,
  `h` int(11) NOT NULL DEFAULT 1,
  `title` varchar(64) DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_breakroom_blocks_user` (`user_id`),
  CONSTRAINT `breakroom_blocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_blog_posts_user_id` (`user_id`),
  KEY `idx_blog_posts_created_at` (`created_at`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users_rooms` (
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `role` enum('member','moderator') DEFAULT 'member',
  `invited_by` int(11) DEFAULT NULL,
  `accepted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`room_id`),
  KEY `invited_by` (`invited_by`),
  KEY `idx_users_rooms_room_id` (`room_id`),
  CONSTRAINT `users_rooms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_rooms_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_rooms_ibfk_3` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_skill` (`user_id`,`skill_id`),
  KEY `skill_id` (`skill_id`),
  KEY `idx_user_skills_user_id` (`user_id`),
  CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_permissions` (
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_groups` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `user_groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('open','backlog','on-deck','in_progress','resolved','closed') DEFAULT 'backlog',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `creator_id` (`creator_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_public` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_projects_company_id` (`company_id`),
  KEY `idx_projects_company_default` (`company_id`,`is_default`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `open_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `location_type` enum('remote','onsite','hybrid') DEFAULT 'onsite',
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `employment_type` enum('full-time','part-time','contract','internship','temporary') DEFAULT 'full-time',
  `pay_rate_min` decimal(12,2) DEFAULT NULL,
  `pay_rate_max` decimal(12,2) DEFAULT NULL,
  `pay_type` enum('hourly','salary','commission','negotiable') DEFAULT 'salary',
  `requirements` text DEFAULT NULL,
  `benefits` text DEFAULT NULL,
  `status` enum('open','closed','filled') DEFAULT 'open',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `open_positions_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `open_positions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notification_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `display_type` enum('header','popup') DEFAULT 'header',
  `event_id` int(11) DEFAULT NULL,
  `repeat_rule` varchar(32) DEFAULT 'forever',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notification_types_event` (`event_id`),
  KEY `idx_notification_types_active` (`is_active`),
  CONSTRAINT `notification_types_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification_type_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_type_id` int(11) NOT NULL,
  `target_type` enum('trigger_user','trigger_user_friends') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_target` (`notification_type_id`,`target_type`),
  CONSTRAINT `notification_type_users_ibfk_1` FOREIGN KEY (`notification_type_id`) REFERENCES `notification_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification_type_groups` (
  `notification_type_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`notification_type_id`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `notification_type_groups_ibfk_1` FOREIGN KEY (`notification_type_id`) REFERENCES `notification_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notification_type_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `data_json` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_events_type` (`type_id`),
  KEY `idx_events_user` (`user_id`),
  KEY `idx_events_time` (`time`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `event_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `is_owner` tinyint(1) DEFAULT 0,
  `is_admin` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive','pending') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_company` (`user_id`,`company_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ticket_projects` (
  `ticket_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  PRIMARY KEY (`ticket_id`,`project_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `ticket_projects_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notif_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('unviewed','viewed','dismissed') DEFAULT 'unviewed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_status` (`user_id`,`status`),
  KEY `idx_notifications_notif` (`notif_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`notif_id`) REFERENCES `notification_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blog_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_blog_comments_post_id` (`blog_post_id`),
  KEY `idx_blog_comments_user_id` (`user_id`),
  KEY `idx_blog_comments_parent_id` (`parent_id`),
  KEY `idx_blog_comments_created_at` (`created_at`),
  CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
