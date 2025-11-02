import type { PrismaClient } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import { fieldCreateSchema, fieldUpdateSchema } from "./validators/fieldSchema.js"

type ID = number | string

interface FieldArgs {
  fieldId: ID
}

interface FieldsArgs {
  stadionId?: ID
}

interface CreateFieldArgs {
  stadionId: number
  name: string
  description?: string
  pricePerHour: number
  images?: FieldImageInput[]
}

interface UpdateFieldArgs extends CreateFieldArgs {
  fieldId: ID
}

interface DeleteFieldArgs {
  fieldId: ID
}

interface FieldImageInput {
  imageUrl: string
}

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

export const fieldResolvers = {
  Query: {
    fields: async (_: unknown, args: FieldsArgs, { prisma }: ResolverContext) => {
      return prisma.field.findMany({
        where: args.stadionId ? { stadionId: Number(args.stadionId) } : undefined,
        include: {
          images: true,
          bookingDetails: true,
        },
      })
    },
    field: async (_: unknown, { fieldId }: FieldArgs, { prisma }: ResolverContext) => {
      return prisma.field.findUnique({
        where: { id: Number(fieldId) },
        include: {
          images: true,
          bookingDetails: true,
        },
      })
    },
  },
  Mutation: {
    createField: async (_: unknown, args: CreateFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldCreateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, pricePerHour, images } = validated

      return prisma.field.create({
        data: {
          stadionId,
          name,
          description,
          pricePerHour,
          images: images
            ? {
                create: images.map((image) => ({
                  imageUrl: image.imageUrl,
                })),
              }
            : undefined,
        },
        include: {
          images: true,
          bookingDetails: true,
        },
      })
    },
    updateField: async (_: unknown, args: UpdateFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldUpdateSchema.validate(args, { abortEarly: false })
      const { fieldId, stadionId, name, description, pricePerHour, images } = validated

      return prisma.field.update({
        where: { id: Number(fieldId) },
        data: {
          stadionId,
          name,
          description,
          pricePerHour,
          ...(images
            ? {
                images: {
                  deleteMany: {},
                  create: images.map((image) => ({
                    imageUrl: image.imageUrl,
                  })),
                },
              }
            : {}),
        },
        include: {
          images: true,
          bookingDetails: true,
        },
      })
    },
    deleteField: async (_: unknown, { fieldId }: DeleteFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)

      const id = Number(fieldId)

      return prisma.$transaction(async (tx) => {
        await tx.bookingDetail.deleteMany({ where: { fieldId: id } })
        await tx.imageField.deleteMany({ where: { fieldId: id } })

        return tx.field.delete({
          where: { id },
          include: {
            images: true,
            bookingDetails: true,
          },
        })
      })
    },
  },
}
