import type { PrismaClient, Status } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import {
  fieldCreateSchema,
  fieldUpdateSchema,
  fieldDeleteSchema,
} from "./validators/fieldSchema.js"

type ID = number | string
interface FieldArgs {
  fieldId: ID
}

interface FieldsArgs {
  stadionId?: ID
}

interface FieldImageInput {
  imageUrl: string
}

interface CreateFieldArgs {
  stadionId: number
  name: string
  description?: string
  pricePerHour: number
  images?: FieldImageInput[]
  status?: Status
}

interface UpdateFieldArgs extends CreateFieldArgs {
  fieldId: ID
}

interface DeleteFieldArgs {
  fieldId: ID
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
        include: { images: true, bookingDetails: true, Stadion: true },
      })
    },
    field: async (_: unknown, { fieldId }: FieldArgs, { prisma }: ResolverContext) => {
      return prisma.field.findUnique({
        where: { id: Number(fieldId) },
        include: { images: true, bookingDetails: true, Stadion: true },
      })
    },
  },

  Mutation: {
    createField: async (_: unknown, args: CreateFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldCreateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, pricePerHour, images, status } = validated
      const parentStadion = await prisma.stadion.findUnique({
        where: { id: Number(stadionId) },
        select: { status: true },
      })
      if (!parentStadion) {
        throw new Error('Stadion induk tidak ditemukan.')
      }
      if (parentStadion.status === 'INACTIVE' && status === 'ACTIVE') {
        throw new Error(
          'Tidak dapat membuat lapangan aktif karena stadion induk non-aktif.'
        )
      }
      const finalStatus: Status = status ?? 'ACTIVE'
      return prisma.field.create({
        data: {
          stadionId: Number(stadionId),
          name,
          description: description ?? null,
          pricePerHour,
          status: finalStatus,
          images: images
            ? { create: images.map((img) => ({ imageUrl: img.imageUrl })) }
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
      const {
        fieldId,
        stadionId,
        name,
        description,
        pricePerHour,
        images,
        status,
      } = validated
      if (status === "ACTIVE") {
        const parentStadion = await prisma.stadion.findUnique({
          where: { id: Number(stadionId) },
          select: { status: true },
        })
        if (parentStadion?.status === "INACTIVE") {
          throw new Error("Tidak dapat mengaktifkan lapangan karena stadion induknya non-aktif.")
        }
      }
      return prisma.$transaction(async (tx) => {
        if (images) {
          await tx.imageField.deleteMany({ where: { fieldId: Number(fieldId) } })
        }
        return tx.field.update({
          where: { id: Number(fieldId) },
          data: {
            stadionId,
            name,
            description,
            pricePerHour,
            status: status || undefined,
            images: images
              ? { create: images.map((image) => ({ imageUrl: image.imageUrl })) }
              : undefined,
          },
          include: { images: true, bookingDetails: true },
        })
      })
    },
    
    deleteField: async (_: unknown, args: DeleteFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldDeleteSchema.validate(args, { abortEarly: false })
      const id = Number(validated.fieldId)
      return prisma.$transaction(async (tx) => {
        await tx.bookingDetail.deleteMany({ where: { fieldId: id } })
        await tx.imageField.deleteMany({ where: { fieldId: id } })
        return tx.field.delete({
          where: { id },
          include: { images: true, bookingDetails: true },
        })
      })
    },
  },
}