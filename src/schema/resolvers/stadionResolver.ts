import type { PrismaClient, Status } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import {
  stadionCreateSchema,
  stadionUpdateSchema,
  stadionDeleteSchema,
} from "./validators/stadionSchema.js"

type ID = number | string
interface StadionArgs {
  stadionId: ID
}

interface CreateStadionArgs {
  name: string
  description?: string
  mapUrl: string
  status?: Status
  facilityIds?: number[]
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
          facilities: { include: { Facility: true } },
          images: true,
        },
      })
    },
  },

  Mutation: {
    createStadion: async (_: unknown, args: CreateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionCreateSchema.validate(args, { abortEarly: false })
      const { name, description, mapUrl, status, facilityIds } = validated
      const facilityData = (facilityIds || []).map((facId) => ({
        Facility: { connect: { id: Number(facId) } },
      }))
      return prisma.stadion.create({
        data: {
          name,
          description,
          mapUrl,
          status,
          facilities: { create: facilityData },
        },
        include: {
          fields: true,
          facilities: { include: { Facility: true } },
          images: true,
          operatingHours: true,
        },
      })
    },

    updateStadion: async (_: unknown, args: UpdateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionUpdateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, mapUrl, status, facilityIds } = validated
      const id = Number(stadionId)
      return prisma.$transaction(async (tx) => {
        await tx.stadionFacility.deleteMany({ where: { stadionId: id } })
        const newFacilityData = (facilityIds || []).map((facId) => ({
          Facility: { connect: { id: Number(facId) } },
        }))
        const updatedStadion = await tx.stadion.update({
          where: { id },
          data: {
            name,
            description,
            mapUrl,
            status,
            facilities: { create: newFacilityData },
          },
          include: {
            fields: true,
            facilities: { include: { Facility: true } },
            images: true,
            operatingHours: true,
          },
        })
        if (status === "INACTIVE") {
          await tx.field.updateMany({
            where: { stadionId: id },
            data: { status: "INACTIVE" },
          })
        }
        return updatedStadion
      })
    },
    
    deleteStadion: async (_: unknown, args: DeleteStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionDeleteSchema.validate(args, { abortEarly: false })
      const id = Number(validated.stadionId)
      return prisma.stadion.delete({
        where: { id },
        include: {
          fields: true,
          facilities: true,
          images: true,
        },
      })
    },
  },
}
