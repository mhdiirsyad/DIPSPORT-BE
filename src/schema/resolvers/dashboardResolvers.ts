import type { PrismaClient } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import dayjs from "dayjs"
import 'dayjs/locale/id'

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

interface DashboardArgs {
  startDate?: string
  endDate?: string
  stadionId?: string | number
}

export const dashboardResolvers = {
  Query: {
    getDashboardStats: async (_: unknown, args: DashboardArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin) 

      const now = dayjs().locale('id')
      
      const startDate = args.startDate ? dayjs(args.startDate).startOf('day') : now.startOf('month')
      const endDate = args.endDate ? dayjs(args.endDate).endOf('day') : now.endOf('day')
      
      const startFilter = startDate.toDate()
      const endFilter = endDate.toDate()
      const startOfYear = now.startOf('year').toDate()

      const rawStadionId = Number(args.stadionId)
      const stadionFilterId = rawStadionId > 0 ? rawStadionId : undefined

      const stadionWhere = stadionFilterId ? { id: stadionFilterId, status: 'ACTIVE' } : { status: 'ACTIVE' }
      const fieldWhere = stadionFilterId ? { stadionId: stadionFilterId, status: 'ACTIVE' } : { status: 'ACTIVE' }

      const bookingWhere: any = {
        status: { not: 'CANCELLED' }
      }
      if (stadionFilterId) {
        bookingWhere.details = { some: { Field: { stadionId: stadionFilterId } } }
      }

      const revenueYTDWhere: any = {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfYear }
      }
      if (stadionFilterId) {
        revenueYTDWhere.details = { some: { Field: { stadionId: stadionFilterId } } }
      }

      const breakdownWhere: any = {
         Booking: { status: { not: 'CANCELLED' } }, 
         bookingDate: { gte: startFilter, lte: endFilter }
      }
      if (stadionFilterId) {
         breakdownWhere.Field = { stadionId: stadionFilterId }
      }

      const detailWhere: any = {
        Booking: { status: { not: 'CANCELLED' } }
      }
      if (stadionFilterId) {
        detailWhere.Field = { stadionId: stadionFilterId }
      }
      
      const demographicBaseWhere: any = {
         status: { not: 'CANCELLED' },
         createdAt: { gte: startFilter, lte: endFilter }
      }
      if (stadionFilterId) {
         demographicBaseWhere.details = { some: { Field: { stadionId: stadionFilterId } } }
      }

      const operatingHourGlobal = await prisma.operatingHour.findUnique({ where: { id: 1 } })
      const hoursPerDay = (operatingHourGlobal?.closeHour ?? 22) - (operatingHourGlobal?.openHour ?? 8)

      const [
        totalStadions, 
        totalActiveFieldsCount, 
        totalBookings, 
        pendingBookings, 
        revenueAggregates,
        bookedDetailsInRange, 
        bookingHistoryRaw,
        recentBookingsData,
        countAcademic,
        countPublic,
        revenueByFieldRaw
      ] = await prisma.$transaction([
        prisma.stadion.count({ where: stadionWhere as any }),
        
        prisma.field.count({ where: fieldWhere as any }),
        
        prisma.booking.count({ where: bookingWhere }),
        
        prisma.booking.count({ where: { ...bookingWhere, status: 'PENDING' } }),
        
        prisma.booking.aggregate({
          _sum: { totalPrice: true }, 
          where: revenueYTDWhere,
        }),

        prisma.bookingDetail.findMany({
            where: {
                ...detailWhere,
                bookingDate: { gte: startFilter, lte: endFilter }
            },
            select: { bookingDate: true }
        }),

        prisma.booking.findMany({
            where: {
                ...bookingWhere,
                createdAt: { gte: startFilter, lte: endFilter }
            },
            select: { createdAt: true }
        }),

        prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { details: { include: { Field: true } } },
            where: {
               ...(stadionFilterId && { details: { some: { Field: { stadionId: stadionFilterId } } } })
            }
        }),

        prisma.booking.count({ where: { ...demographicBaseWhere, isAcademic: true } }),
        
        prisma.booking.count({ where: { ...demographicBaseWhere, isAcademic: false } }),
        
        prisma.bookingDetail.groupBy({
            by: ['fieldId'],
            _sum: { subtotal: true },
            where: breakdownWhere,
            orderBy: { _sum: { subtotal: 'desc' } }
        })
      ])

      const revenueYTD = revenueAggregates._sum?.totalPrice || 0

      const dailyBookingData = [];
      const weeklySlotsData = [];
      const dailyCapacity = totalActiveFieldsCount * hoursPerDay;

      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
          const dateStr = current.format('YYYY-MM-DD');
          const label = current.format('DD MMM');

          const countLine = bookingHistoryRaw.filter(b => 
            dayjs(b.createdAt).format('YYYY-MM-DD') === dateStr
          ).length;
          dailyBookingData.push({ date: label, count: countLine });

          const countBar = bookedDetailsInRange.filter(detail => 
            dayjs(detail.bookingDate).format('YYYY-MM-DD') === dateStr
          ).length;
          
          weeklySlotsData.push({
              date: label,
              bookedHours: countBar,
              availableHours: Math.max(0, dailyCapacity - countBar)
          });

          current = current.add(1, 'day');
      }

      const userDemographics = [
          { category: 'Academic', count: countAcademic },
          { category: 'Public', count: countPublic }
      ]

      const fieldIds = revenueByFieldRaw.map(item => item.fieldId)
      
      const fieldsInfo = await prisma.field.findMany({
          where: { id: { in: fieldIds } },
          select: { id: true, name: true }
      })

      const totalRevenueBreakdown = revenueByFieldRaw.reduce((acc, curr) => acc + (curr._sum?.subtotal || 0), 0)
      
      const fieldRevenues = revenueByFieldRaw.map(item => {
          const fieldInfo = fieldsInfo.find(f => f.id === item.fieldId)
          const revenue = item._sum?.subtotal || 0
          const percentage = totalRevenueBreakdown > 0 ? (revenue / totalRevenueBreakdown) * 100 : 0
          
          return {
              fieldId: item.fieldId,
              fieldName: fieldInfo?.name || `Field #${item.fieldId}`,
              revenue,
              percentage: parseFloat(percentage.toFixed(1))
          }
      })

      return {
        totalStadions,
        totalFields: totalActiveFieldsCount, 
        totalBookings,
        pendingBookings,
        revenueYTD,
        dailyBookings: dailyBookingData,
        weeklySlots: weeklySlotsData, 
        recentBookings: recentBookingsData,
        userDemographics,
        fieldRevenues
      }
    },
  },
}