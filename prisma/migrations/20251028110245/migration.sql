/*
  Warnings:

  - Added the required column `pricePerHour` to the `BookingDetail` table without a default value. This is not possible if the table is not empty.
  - The `OperatingHour` table will be dropped and recreated. Existing data will be removed.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN `suratUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookingdetail` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `pricePerHour` INTEGER NOT NULL;

-- Recreate OperatingHour as global master data
DROP TABLE IF EXISTS `OperatingHour`;

CREATE TABLE `OperatingHour` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU') NOT NULL,
    `openTime` DATETIME(3) NOT NULL,
    `closeTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OperatingHour_day_key`(`day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Admin_email_key` ON `Admin`(`email`);

-- CreateIndex
CREATE INDEX `Booking_status_createdAt_idx` ON `Booking`(`status`, `createdAt`);

-- CreateIndex
CREATE INDEX `Booking_paymentStatus_idx` ON `Booking`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `BookingDetail_fieldId_bookingDate_idx` ON `BookingDetail`(`fieldId`, `bookingDate`);

-- CreateIndex
CREATE UNIQUE INDEX `BookingDetail_fieldId_bookingDate_startHour_key` ON `BookingDetail`(`fieldId`, `bookingDate`, `startHour`);

-- RenameIndex
ALTER TABLE `field` RENAME INDEX `Field_stadionId_fkey` TO `Field_stadionId_idx`;
