import type { PrismaClient } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import { stadionCreateSchema, stadionUpdateSchema } from "./validators/stadionSchema.js"

type ID = number | string

interface StadionArgs {
  stadionId: ID
}

interface CreateStadionArgs {
  name: string
  description?: string
  mapUrl: string
}

interface UpdateStadionArgs extends CreateStadionArgs {
  stadionId: ID
}

interface DeleteStadionArgs {
  stadionId: ID
}

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

export const stadionResolvers = {
  Query: {
    stadions: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
      return prisma.stadion.findMany({
        include: {
          fields: true,
          facilities: true,
          images: true,
        },
      })
    },
    stadion: async (_: unknown, { stadionId }: StadionArgs, { prisma }: ResolverContext) => {
      return prisma.stadion.findUnique({
        where: { id: Number(stadionId) },
        include: {
          fields: true,
          facilities: true,
          images: true,
        },
      })
    },
  },
  Mutation: {
    createStadion: async (_: unknown, args: CreateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionCreateSchema.validate(args, { abortEarly: false })

      return prisma.stadion.create({
        data: {
          name: validated.name,
          description: validated.description,
          mapUrl: validated.mapUrl,
        },
        include: {
          fields: true,
          facilities: true,
          images: true,
        },
      })
    },
    updateStadion: async (_: unknown, args: UpdateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionUpdateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, mapUrl } = validated

      return prisma.stadion.update({
        where: { id: Number(stadionId) },
        data: {
          name,
          description,
          mapUrl,
        },
        include: {
          fields: true,
          facilities: true,
          images: true,
        },
      })
    },
    deleteStadion: async (_: unknown, { stadionId }: DeleteStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const id = Number(stadionId)

      return prisma.$transaction(async (tx) => {
        await tx.stadionFacility.deleteMany({ where: { stadionId: id } })
        await tx.imageStadion.deleteMany({ where: { stadionId: id } })
        await tx.field.deleteMany({ where: { stadionId: id } })

        return tx.stadion.delete({
          where: { id },
          include: {
            fields: true,
            facilities: true,
            images: true,
          },
        })
      })
    },
  },
  Stadion: {
    operatingHours: async (_parent: { id: number }, __: unknown, { prisma }: ResolverContext) => {
      return prisma.operatingHour.findUnique({ where: { id: 1 } })
    },
  },
}
