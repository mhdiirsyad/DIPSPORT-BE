import type { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import { v4 as uuidv4 } from "uuid"
import { requireAuth } from "../../lib/context.js"
import { createBookingSchema, updateBookingSchema, updatePaymenStatusSchema, } from "./validators/bookingSchema.js"

interface BookingArgs {
  bookingCode: string
}

interface CreateBookingArgs {
  name: string
  contact: string
  email: string
  institution?: string
  suratUrl?: string
  isAcademic?: boolean
  details: BookingDetailInput[]
}

interface UpdateStatusArgs {
  bookingCode: string
  status: BookingStatus
}

interface UpdatePaymentArgs {
  bookingCode: string
  paymentStatus: PaymentStatus
}

interface BookingDetailInput {
  fieldId: number
  bookingDate: Date | string
  startHour: number
  pricePerHour?: number
  subtotal?: number
}

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

export const bookingResolvers = {
  Query: {
    bookings: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
      return prisma.booking.findMany({
        include: {
          details: true,
        },
        orderBy: { createdAt: "desc" },
      })
    },
    booking: async (_: unknown, { bookingCode }: BookingArgs, { prisma }: ResolverContext) => {
      return prisma.booking.findUnique({
        where: { bookingCode },
        include: {
          details: true,
        },
      })
    },
  },
  Mutation: {
    createBooking: async (_: unknown, args: CreateBookingArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const validated = await createBookingSchema.validate(args, { abortEarly: false })
      const { name, contact, email, institution, suratUrl, isAcademic = false, details } = validated

      if (!details || !Array.isArray(details) || details.length === 0) {
        throw new Error("Detail booking harus diisi")
      }

      if (isAcademic && !suratUrl) {
        throw new Error("Surat pengantar diperlukan untuk booking akademik")
      }

      const bookingCode = `DS-${uuidv4().split("-")[0]?.toUpperCase()}`
      const today = dayjs().startOf("day")

      const detailPayload = await Promise.all(
        details.map(async (item) => {
          const bookingDate = dayjs(item.bookingDate)

          if (bookingDate.isBefore(today.add(1, "day"))) {
            throw new Error("Maksimal booking harus dilakukan minimal H-1")
          }

          const field = await prisma.field.findUnique({
            where: { id: item.fieldId },
            select: { pricePerHour: true },
          })

          if (!field) {
            throw new Error("Field tidak ditemukan")
          }

          const pricePerHour = item.pricePerHour ?? field.pricePerHour
          const subtotal = item.subtotal ?? pricePerHour

          return {
            fieldId: item.fieldId,
            bookingDate: bookingDate.toDate(),
            startHour: item.startHour,
            pricePerHour,
            subtotal,
          }
        })
      )

      const totalPrice = isAcademic ? 0 : detailPayload.reduce((acc, curr) => acc + curr.subtotal, 0)

      return prisma.booking.create({
        data: {
          bookingCode,
          name,
          contact,
          email,
          institution,
          suratUrl,
          isAcademic,
          totalPrice,
          status: "PENDING",
          paymentStatus: "UNPAID",
          details: {
            create: detailPayload,
          },
        },
        include: {
          details: true,
        },
      })
    },
    updateStatusBooking: async (_: unknown, args: UpdateStatusArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const validated = await updateBookingSchema.validate(args, { abortEarly: false })
      const { bookingCode, status } = validated
      return prisma.booking.update({
        where: { bookingCode },
        data: {
          status,
        },
        include: {
          details: true,
        },
      })
    },
    updatePaymentStatus: async (_: unknown, args: UpdatePaymentArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const validate = await updatePaymenStatusSchema.validate(args, { abortEarly: false })
      const { bookingCode, paymentStatus } = validate
      return prisma.booking.update({
        where: { bookingCode },
        data: {
          paymentStatus,
        },
        include: {
          details: true,
        },
      })
    },
  },
}
