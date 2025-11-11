-- Recreate OperatingHour table to use hour-only fields
DROP TABLE IF EXISTS `OperatingHour`;

CREATE TABLE `OperatingHour` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `openHour` INTEGER NOT NULL,
    `closeHour` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
