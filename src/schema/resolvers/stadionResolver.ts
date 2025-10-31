import type { PrismaClient } from "@prisma/client"

interface StadionArgs {
  stadionId: number
}

interface CreateStadionArgs {
  name: string
  description?: string
  mapUrl: string
}

interface UpdateStadionArgs extends CreateStadionArgs {
  stadionId: number
}

interface DeleteStadionArgs {
  stadionId: number
}

type ResolverContext = {
  prisma: PrismaClient
}

export const stadionResolvers = {
  Query: {
    stadions: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
      return prisma.stadion.findMany({
        include: {
          fields: true,
          facilities: true,
          images: true,
          operatingHours: true,
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
          operatingHours: true,
        },
      })
    },
  },
  Mutation: {
    createStadion: async (_: unknown, args: CreateStadionArgs, { prisma }: ResolverContext) => {
      return prisma.stadion.create({
        data: {
          name: args.name,
          description: args.description,
          mapUrl: args.mapUrl,
        },
        include: {
          fields: true,
          facilities: true,
          images: true,
          operatingHours: true,
        },
      })
    },
    updateStadion: async (_: unknown, args: UpdateStadionArgs, { prisma }: ResolverContext) => {
      const { stadionId, name, description, mapUrl } = args

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
          operatingHours: true,
        },
      })
    },
    deleteStadion: async (_: unknown, { stadionId }: DeleteStadionArgs, { prisma }: ResolverContext) => {
      const id = Number(stadionId)

      return prisma.$transaction(async (tx) => {
        await tx.stadionFacility.deleteMany({ where: { stadionId: id } })
        await tx.imageStadion.deleteMany({ where: { stadionId: id } })
        await tx.operatingHour.deleteMany({ where: { stadionId: id } })
        await tx.field.deleteMany({ where: { stadionId: id } })

        return tx.stadion.delete({
          where: { id },
          include: {
            fields: true,
            facilities: true,
            images: true,
            operatingHours: true,
          },
        })
      })
    },
  },
}
