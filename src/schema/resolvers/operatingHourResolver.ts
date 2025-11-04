import type { PrismaClient, DayofWeek } from "@prisma/client"
import { GraphQLError } from "graphql"
import { requireAuth } from "../../lib/context.js"
import { operatingHourSchema, operatingHourUpdateSchema } from "./validators/operatingHourSchema.js"

interface GetHoursArgs {
  stadionId: number
}

interface CreateHourArgs {
  stadionId: number
  day: DayofWeek
  openTime: Date | string
  closeTime: Date | string
}

interface UpdateHourArgs {
  id: number
  day: DayofWeek
  openTime: Date | string
  closeTime: Date | string
}

interface DeleteHourArgs {
  id: number
}

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

// Helper: Sort days in correct order (Monday to Sunday)
const DAY_ORDER: DayofWeek[] = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

function sortByDayOrder<T extends { day: DayofWeek }>(items: T[]): T[] {
  return items.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
}

export const operatingHourResolvers = {
  Query: {
    operatingHoursByStadion: async (
      _: unknown,
      { stadionId }: GetHoursArgs,
      { prisma }: ResolverContext
    ) => {
      const hours = await prisma.operatingHour.findMany({
        where: { stadionId: Number(stadionId) },
        include: {
          Stadion: true,
        },
      })

      // Sort by correct day order (SENIN to MINGGU)
      return sortByDayOrder(hours)
    },
  },

  Mutation: {
    createOperatingHour: async (
      _: unknown,
      args: CreateHourArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)
      const validated = await operatingHourSchema.validate(args, { abortEarly: false })

      // Check if stadium exists
      const stadium = await prisma.stadion.findUnique({
        where: { id: validated.stadionId }
      })

      if (!stadium) {
        throw new GraphQLError("Stadion tidak ditemukan", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      // Check for duplicate (stadium + day combination)
      const existing = await prisma.operatingHour.findUnique({
        where: {
          stadionId_day: {
            stadionId: validated.stadionId,
            day: validated.day
          }
        }
      })

      if (existing) {
        throw new GraphQLError(
          `Jam operasional untuk hari ${validated.day} sudah ada di stadion ini`,
          { extensions: { code: "DUPLICATE_ENTRY" } }
        )
      }

      return prisma.operatingHour.create({
        data: {
          stadionId: validated.stadionId,
          day: validated.day,
          openTime: validated.openTime,
          closeTime: validated.closeTime,
        },
      })
    },

    updateOperatingHour: async (
      _: unknown,
      args: UpdateHourArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)
      const validated = await operatingHourUpdateSchema.validate(args, { abortEarly: false })

      // Check if operating hour exists
      const existingHour = await prisma.operatingHour.findUnique({
        where: { id: Number(validated.id) }
      })

      if (!existingHour) {
        throw new GraphQLError("Jam operasional tidak ditemukan", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      // Check if updating to a day that already exists for this stadium
      const duplicateDay = await prisma.operatingHour.findFirst({
        where: {
          id: { not: Number(validated.id) },
          stadionId: existingHour.stadionId,
          day: validated.day,
        }
      })

      if (duplicateDay) {
        throw new GraphQLError(
          `Jam operasional untuk hari ${validated.day} sudah ada di stadion ini`,
          { extensions: { code: "DUPLICATE_ENTRY" } }
        )
      }

      return prisma.operatingHour.update({
        where: { id: Number(validated.id) },
        data: {
          // Don't allow changing stadionId - operating hours belong to specific stadium
          day: validated.day,
          openTime: validated.openTime,
          closeTime: validated.closeTime,
        },
      })
    },

    deleteOperatingHour: async (
      _: unknown,
      { id }: DeleteHourArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)

      // Check if operating hour exists
      const existingHour = await prisma.operatingHour.findUnique({
        where: { id: Number(id) }
      })

      if (!existingHour) {
        throw new GraphQLError("Jam operasional tidak ditemukan", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return prisma.operatingHour.delete({
        where: { id: Number(id) },
      })
    },
  },
}
