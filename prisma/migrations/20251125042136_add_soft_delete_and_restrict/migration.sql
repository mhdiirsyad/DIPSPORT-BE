-- DropForeignKey
ALTER TABLE `imagefield` DROP FOREIGN KEY `ImageField_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `stadionfacility` DROP FOREIGN KEY `StadionFacility_stadionId_fkey`;

-- DropIndex
DROP INDEX `ImageField_fieldId_fkey` ON `imagefield`;

-- DropIndex
DROP INDEX `StadionFacility_stadionId_fkey` ON `stadionfacility`;

-- AlterTable
ALTER TABLE `facility` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `field` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `stadion` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `StadionFacility` ADD CONSTRAINT `StadionFacility_stadionId_fkey` FOREIGN KEY (`stadionId`) REFERENCES `Stadion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageField` ADD CONSTRAINT `ImageField_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
