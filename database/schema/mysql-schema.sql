/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `appointment_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointment_bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint(20) unsigned NOT NULL,
  `customer_id` bigint(20) unsigned NOT NULL,
  `invoice` varchar(14) DEFAULT NULL,
  `appointment_session_id` bigint(20) unsigned DEFAULT NULL,
  `session_name` varchar(255) DEFAULT NULL,
  `price_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_type` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'cash',
  `status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_bookings_appointment_id_customer_id_unique` (`appointment_id`,`customer_id`),
  UNIQUE KEY `appointment_bookings_invoice_unique` (`invoice`),
  KEY `appointment_bookings_customer_id_foreign` (`customer_id`),
  KEY `appointment_bookings_appointment_id_status_index` (`appointment_id`,`status`),
  CONSTRAINT `appointment_bookings_appointment_id_foreign` FOREIGN KEY (`appointment_id`) REFERENCES `pilates_appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_bookings_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `appointment_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointment_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `session_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `default_price_drop_in` decimal(12,2) NOT NULL DEFAULT 0.00,
  `default_price_credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `default_payment_method` enum('credit_only','allow_drop_in') NOT NULL DEFAULT 'allow_drop_in',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `appointment_trainer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointment_trainer` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pilates_appointment_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_trainer_pilates_appointment_id_trainer_id_unique` (`pilates_appointment_id`,`trainer_id`),
  KEY `appointment_trainer_trainer_id_foreign` (`trainer_id`),
  CONSTRAINT `appointment_trainer_pilates_appointment_id_foreign` FOREIGN KEY (`pilates_appointment_id`) REFERENCES `pilates_appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_trainer_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cashier_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL,
  `price` bigint(20) NOT NULL,
  `hold_id` varchar(255) DEFAULT NULL,
  `hold_label` varchar(255) DEFAULT NULL,
  `held_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_product_id_foreign` (`product_id`),
  KEY `carts_hold_id_index` (`hold_id`),
  KEY `carts_cashier_id_hold_id_index` (`cashier_id`,`hold_id`),
  CONSTRAINT `carts_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `carts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cash_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cash_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cashier_id` bigint(20) unsigned NOT NULL,
  `category` enum('in','out') NOT NULL,
  `transaction_category` varchar(255) NOT NULL DEFAULT 'UANG LAIN LAIN',
  `description` varchar(255) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cash_entries_cashier_id_foreign` (`cashier_id`),
  CONSTRAINT `cash_entries_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `class_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `no_telp` bigint(20) NOT NULL,
  `address` text NOT NULL,
  `gender` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_user_id_foreign` (`user_id`),
  CONSTRAINT `customers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `landing_page_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `landing_page_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hero_background_image` varchar(255) DEFAULT NULL,
  `schedule_background_image` varchar(255) DEFAULT NULL,
  `classes_background_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `membership_plan_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `membership_plan_classes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `membership_plan_id` bigint(20) unsigned NOT NULL,
  `pilates_class_id` bigint(20) unsigned NOT NULL,
  `credit_cost` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mpc_plan_class_uq` (`membership_plan_id`,`pilates_class_id`),
  KEY `membership_plan_classes_pilates_class_id_foreign` (`pilates_class_id`),
  CONSTRAINT `membership_plan_classes_membership_plan_id_foreign` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membership_plan_classes_pilates_class_id_foreign` FOREIGN KEY (`pilates_class_id`) REFERENCES `pilates_classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `membership_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `membership_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `credits` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `valid_days` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `order_position` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payment_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `default_gateway` varchar(255) NOT NULL DEFAULT 'cash',
  `qris_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `qris_full_name` varchar(255) DEFAULT NULL,
  `qris_image` varchar(255) DEFAULT NULL,
  `bank_transfer_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_account_name` varchar(255) DEFAULT NULL,
  `bank_account_number` varchar(255) DEFAULT NULL,
  `debit_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `ayo_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `credit_card_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `midtrans_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `midtrans_server_key` varchar(255) DEFAULT NULL,
  `midtrans_client_key` varchar(255) DEFAULT NULL,
  `midtrans_production` tinyint(1) NOT NULL DEFAULT 0,
  `xendit_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `xendit_secret_key` varchar(255) DEFAULT NULL,
  `xendit_public_key` varchar(255) DEFAULT NULL,
  `xendit_production` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pilates_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pilates_appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `appointment_session_id` bigint(20) unsigned DEFAULT NULL,
  `pilates_class_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned NOT NULL,
  `session_name` varchar(255) NOT NULL,
  `session_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`session_options`)),
  `admin_notes` text DEFAULT NULL,
  `duration_minutes` int(10) unsigned NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pilates_appointments_parent_id_foreign` (`parent_id`),
  KEY `pilates_appointments_pilates_class_id_foreign` (`pilates_class_id`),
  KEY `pilates_appointments_start_at_end_at_index` (`start_at`,`end_at`),
  KEY `pilates_appointments_trainer_id_start_at_index` (`trainer_id`,`start_at`),
  KEY `pilates_appointments_appointment_session_id_foreign` (`appointment_session_id`),
  CONSTRAINT `pilates_appointments_appointment_session_id_foreign` FOREIGN KEY (`appointment_session_id`) REFERENCES `appointment_sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pilates_appointments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `pilates_appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pilates_appointments_pilates_class_id_foreign` FOREIGN KEY (`pilates_class_id`) REFERENCES `pilates_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pilates_appointments_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pilates_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pilates_bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `user_membership_id` bigint(20) unsigned DEFAULT NULL,
  `membership_plan_id` bigint(20) unsigned DEFAULT NULL,
  `timetable_id` bigint(20) unsigned NOT NULL,
  `invoice` varchar(14) DEFAULT NULL,
  `participants` int(10) unsigned NOT NULL DEFAULT 1,
  `status` enum('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'confirmed',
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expired_at` timestamp NULL DEFAULT NULL,
  `payment_type` enum('drop_in','credit') DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_proof_image` varchar(255) DEFAULT NULL,
  `price_amount` decimal(12,2) DEFAULT NULL,
  `credit_used` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pilates_bookings_invoice_unique` (`invoice`),
  KEY `pilates_bookings_timetable_id_status_index` (`timetable_id`,`status`),
  KEY `pilates_bookings_user_membership_id_foreign` (`user_membership_id`),
  KEY `pilates_bookings_membership_plan_id_foreign` (`membership_plan_id`),
  KEY `pilates_bookings_user_id_foreign` (`user_id`),
  CONSTRAINT `pilates_bookings_membership_plan_id_foreign` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pilates_bookings_timetable_id_foreign` FOREIGN KEY (`timetable_id`) REFERENCES `pilates_timetables` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pilates_bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pilates_bookings_user_membership_id_foreign` FOREIGN KEY (`user_membership_id`) REFERENCES `user_memberships` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pilates_class_trainer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pilates_class_trainer` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pilates_class_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pilates_class_trainer_pilates_class_id_trainer_id_unique` (`pilates_class_id`,`trainer_id`),
  KEY `pilates_class_trainer_trainer_id_foreign` (`trainer_id`),
  CONSTRAINT `pilates_class_trainer_pilates_class_id_foreign` FOREIGN KEY (`pilates_class_id`) REFERENCES `pilates_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pilates_class_trainer_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pilates_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pilates_classes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `class_category_id` bigint(20) unsigned DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration` int(10) unsigned NOT NULL,
  `difficulty_level` enum('Beginner','Intermediate','Advanced','Open to all') NOT NULL,
  `about` text NOT NULL,
  `equipment` text NOT NULL,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `default_payment_method` enum('drop_in','credit') NOT NULL DEFAULT 'drop_in',
  `available_for_timetable` tinyint(1) NOT NULL DEFAULT 0,
  `available_for_appointment` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pilates_classes_class_category_id_foreign` (`class_category_id`),
  CONSTRAINT `pilates_classes_class_category_id_foreign` FOREIGN KEY (`class_category_id`) REFERENCES `class_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pilates_timetables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pilates_timetables` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pilates_class_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `capacity` int(10) unsigned NOT NULL,
  `duration_minutes` int(10) unsigned DEFAULT NULL,
  `price_override` decimal(12,2) DEFAULT NULL,
  `credit_override` decimal(12,2) DEFAULT NULL,
  `allow_drop_in` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('scheduled','cancelled','closed') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pilates_timetables_trainer_id_foreign` (`trainer_id`),
  KEY `pilates_timetables_pilates_class_id_start_at_index` (`pilates_class_id`,`start_at`),
  CONSTRAINT `pilates_timetables_pilates_class_id_foreign` FOREIGN KEY (`pilates_class_id`) REFERENCES `pilates_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pilates_timetables_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned NOT NULL,
  `image` varchar(255) NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `buy_price` bigint(20) NOT NULL,
  `sell_price` bigint(20) NOT NULL,
  `stock` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_barcode_unique` (`barcode`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `profits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profits` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint(20) unsigned NOT NULL,
  `total` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profits_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `profits_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stock_mutations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_mutations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `type` enum('in','out') NOT NULL,
  `qty` int(10) unsigned NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_mutations_product_id_foreign` (`product_id`),
  KEY `stock_mutations_user_id_foreign` (`user_id`),
  CONSTRAINT `stock_mutations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_mutations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `studio_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studio_pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studio_pages_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trainers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `gender` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `expertise` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `biodata` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trainers_user_id_unique` (`user_id`),
  CONSTRAINT `trainers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `transaction_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaction_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL,
  `price` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_details_transaction_id_foreign` (`transaction_id`),
  KEY `transaction_details_product_id_foreign` (`product_id`),
  CONSTRAINT `transaction_details_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `transaction_details_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cashier_id` bigint(20) unsigned NOT NULL,
  `customer_id` bigint(20) unsigned DEFAULT NULL,
  `invoice` varchar(255) NOT NULL,
  `cash` bigint(20) NOT NULL,
  `change` bigint(20) NOT NULL,
  `discount` bigint(20) NOT NULL,
  `grand_total` bigint(20) NOT NULL,
  `tax` bigint(20) NOT NULL DEFAULT 0,
  `payment_method` varchar(255) NOT NULL DEFAULT 'cash',
  `payment_status` varchar(255) NOT NULL DEFAULT 'paid',
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `canceled_at` timestamp NULL DEFAULT NULL,
  `cancellation_note` text DEFAULT NULL,
  `canceled_by_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_cashier_id_foreign` (`cashier_id`),
  KEY `transactions_customer_id_foreign` (`customer_id`),
  CONSTRAINT `transactions_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_memberships` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `membership_plan_id` bigint(20) unsigned NOT NULL,
  `invoice` varchar(14) DEFAULT NULL,
  `credits_total` int(11) NOT NULL,
  `credits_remaining` int(11) NOT NULL,
  `starts_at` datetime NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_proof_image` varchar(255) DEFAULT NULL,
  `expired_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','pending_payment','active','expired','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `um_user_plan_start_uq` (`user_id`,`membership_plan_id`,`starts_at`),
  UNIQUE KEY `user_memberships_invoice_unique` (`invoice`),
  KEY `user_memberships_membership_plan_id_foreign` (`membership_plan_id`),
  KEY `um_user_status_idx` (`user_id`,`status`),
  CONSTRAINT `user_memberships_membership_plan_id_foreign` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_memberships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2024_06_13_082620_create_permission_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2024_06_13_091315_add_avatar_field_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2024_06_13_125039_create_customers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2024_06_13_130507_create_categories_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2024_06_13_131744_create_products_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2024_06_13_132800_create_transactions_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2024_06_13_133940_create_transaction_details_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2024_06_13_133948_create_carts_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2024_06_13_133955_create_profits_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2025_02_14_000000_add_cancellation_fields_to_transactions_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2025_11_19_172334_create_payment_settings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2025_11_19_172346_add_payment_columns_to_transactions_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2025_11_19_180000_add_manual_payment_methods_to_payment_settings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2025_11_19_181000_add_additional_manual_payment_methods_to_payment_settings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2025_12_23_140000_add_hold_columns_to_carts_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2025_12_24_120000_create_cash_entries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2026_02_15_000001_add_tax_to_transactions_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2026_02_20_000000_create_studio_pages_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2026_02_20_000001_add_credit_to_customers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2026_02_20_000002_create_pilates_classes_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2026_02_20_120000_add_user_id_to_customers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2026_02_21_000000_revise_pilates_booking_schema',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2026_02_21_010000_add_profile_fields_to_trainers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_02_21_010000_create_pilates_bookings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2026_02_21_120000_update_pilates_bookings_for_dashboard_booking',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (29,'2026_02_22_000001_create_membership_plans_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (30,'2026_02_22_000002_create_user_memberships_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (31,'2026_02_22_000003_create_membership_plan_classes_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (32,'2026_02_22_000004_add_membership_usage_to_pilates_bookings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (33,'2026_02_23_000001_add_allow_drop_in_to_pilates_timetables_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (34,'2026_03_01_000001_create_class_categories_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (35,'2026_03_01_000002_add_class_category_id_to_pilates_classes_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (36,'2026_03_02_000001_add_biodata_to_trainers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (37,'2026_03_03_000001_add_manual_payment_details_to_payment_settings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (38,'2026_03_08_000001_add_invoice_to_pilates_bookings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (39,'2026_03_08_230000_drop_unique_user_timetable_on_pilates_bookings',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (40,'2026_03_11_000001_add_payment_proof_image_to_pilates_bookings_table',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (41,'2026_03_11_000002_add_expired_status_and_expired_at_to_pilates_bookings_table',3);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (42,'2026_03_14_000001_add_profile_fields_to_customers_and_trainers',4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (43,'2026_03_16_000001_add_tag_and_order_position_to_membership_plans_table',5);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (44,'2026_03_18_000001_add_image_to_studio_pages_table',6);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (45,'2026_03_18_000000_create_landing_page_settings_table',7);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (46,'2026_03_18_120000_add_checkout_fields_to_user_memberships_table',8);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (47,'2026_03_22_000001_add_availability_flags_to_pilates_classes_table',9);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (48,'2026_03_22_000002_create_pilates_appointments_table',10);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (49,'2026_03_23_000003_add_invoice_to_pilates_appointments_table',11);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (50,'2026_03_23_000004_create_appointment_sessions_table',12);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (51,'2026_03_23_000005_add_session_and_admin_notes_to_pilates_appointments_table',12);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (52,'2026_03_23_000006_remove_invoice_and_add_appointment_trainer_table',13);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (53,'2026_03_23_000007_update_pilates_appointments_for_session_options',14);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (54,'2026_03_24_000001_add_user_id_to_trainers_table',15);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (55,'2026_03_24_000100_add_transaction_category_to_cash_entries_table',15);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (56,'2026_03_24_000200_create_stock_mutations_table',15);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (57,'2026_03_24_000300_create_appointment_bookings_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (58,'2026_03_24_000400_add_default_payment_method_to_pilates_classes_table',17);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (59,'2026_03_24_000500_drop_price_from_pilates_appointments_table',17);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (60,'2026_03_25_000100_add_default_prices_and_payment_method_to_appointment_sessions_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (61,'2026_03_25_142816_add_payment_type_to_appointment_bookings_table',19);
