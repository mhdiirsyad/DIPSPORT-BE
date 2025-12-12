import type { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import { v4 as uuidv4 } from "uuid"
import { requireAuth } from "../../lib/context.js"
import { createBookingSchema, updateBookingSchema, updatePaymenStatusSchema, } from "./validators/bookingSchema.js"
import Upload from "graphql-upload/Upload.mjs"
import { uploadToMinio } from "../../lib/uploadToMinio.js"
import { minioClient, BUCKET } from "../../lib/minioClient.js"

const DEFAULT_ACADEMIC_SURAT_URL = process.env.DEFAULT_ACADEMIC_SURAT_URL ?? "https://example.com/uploads/placeholder-surat.pdf"
interface BookingArgs {
  bookingCode: string
}

interface CreateBookingArgs {
  name: string
  contact: string
  email: string
  institution?: string
  suratFile?: Upload
  isAcademic?: boolean
  status?: BookingStatus
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
    bookings: async (_: unknown, args: {stadionId?: number | string, date?: Date}, { prisma }: ResolverContext) => {
      const filters: any = {}

      if(args.stadionId){
        filters.details = {
          some: {
            Field: {
              stadionId: Number(args.stadionId)
            }
          }
        }
      }

      if(args.date){
        const selectedDate = new Date(args.date)
        filters.details = {
          ...filters.details,
          some: {
            ...filters.details?.some,
            bookingDate: {
              gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
              lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
            }
          }
        }
      }
      return prisma.booking.findMany({
        where: filters,
        include: {
          details: {
            include: {
              Field: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
    booking: async (_: unknown, { bookingCode }: BookingArgs, { prisma }: ResolverContext) => {
      return prisma.booking.findUnique({
        where: { bookingCode },
        include: {
          details: {
            include: { Field: true }
          },
        },
      })
    },
  },
  Mutation: {
    createBooking: async (_: unknown, args: CreateBookingArgs, { prisma }: ResolverContext) => {
      const validated = await createBookingSchema.validate(args, { abortEarly: false })
      const { name, contact, email, institution, suratFile, isAcademic = false, details, status, paymentStatus } = validated
      let suratUrl = null;
      let uploadedObjectName: string | null = null

      if (!details || !Array.isArray(details) || details.length === 0) {
        throw new Error("Detail booking harus diisi")
      }

      // If a suratFile Upload object is provided, resolve and upload it to MinIO
      if (suratFile) {
        // suratFile may be a promise-like upload object or a FileUpload with .promise
        let resolvedFile: any
        try {
          if (typeof (suratFile as any).promise === 'function' || (suratFile as any).promise) {
            resolvedFile = await (suratFile as any).promise
          } else {
            resolvedFile = suratFile
          }
        } catch (e) {
          throw new Error('Gagal memproses file surat')
        }

        const mimetype = resolvedFile.mimetype || ''
        if (!mimetype.includes('pdf')) {
          throw new Error('Surat harus berformat PDF')
        }

        const uploadResult = await uploadToMinio(resolvedFile, 'surat')
        suratUrl = uploadResult.publicUrl
        uploadedObjectName = uploadResult.objectName
      }

      // if (isAcademic && !suratUrl) {
      //   throw new Error("Surat pengantar diperlukan untuk booking akademik")
      // }

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
      try {
        const booking = await prisma.booking.create({
          data: {
            bookingCode,
            name,
            contact,
            email,
            institution,
            suratUrl,
            isAcademic,
            totalPrice,
            status: status ?? "PENDING",
            paymentStatus: paymentStatus ?? "UNPAID",
            details: {
              create: detailPayload,
            },
          },
          include: {
            details: true,
          },
        })

        return booking
      } catch (err) {
        // attempt to cleanup uploaded file if present
        if (typeof uploadedObjectName === 'string' && uploadedObjectName) {
          try {
            await minioClient.removeObject(BUCKET, uploadedObjectName)
          } catch (removeErr) {
            // log and continue to throw original error
            console.error('Failed to remove uploaded object after DB error:', removeErr)
          }
        }
        throw err
      }
    },
    updateStatusBooking: async (_: unknown, args: UpdateStatusArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const validated = await updateBookingSchema.validate(args, { abortEarly: false })
      const { bookingCode, status } = validated
      // If booking is being cancelled, release all booked details so others can book the same slots.
      if (status === 'CANCELLED') {
        // Find booking first
        const booking = await prisma.booking.findUnique({ where: { bookingCode }, select: { id: true } })
        if (!booking) throw new Error('Booking not found')

        // Use a transaction: delete details, then update booking status
        const [ , updated ] = await prisma.$transaction([
          prisma.bookingDetail.deleteMany({ where: { bookingId: booking.id } }),
          prisma.booking.update({ where: { bookingCode }, data: { status }, include: { details: true } }),
        ])

        return updated
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
