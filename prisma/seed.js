import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // Password default (akan di-hash sebelum disimpan)
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    // Buat admin default
    const admin = await prisma.admin.upsert({
        where: { email: "admin@dipsport.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@dipsport.com",
            password: hashedPassword,
        },
    });
    console.log("✅ Admin created:", {
        id: admin.id,
        name: admin.name,
        email: admin.email,
    });
    // Buat admin tambahan untuk testing
    const admin2 = await prisma.admin.upsert({
        where: { email: "admin2@dipsport.com" },
        update: {},
        create: {
            name: "Admin 2",
            email: "admin2@dipsport.com",
            password: hashedPassword,
        },
    });
    console.log("✅ Admin 2 created:", {
        id: admin2.id,
        name: admin2.name,
        email: admin2.email,
    });
    console.log("🎉 Seeding completed!");
    console.log("📝 Default password (hashed in DB): admin123");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
