import type { PrismaClient } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import { operatingHourUpdateSchema } from "./validators/operatingHourSchema.js"

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
    operatingHours: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
      return prisma.operatingHour.findUnique({ where: { id: 1 } })
    },
  },

  Mutation: {
    updateOperatingHour: async (
      _: unknown,
      args: { openHour: number; closeHour: number },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)
      const validated = await operatingHourUpdateSchema.validate(args, { abortEarly: false })

      return prisma.operatingHour.upsert({
        where: { id: 1 },
        update: {
          openHour: validated.openHour,
          closeHour: validated.closeHour,
        },
        create: {
          openHour: validated.openHour,
          closeHour: validated.closeHour,
        },
      })
    },
  },
}
