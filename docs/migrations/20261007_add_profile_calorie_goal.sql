USE `nutrition_db`;

ALTER TABLE `user_profiles`
  ADD COLUMN `goal` ENUM('lose', 'maintain', 'gain')
    NOT NULL DEFAULT 'maintain' AFTER `tdee`,
  ADD COLUMN `target_calories` DECIMAL(7,2) NULL AFTER `goal`;

UPDATE `user_profiles`
SET `target_calories` = GREATEST(
  COALESCE(`tdee`, 0),
  CASE WHEN `gender` = 'female' THEN 1200 ELSE 1500 END
);

ALTER TABLE `user_profiles`
  MODIFY COLUMN `target_calories` DECIMAL(7,2) NOT NULL;
