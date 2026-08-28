-- =============================================================================
-- Test Database Schema
-- Generated from dev database: breakroom_dev
-- Generated at: 2026-08-28T17:30:41.599Z
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

DROP TABLE IF EXISTS `session_comments`;
DROP TABLE IF EXISTS `blog_comments`;
DROP TABLE IF EXISTS `haulonaut_pilot_inventory`;
DROP TABLE IF EXISTS `haulonaut_pilots`;
DROP TABLE IF EXISTS `haulonaut_visited_sectors`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `shortlist_sessions`;
DROP TABLE IF EXISTS `ticket_projects`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `game_settings`;
DROP TABLE IF EXISTS `game_users`;
DROP TABLE IF EXISTS `haulonaut_sector_features`;
DROP TABLE IF EXISTS `haulonaut_sector_links`;
DROP TABLE IF EXISTS `haulonaut_sectors`;
DROP TABLE IF EXISTS `notification_type_groups`;
DROP TABLE IF EXISTS `notification_type_users`;
DROP TABLE IF EXISTS `notification_types`;
DROP TABLE IF EXISTS `open_positions`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `scheduled_chat_messages`;
DROP TABLE IF EXISTS `session_ratings`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `shortlists`;
DROP TABLE IF EXISTS `ticket_comments`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `user_groups`;
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `user_post_last_read`;
DROP TABLE IF EXISTS `user_skills`;
DROP TABLE IF EXISTS `users_rooms`;
DROP TABLE IF EXISTS `account_deletion_requests`;
DROP TABLE IF EXISTS `analytics_feature_usage`;
DROP TABLE IF EXISTS `analytics_logins`;
DROP TABLE IF EXISTS `analytics_marketing_pageviews`;
DROP TABLE IF EXISTS `analytics_visits`;
DROP TABLE IF EXISTS `audio_defaults`;
DROP TABLE IF EXISTS `band_members`;
DROP TABLE IF EXISTS `band_setlists`;
DROP TABLE IF EXISTS `bands`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `breakroom_block_positions`;
DROP TABLE IF EXISTS `breakroom_blocks`;
DROP TABLE IF EXISTS `breakroom_updates`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_rooms`;
DROP TABLE IF EXISTS `collection_items`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `content_filter_keywords`;
DROP TABLE IF EXISTS `content_flags`;
DROP TABLE IF EXISTS `creation_logs`;
DROP TABLE IF EXISTS `custom_domains`;
DROP TABLE IF EXISTS `event_types`;
DROP TABLE IF EXISTS `feature_users`;
DROP TABLE IF EXISTS `features`;
DROP TABLE IF EXISTS `friends`;
DROP TABLE IF EXISTS `gallery_artworks`;
DROP TABLE IF EXISTS `game_admins`;
DROP TABLE IF EXISTS `game_instances`;
DROP TABLE IF EXISTS `games`;
DROP TABLE IF EXISTS `group_permissions`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `haulonaut_items`;
DROP TABLE IF EXISTS `instruments`;
DROP TABLE IF EXISTS `lyrics`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `song_collaborators`;
DROP TABLE IF EXISTS `songs`;
DROP TABLE IF EXISTS `system_emails`;
DROP TABLE IF EXISTS `user_blocks`;
DROP TABLE IF EXISTS `user_blog`;
DROP TABLE IF EXISTS `user_collections`;
DROP TABLE IF EXISTS `user_fcm_tokens`;
DROP TABLE IF EXISTS `user_gallery`;
DROP TABLE IF EXISTS `user_jobs`;
DROP TABLE IF EXISTS `user_payment_connect`;
DROP TABLE IF EXISTS `user_payment_customers`;
DROP TABLE IF EXISTS `user_settings`;
DROP TABLE IF EXISTS `user_shortcuts`;
DROP TABLE IF EXISTS `user_storefront`;
DROP TABLE IF EXISTS `user_subscriptions`;
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
  `password_reset_token` varchar(64) DEFAULT NULL,
  `password_reset_expires_at` timestamp NULL DEFAULT NULL,
  `is_flag_banned` tinyint(1) DEFAULT 0,
  `signup_platform` enum('web','android','ios') NOT NULL DEFAULT 'web',
  `is_internal` tinyint(1) NOT NULL DEFAULT 0,
  `signup_visitor_id` varchar(64) DEFAULT NULL,
  `real_user_number` int(11) DEFAULT NULL,
  `alternate_email` varchar(255) DEFAULT NULL,
  `alternate_email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `alternate_email_verification_token` varchar(64) DEFAULT NULL,
  `alternate_email_verification_expires_at` timestamp NULL DEFAULT NULL,
  `send_notices_to_alternate_email` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `handle` (`handle`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `real_user_number` (`real_user_number`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `platform` enum('google','apple','promo','stripe','square','paypal') NOT NULL,
  `platform_subscription_id` varchar(500) NOT NULL,
  `status` enum('active','cancelled','expired','grace_period') NOT NULL DEFAULT 'active',
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_storefront` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `store_url` varchar(100) DEFAULT NULL,
  `page_title` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `content` longtext DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `external_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `store_url` (`store_url`),
  KEY `idx_storefront_public` (`is_public`,`updated_at`),
  CONSTRAINT `user_storefront_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_settings` (
  `user_id` int(11) NOT NULL,
  `notifications_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `notify_chat_messages` tinyint(1) NOT NULL DEFAULT 1,
  `notify_friend_requests` tinyint(1) NOT NULL DEFAULT 1,
  `notify_blog_comments` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_payment_customers` (
  `user_id` int(11) NOT NULL,
  `processor` enum('stripe','square','paypal') NOT NULL,
  `processor_customer_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_payment_customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_payment_connect` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `processor` enum('stripe','square','paypal') NOT NULL,
  `processor_account_id` varchar(255) NOT NULL,
  `access_token_encrypted` text DEFAULT NULL,
  `refresh_token_encrypted` text DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `onboarding_complete` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_payment_connect_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `user_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `gallery_url` varchar(500) NOT NULL,
  `gallery_name` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_gallery_url` (`gallery_url`),
  UNIQUE KEY `idx_gallery_user_id` (`user_id`),
  KEY `idx_gallery_public` (`is_public`,`updated_at`),
  CONSTRAINT `user_gallery_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_fcm_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `fcm_token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`fcm_token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_fcm_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_collections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user_collections_user` (`user_id`),
  CONSTRAINT `user_collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blocker_user_id` int(11) NOT NULL,
  `blocked_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_blocks_unique` (`blocker_user_id`,`blocked_user_id`),
  KEY `blocked_user_id` (`blocked_user_id`),
  CONSTRAINT `user_blocks_ibfk_1` FOREIGN KEY (`blocker_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_blocks_ibfk_2` FOREIGN KEY (`blocked_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `songs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `status` enum('idea','writing','complete','recorded','released') DEFAULT 'idea',
  `visibility` enum('private','collaborators','public') DEFAULT 'private',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `song_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_songs_user_id` (`user_id`),
  KEY `idx_songs_visibility` (`visibility`,`created_at`),
  CONSTRAINT `songs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `song_collaborators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `song_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('viewer','editor') DEFAULT 'editor',
  `invited_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_song_collaborator` (`song_id`,`user_id`),
  KEY `invited_by` (`invited_by`),
  KEY `idx_song_collaborators_user_id` (`user_id`),
  CONSTRAINT `song_collaborators_ibfk_1` FOREIGN KEY (`song_id`) REFERENCES `songs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `song_collaborators_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `song_collaborators_ibfk_3` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_skills_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lyrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `song_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `section_type` enum('idea','verse','chorus','bridge','pre-chorus','hook','intro','outro','other') DEFAULT 'idea',
  `section_order` int(11) DEFAULT NULL,
  `mood` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('draft','in-progress','complete','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lyric_date` date DEFAULT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lyrics_user_id` (`user_id`),
  KEY `idx_lyrics_song_id` (`song_id`),
  KEY `idx_lyrics_song_order` (`song_id`,`section_order`),
  CONSTRAINT `lyrics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lyrics_ibfk_2` FOREIGN KEY (`song_id`) REFERENCES `songs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `instruments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `haulonaut_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_key` varchar(32) NOT NULL,
  `name` varchar(64) NOT NULL,
  `category` varchar(32) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_key` (`item_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_permissions` (
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`group_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `group_permissions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_key` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_key` (`game_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `game_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `status` enum('setup','active','ended') NOT NULL DEFAULT 'setup',
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_game_instances_game` (`game_id`),
  CONSTRAINT `game_instances_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `game_admins` (
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`game_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `game_admins_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `game_admins_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `gallery_artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(500) NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_artworks_user_id` (`user_id`),
  KEY `idx_gallery_artworks_published` (`user_id`,`is_published`,`created_at`),
  CONSTRAINT `gallery_artworks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friends` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `status` enum('pending','accepted','blocked') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `seen_by_recipient` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `idx_friends_friend_id` (`friend_id`),
  KEY `idx_friends_status` (`status`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `feature_key` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_key` (`feature_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feature_users` (
  `feature_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `added_method` enum('manual','random') DEFAULT 'manual',
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`feature_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feature_users_ibfk_1` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feature_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `custom_domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `status` enum('pending_dns','provisioning','active','failed','removing') NOT NULL DEFAULT 'pending_dns',
  `verification_attempts` int(11) NOT NULL DEFAULT 0,
  `last_checked_at` timestamp NULL DEFAULT NULL,
  `error_message` varchar(500) DEFAULT NULL,
  `activated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_custom_domains_domain` (`domain`),
  KEY `user_id` (`user_id`),
  KEY `idx_custom_domains_status` (`status`),
  CONSTRAINT `custom_domains_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `creation_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference_table` varchar(64) NOT NULL,
  `reference_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `device_type` varchar(32) DEFAULT NULL,
  `browser_name` varchar(64) DEFAULT NULL,
  `browser_version` varchar(32) DEFAULT NULL,
  `os_name` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cl_reference` (`reference_table`,`reference_id`),
  KEY `idx_cl_user` (`user_id`),
  KEY `idx_cl_created_at` (`created_at`),
  CONSTRAINT `creation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `content_flags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_type` varchar(50) NOT NULL,
  `content_id` int(11) DEFAULT NULL,
  `content_author_id` int(11) DEFAULT NULL,
  `flagged_by_user_id` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','restored') DEFAULT 'pending',
  `reviewed_by_user_id` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reviewed_by_user_id` (`reviewed_by_user_id`),
  KEY `idx_flags_content` (`content_type`,`content_id`),
  KEY `idx_flags_status` (`status`),
  KEY `idx_flags_author` (`content_author_id`),
  KEY `idx_flags_flagged_by` (`flagged_by_user_id`),
  KEY `idx_flags_created_at` (`created_at`),
  CONSTRAINT `content_flags_ibfk_1` FOREIGN KEY (`flagged_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `content_flags_ibfk_2` FOREIGN KEY (`content_author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `content_flags_ibfk_3` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `content_filter_keywords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `keyword` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_keywords_keyword` (`keyword`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `collection_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `collection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price_cents` int(11) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 0,
  `shipping_cost_cents` int(11) DEFAULT NULL,
  `weight_oz` decimal(8,2) DEFAULT NULL,
  `length_in` decimal(8,2) DEFAULT NULL,
  `width_in` decimal(8,2) DEFAULT NULL,
  `height_in` decimal(8,2) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `in_gallery` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_collection_id` (`collection_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `collection_items_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `user_collections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `owner_id` int(11) DEFAULT NULL,
  `discoverable` tinyint(1) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `type` enum('room','dm') NOT NULL DEFAULT 'room',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_chat_rooms_owner_id` (`owner_id`),
  KEY `idx_chat_rooms_type` (`type`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` timestamp NULL DEFAULT NULL,
  `is_scheduled` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_chat_messages_room_id` (`room_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=299 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `breakroom_updates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commit_hash` varchar(40) DEFAULT NULL,
  `summary` text NOT NULL,
  `platform` enum('all','ios','android') NOT NULL DEFAULT 'all',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=515 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `breakroom_block_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `block_id` int(11) NOT NULL,
  `col_count` tinyint(4) NOT NULL,
  `x` int(11) NOT NULL DEFAULT 0,
  `y` int(11) NOT NULL DEFAULT 0,
  `w` int(11) NOT NULL,
  `h` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_block_col` (`block_id`,`col_count`),
  CONSTRAINT `breakroom_block_positions_ibfk_1` FOREIGN KEY (`block_id`) REFERENCES `breakroom_blocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=474 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` mediumtext NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_blog_posts_user_id` (`user_id`),
  KEY `idx_blog_posts_created_at` (`created_at`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_bands_created_by` (`created_by`),
  CONSTRAINT `fk_bands_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `band_setlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `band_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `songs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`songs`)),
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_band_setlists_created_by` (`created_by`),
  KEY `idx_band_setlists_band` (`band_id`),
  CONSTRAINT `fk_band_setlists_band` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_band_setlists_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `band_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `band_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('owner','member') NOT NULL DEFAULT 'member',
  `status` enum('active','invited','declined') NOT NULL DEFAULT 'invited',
  `invited_by` int(11) DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_band_member` (`band_id`,`user_id`),
  KEY `fk_band_members_user` (`user_id`),
  KEY `fk_band_members_invited_by` (`invited_by`),
  CONSTRAINT `fk_band_members_band` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_band_members_invited_by` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_band_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `audio_defaults` (
  `user_id` int(11) NOT NULL,
  `echo_cancellation` tinyint(1) NOT NULL DEFAULT 0,
  `noise_suppression` tinyint(1) NOT NULL DEFAULT 0,
  `auto_gain_control` tinyint(1) NOT NULL DEFAULT 0,
  `playback_volume` decimal(3,2) NOT NULL DEFAULT 0.75,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `audio_defaults_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `analytics_visits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(64) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `platform` enum('web','android','ios') NOT NULL DEFAULT 'web',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_visits_created` (`created_at`),
  KEY `idx_visits_platform` (`platform`),
  CONSTRAINT `analytics_visits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `analytics_marketing_pageviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page` varchar(64) NOT NULL,
  `visitor_id` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_marketing_pageviews_created` (`created_at`),
  KEY `idx_marketing_pageviews_page` (`page`),
  KEY `idx_marketing_pageviews_visitor` (`visitor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `analytics_logins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `platform` enum('web','android','ios') NOT NULL DEFAULT 'web',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_logins_created` (`created_at`),
  CONSTRAINT `analytics_logins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `analytics_feature_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `feature` varchar(64) NOT NULL,
  `visitor_id` varchar(64) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `platform` enum('web','android','ios') NOT NULL DEFAULT 'web',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_feature_usage_created` (`created_at`),
  KEY `idx_feature_usage_feature` (`feature`),
  KEY `idx_feature_usage_platform` (`platform`),
  CONSTRAINT `analytics_feature_usage_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `account_deletion_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','processed','cancelled') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_deletion_requests_user_id` (`user_id`),
  KEY `idx_deletion_requests_status` (`status`),
  CONSTRAINT `account_deletion_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users_rooms` (
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `role` enum('member','moderator') DEFAULT 'member',
  `invited_by` int(11) DEFAULT NULL,
  `accepted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_read_at` timestamp NULL DEFAULT NULL,
  `notifications_muted` tinyint(1) NOT NULL DEFAULT 0,
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_post_last_read` (
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `last_read_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `user_post_last_read_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_post_last_read_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ticket_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_ticket_comments_ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_comments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shortlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `band_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_shortlists_band_id` (`band_id`),
  CONSTRAINT `shortlists_ibfk_1` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shortlists_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `s3_key` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_at` date DEFAULT NULL,
  `session_type` enum('band','individual') NOT NULL DEFAULT 'band',
  `instrument_id` int(11) DEFAULT NULL,
  `band_id` int(11) DEFAULT NULL,
  `normalized` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_sessions_instrument` (`instrument_id`),
  KEY `fk_sessions_band` (`band_id`),
  CONSTRAINT `fk_sessions_band` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sessions_instrument` FOREIGN KEY (`instrument_id`) REFERENCES `instruments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `session_ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_session` (`session_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `session_ratings_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_ratings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `scheduled_chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `warning_minutes` int(11) NOT NULL DEFAULT 10,
  `indicator_text` varchar(255) DEFAULT '- sent via scheduled message',
  `status` enum('pending','warning_sent','confirmed','sent','cancelled') NOT NULL DEFAULT 'pending',
  `is_editing` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `scheduled_chat_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scheduled_chat_messages_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `collection_item_id` int(11) NOT NULL,
  `seller_user_id` int(11) NOT NULL,
  `buyer_name` varchar(255) NOT NULL,
  `buyer_email` varchar(255) NOT NULL,
  `ship_to_name` varchar(255) NOT NULL,
  `ship_to_address1` varchar(255) NOT NULL,
  `ship_to_address2` varchar(255) DEFAULT NULL,
  `ship_to_city` varchar(100) NOT NULL,
  `ship_to_state` varchar(100) NOT NULL,
  `ship_to_zip` varchar(20) NOT NULL,
  `ship_to_country` varchar(100) NOT NULL DEFAULT 'US',
  `item_price_cents` int(11) NOT NULL,
  `shipping_cost_cents` int(11) NOT NULL DEFAULT 0,
  `platform_fee_cents` int(11) NOT NULL DEFAULT 0,
  `total_cents` int(11) NOT NULL,
  `payment_processor` enum('stripe','square','paypal') NOT NULL DEFAULT 'stripe',
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `payment_connected_account_id` varchar(255) DEFAULT NULL,
  `status` enum('pending_payment','paid','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending_payment',
  `tracking_number` varchar(255) DEFAULT NULL,
  `tracking_carrier` varchar(100) DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_order_item` (`collection_item_id`),
  KEY `fk_order_seller` (`seller_user_id`),
  CONSTRAINT `fk_order_item` FOREIGN KEY (`collection_item_id`) REFERENCES `collection_items` (`id`),
  CONSTRAINT `fk_order_seller` FOREIGN KEY (`seller_user_id`) REFERENCES `users` (`id`)
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
  `employment_type` enum('full-time','part-time','contract','internship','temporary','prospecting') DEFAULT 'full-time',
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `haulonaut_sectors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_instance_id` int(11) NOT NULL,
  `sector_number` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_haulonaut_sector` (`game_instance_id`,`sector_number`),
  CONSTRAINT `haulonaut_sectors_ibfk_1` FOREIGN KEY (`game_instance_id`) REFERENCES `game_instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `haulonaut_sector_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_instance_id` int(11) NOT NULL,
  `from_sector_id` int(11) NOT NULL,
  `to_sector_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_haulonaut_link` (`from_sector_id`,`to_sector_id`),
  KEY `to_sector_id` (`to_sector_id`),
  KEY `idx_haulonaut_links_instance` (`game_instance_id`),
  CONSTRAINT `haulonaut_sector_links_ibfk_1` FOREIGN KEY (`game_instance_id`) REFERENCES `game_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `haulonaut_sector_links_ibfk_2` FOREIGN KEY (`from_sector_id`) REFERENCES `haulonaut_sectors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `haulonaut_sector_links_ibfk_3` FOREIGN KEY (`to_sector_id`) REFERENCES `haulonaut_sectors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9295 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `haulonaut_sector_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sector_id` int(11) NOT NULL,
  `feature_type` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sector_features_sector` (`sector_id`),
  KEY `idx_sector_features_type` (`feature_type`),
  CONSTRAINT `haulonaut_sector_features_ibfk_1` FOREIGN KEY (`sector_id`) REFERENCES `haulonaut_sectors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `game_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_instance_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `visitor_id` varchar(64) DEFAULT NULL,
  `display_name` varchar(64) NOT NULL,
  `status` enum('active','dead','abandoned') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_played_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `died_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_game_users_instance_user` (`game_instance_id`,`user_id`),
  KEY `idx_game_users_instance_visitor` (`game_instance_id`,`visitor_id`),
  CONSTRAINT `game_users_ibfk_1` FOREIGN KEY (`game_instance_id`) REFERENCES `game_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `game_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `game_settings` (
  `game_user_id` int(11) NOT NULL,
  `setting_key` varchar(64) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`game_user_id`,`setting_key`),
  CONSTRAINT `game_settings_ibfk_1` FOREIGN KEY (`game_user_id`) REFERENCES `game_users` (`id`) ON DELETE CASCADE
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ticket_projects` (
  `ticket_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  PRIMARY KEY (`ticket_id`,`project_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `ticket_projects_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shortlist_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shortlist_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `added_by` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_shortlist_session` (`shortlist_id`,`session_id`),
  KEY `added_by` (`added_by`),
  KEY `idx_shortlist_sessions_session_id` (`session_id`),
  CONSTRAINT `shortlist_sessions_ibfk_1` FOREIGN KEY (`shortlist_id`) REFERENCES `shortlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shortlist_sessions_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shortlist_sessions_ibfk_3` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `haulonaut_visited_sectors` (
  `game_user_id` int(11) NOT NULL,
  `sector_id` int(11) NOT NULL,
  `first_visited_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_visited_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`game_user_id`,`sector_id`),
  KEY `idx_visited_sectors_sector` (`sector_id`),
  CONSTRAINT `haulonaut_visited_sectors_ibfk_1` FOREIGN KEY (`game_user_id`) REFERENCES `game_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `haulonaut_visited_sectors_ibfk_2` FOREIGN KEY (`sector_id`) REFERENCES `haulonaut_sectors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `haulonaut_pilots` (
  `game_user_id` int(11) NOT NULL,
  `current_sector_id` int(11) NOT NULL,
  `credits` int(11) NOT NULL DEFAULT 1000,
  `rations` int(11) NOT NULL DEFAULT 100,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`game_user_id`),
  KEY `idx_haulonaut_pilots_sector` (`current_sector_id`),
  CONSTRAINT `haulonaut_pilots_ibfk_1` FOREIGN KEY (`game_user_id`) REFERENCES `game_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `haulonaut_pilots_ibfk_2` FOREIGN KEY (`current_sector_id`) REFERENCES `haulonaut_sectors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `haulonaut_pilot_inventory` (
  `game_user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`game_user_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `haulonaut_pilot_inventory_ibfk_1` FOREIGN KEY (`game_user_id`) REFERENCES `game_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `haulonaut_pilot_inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `haulonaut_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blog_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_blog_comments_post_id` (`blog_post_id`),
  KEY `idx_blog_comments_user_id` (`user_id`),
  KEY `idx_blog_comments_parent_id` (`parent_id`),
  KEY `idx_blog_comments_created_at` (`created_at`),
  CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `session_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_session_comments_session_id` (`session_id`),
  CONSTRAINT `session_comments_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `session_comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `session_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
