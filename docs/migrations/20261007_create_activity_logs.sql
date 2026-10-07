USE `nutrition_db`;

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `activity_type` VARCHAR(40) NOT NULL,
  `duration_minutes` SMALLINT UNSIGNED NOT NULL,
  `met_value` DECIMAL(4,2) NOT NULL,
  `weight_kg` DECIMAL(5,2) NOT NULL,
  `calories_burned` DECIMAL(7,2) NOT NULL,
  `activity_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_activity_user_date` (`user_id`, `activity_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
