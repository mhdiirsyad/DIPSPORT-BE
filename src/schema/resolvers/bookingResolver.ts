import { BookingDetail, BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export const bookingResolvers = {
  Query: {
    bookings: async () => {
      return await prisma.booking.findMany({
        include: {
          details: true,
        }
      })
    },

    booking: async (_: any, { bookingCode }: { bookingCode: string }) => {
      return await prisma.booking.findUnique({
        where: { bookingCode: bookingCode },
        include: { details: true }
      })
    },
  },

  Mutation: {
    createBooking: async (
      _: any,
      { name, contact, email, institution, suratUrl = '', isAcademic = false, details }: { name: string, contact: string, email: string, institution?: string, suratUrl?: string, isAcademic?: boolean, details: { details: BookingDetail }[] }
    ) => {
      let totalPrice = 0;
      const bookingCode = `DS-${uuidv4().split('-')[0].toUpperCase()}`

      for (const d of details) {
        const bookingDate = dayjs(d.details.bookingDate);
        const today = dayjs().startOf('day')

        if (bookingDate.isBefore(today.add(1, 'day'))) {
          throw new Error("Maksimal Booking H-1")
        }
      }

      if (!isAcademic) {
        if (!suratUrl) throw new Error("Surat pengantar diperlukan")
        for (const d of details) {
          const field = await prisma.field.findUnique({
            where: { id: d.details.fieldId },
            select: { pricePerHour: true },
          })

          if (!field) {
            throw new Error("Field not found")
          }

          totalPrice += field.pricePerHour
        }
      }
      return await prisma.booking.create({
        data: {
          bookingCode,
          name,
          contact,
          email,
          institution,
          isAcademic,
          suratUrl,
          totalPrice: isAcademic ? 0 : totalPrice,
          details: details ? {
            create: details.map((item) => ({
              fieldId: item.details.fieldId,
              bookingDate: item.details.bookingDate,
              startHour: item.details.startHour,
              pricePerHour: item.details.pricePerHour,
              subtotal: item.details.subtotal,
            }))
          } : undefined
        }
      })
    },

    updateStatusBooking: async (
      _: any,
      { status, bookingCode }: { status: BookingStatus, bookingCode: string }
    ) => {
      return await prisma.booking.update({
        where: { bookingCode: bookingCode },
        data: {
          status: status,
        }
      })
    },

    updatePaymentStatus: async (
      _: any,
      { payment, bookingCode }: { payment: PaymentStatus, bookingCode: string }
    ) => {
      return await prisma.booking.update({
        where: { bookingCode: bookingCode },
        data: { paymentStatus: payment },
      })
    }
  }
}