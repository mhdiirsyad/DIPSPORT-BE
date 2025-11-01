import type { PrismaClient, DayofWeek } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import { operatingHourSchema, operatingHourUpdateSchema } from "./validators/operatingHourSchema.js"

interface GetHoursArgs {
  stadionId: number
}

interface CreateHourArgs {
  stadionId: number
  day: DayofWeek
  openTime: string 
  closeTime: string 
}

interface UpdateHourArgs extends CreateHourArgs {
  id: number
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

export const operatingHourResolvers = {
  Query: {
    operatingHoursByStadion: async (
      _: unknown,
      { stadionId }: GetHoursArgs,
      { prisma }: ResolverContext
    ) => {
      return prisma.operatingHour.findMany({
        where: { stadionId: Number(stadionId) },
        orderBy: { day: "asc" },
      })
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
 
      return prisma.operatingHour.update({
        where: { id: Number(validated.id) },
        data: {
          stadionId: validated.stadionId,
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

      return prisma.operatingHour.delete({
        where: { id: Number(id) },
      })
    },
  },
}