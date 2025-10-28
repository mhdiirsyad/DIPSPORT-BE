/*
  Warnings:

  - You are about to alter the column `openTime` on the `operatinghour` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `closeTime` on the `operatinghour` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fieldId,bookingDate,startHour]` on the table `BookingDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stadionId,day]` on the table `OperatingHour` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pricePerHour` to the `BookingDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN `suratUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookingdetail` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `pricePerHour` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `operatinghour` MODIFY `openTime` DATETIME(3) NOT NULL,
    MODIFY `closeTime` DATETIME(3) NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX `OperatingHour_stadionId_day_key` ON `OperatingHour`(`stadionId`, `day`);

-- RenameIndex
ALTER TABLE `field` RENAME INDEX `Field_stadionId_fkey` TO `Field_stadionId_idx`;
