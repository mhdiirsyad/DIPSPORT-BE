-- Drop foreign key first
ALTER TABLE `ImageField` DROP FOREIGN KEY `ImageField_fieldId_fkey`;

-- Now drop the index
DROP INDEX `ImageField_fieldId_fkey` ON `ImageField`;

-- Drop foreign key in Bookings if needed
ALTER TABLE `BookingDetail` DROP FOREIGN KEY `BookingDetail_fieldId_fkey`;

-- Drop table
ALTER TABLE `field` DROP FOREIGN KEY `Field_stadionId_fkey`;
DROP TABLE `field`;

-- Recreate new table
CREATE TABLE `Field` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stadionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `pricePerHour` INTEGER NOT NULL,

    INDEX `Field_stadionId_idx`(`stadionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add new foreign keys
ALTER TABLE `Field` ADD CONSTRAINT `Field_stadionId_fkey` FOREIGN KEY (`stadionId`) REFERENCES `Stadion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ImageField` ADD CONSTRAINT `ImageField_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `BookingDetail` ADD CONSTRAINT `BookingDetail_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;