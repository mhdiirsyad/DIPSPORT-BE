import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Seeding database...")

  await prisma.$transaction([
    // prisma.booking.deleteMany(),
    // prisma.imageField.deleteMany(),
    // prisma.field.deleteMany(),
    // prisma.imageStadion.deleteMany(),
    // prisma.operatingHour.deleteMany(),
    // prisma.stadionFacility.deleteMany(),
    // prisma.facility.deleteMany(),
    // prisma.adminLog.deleteMany(),
    // prisma.admin.deleteMany(),
    // prisma.stadion.deleteMany(),
  ])

  const defaultPassword = "admin123"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  const admin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email: "admin@dipsport.com",
      password: hashedPassword,
    },
  })

  const admin2 = await prisma.admin.create({
    data: {
      name: "Admin 2",
      email: "admin2@dipsport.com",
      password: hashedPassword,
    },
  })

  console.log("✅ Admin accounts created:", [
    { id: admin.id, email: admin.email },
    { id: admin2.id, email: admin2.email },
  ])

  const facilities = await Promise.all(
    ["Parking Area", "Locker Room", "Rest Room"].map((name) =>
      prisma.facility.create({ data: { name } })
    )
  )

  const stadion = await prisma.stadion.create({
    data: {
      name: "Stadion Gelora DipSport",
      description: "Indoor multi-sport arena with modern facilities",
      mapUrl: "https://example.com/maps/gelora-dipsport",
    },
  })

  await prisma.stadionFacility.createMany({
    data: facilities.map((facility) => ({
      stadionId: stadion.id,
      facilityId: facility.id,
    })),
  })

  await prisma.imageStadion.createMany({
    data: [
      {
        stadionId: stadion.id,
        imageUrl: "https://example.com/images/stadion-exterior.jpg",
      },
      {
        stadionId: stadion.id,
        imageUrl: "https://example.com/images/stadion-interior.jpg",
      },
    ],
  })

  await prisma.operatingHour.create({
    data: {
      id: 1,
      openHour: 8,
      closeHour: 22,
    },
  })

  const mainField = await prisma.field.create({
    data: {
      stadionId: stadion.id,
      name: "Lapangan Utama",
      description: "Lapangan rumput sintetis standar nasional",
      pricePerHour: 250000,
      images: {
        create: [
          {
            imageUrl: "https://example.com/images/lapangan-utama-1.jpg",
          },
          {
            imageUrl: "https://example.com/images/lapangan-utama-2.jpg",
          },
        ],
      },
    },
    include: {
      images: true,
    },
  })

  const secondaryField = await prisma.field.create({
    data: {
      stadionId: stadion.id,
      name: "Lapangan Pendukung",
      description: "Lapangan multi-fungsi untuk basket dan futsal",
      pricePerHour: 180000,
      images: {
        create: [
          {
            imageUrl: "https://example.com/images/lapangan-pendukung-1.jpg",
          },
        ],
      },
    },
  })

  const bookingDate = new Date()
  bookingDate.setDate(bookingDate.getDate() + 3)
  bookingDate.setHours(9, 0, 0, 0)

  const booking = await prisma.booking.create({
    data: {
      bookingCode: "DS-SEED-001",
      name: "Andi Wijaya",
      contact: "08123456789",
      email: "andi@example.com",
      institution: "Universitas DipSport",
      suratUrl: "https://example.com/uploads/surat-rekomendasi.pdf",
      isAcademic: false,
      totalPrice: mainField.pricePerHour,
      status: "APPROVED",
      paymentStatus: "PAID",
      details: {
        create: [
          {
            fieldId: mainField.id,
            bookingDate,
            startHour: 9,
            pricePerHour: mainField.pricePerHour,
            subtotal: mainField.pricePerHour,
          },
        ],
      },
    },
    include: {
      details: true,
    },
  })

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: "SEED",
      targetTable: "Booking",
      targetId: booking.id,
      description: "Initial booking created during seed process",
    },
  })

  console.log("✅ Stadion with related data seeded:", {
    stadionId: stadion.id,
    fields: [mainField.id, secondaryField.id],
    bookingCode: booking.bookingCode,
  })

  console.log("🎉 Seeding completed!")
  console.log("ℹ️  Default admin password: admin123")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
