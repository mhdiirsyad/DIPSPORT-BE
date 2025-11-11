import type { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import { GraphQLError } from "graphql"
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

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["DONE", "CANCELLED"],
  DONE: [],
  CANCELLED: [],
}

export const bookingResolvers = {
  Query: {
    bookings: async (_: unknown, __: unknown, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      return prisma.booking.findMany({
        include: {
          details: true,
        },
        orderBy: { createdAt: "desc" },
      })
    },
    booking: async (_: unknown, { bookingCode }: BookingArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
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

      const operatingHour = await prisma.operatingHour.findUnique({ where: { id: 1 } })
      if (!operatingHour) {
        throw new GraphQLError("Jam operasional belum dikonfigurasi", {
          extensions: { code: "OPERATING_HOUR_MISSING" },
        })
      }
      const openHour = dayjs(operatingHour.openTime).hour()
      const closeHour = dayjs(operatingHour.closeTime).hour()

      const detailPayload = await Promise.all(
        details.map(async (item) => {
          const bookingDate = dayjs(item.bookingDate)

          if (bookingDate.isBefore(today.add(1, "day"))) {
            throw new Error("Maksimal booking harus dilakukan minimal H-1")
          }

          if (item.startHour < openHour || item.startHour >= closeHour) {
            throw new GraphQLError("Jam yang dipilih berada di luar jam operasional", {
              extensions: { code: "INVALID_SLOT" },
            })
          }

          const field = await prisma.field.findUnique({
            where: { id: item.fieldId },
            select: { pricePerHour: true },
          })

          if (!field) {
            throw new Error("Field tidak ditemukan")
          }

          const normalizedDate = bookingDate.startOf("day")

          const existingSlot = await prisma.bookingDetail.findFirst({
            where: {
              fieldId: item.fieldId,
              bookingDate: normalizedDate.toDate(),
              startHour: item.startHour,
            },
          })

          if (existingSlot) {
            throw new GraphQLError("Slot waktu sudah dibooking oleh pengguna lain", {
              extensions: { code: "SLOT_UNAVAILABLE" },
            })
          }

          const pricePerHour = item.pricePerHour ?? field.pricePerHour
          const subtotal = item.subtotal ?? pricePerHour

          return {
            fieldId: item.fieldId,
            bookingDate: normalizedDate.toDate(),
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

      const booking = await prisma.booking.findUnique({
        where: { bookingCode },
        include: { details: true },
      })

      if (!booking) {
        throw new GraphQLError("Booking tidak ditemukan", { extensions: { code: "NOT_FOUND" } })
      }

      if (booking.status === status) {
        return booking
      }

      const allowed = STATUS_TRANSITIONS[booking.status] ?? []
      if (!allowed.includes(status)) {
        throw new GraphQLError("Perubahan status tidak valid", {
          extensions: { code: "INVALID_STATUS_TRANSITION" },
        })
      }

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

      const booking = await prisma.booking.findUnique({
        where: { bookingCode },
        include: { details: true },
      })

      if (!booking) {
        throw new GraphQLError("Booking tidak ditemukan", { extensions: { code: "NOT_FOUND" } })
      }

      if (booking.paymentStatus === paymentStatus) {
        return booking
      }

      if (booking.paymentStatus === "PAID" && paymentStatus === "UNPAID") {
        throw new GraphQLError("Pembayaran yang sudah lunas tidak dapat diubah menjadi UNPAID", {
          extensions: { code: "INVALID_PAYMENT_TRANSITION" },
        })
      }

      if (paymentStatus === "PAID" && booking.status === "CANCELLED") {
        throw new GraphQLError("Booking yang dibatalkan tidak dapat ditandai sebagai PAID", {
          extensions: { code: "INVALID_PAYMENT_TRANSITION" },
        })
      }

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
