import { prisma } from "../../lib/prisma";

export const fieldResolvers = {
  Query: {
    fields: async () => {
      return await prisma.field.findMany({
        include: { images: true, bookingDetails: true }
      });
    },

    field: async (_: any, { fieldId }: { fieldId: number }) => {
      return await prisma.field.findUnique({
        where: { id: fieldId },
        include: {
          images: true,
          bookingDetails: true,
        }
      })
    }
  },

  Mutation: {
    createField: async (
      _: any,
      { stadionId, name, description, pricePerHour, images }: { stadionId: number, name: string, description?: string, pricePerHour: number, images?: { imageUrl: string }[] }
    ) => {
      return await prisma.field.create({
        data: {
          stadionId,
          name,
          description,
          pricePerHour,
          images: images ? {
            create: images.map((i) => ({
              imageUrl: i.imageUrl
            }))
          } : undefined
        }
      })
    },

    updateField: async (
      _: any,
      { fieldId, stadionId, name, description, pricePerHour }: { fieldId: number, stadionId: number, name: string, description?: string, pricePerHour: number }
    ) => {
      return await prisma.field.update({
        where: { id: fieldId },
        data: {
          stadionId,
          name,
          description,
          pricePerHour,
        }
      })
    },

    deleteField: async (
      _: any,
      { fieldId }: { fieldId: number }
    ) => {
      await prisma.imageField.deleteMany({ where: { id: fieldId } })
      return await prisma.field.delete({
        where: { id: fieldId }
      })
    }
  }
}