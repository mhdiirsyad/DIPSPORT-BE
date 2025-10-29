import { prisma } from "../../lib/prisma.js" 

export const fieldResolvers = {
  Query: {
    fields: async () =>
      prisma.field.findMany({ include: { images: true, bookingDetails: true } }),

    field: async (_: any, { fieldId }: { fieldId: number }) =>
      prisma.field.findUnique({
        where: { id: Number(fieldId) },
        include: { images: true, bookingDetails: true },
      }),
  },

  Mutation: {
    createField: async (
      _: any,
      args: { stadionId: number; name: string; description?: string; pricePerHour: number; images?: { imageUrl: string }[] }
    ) => {
      try {
        console.log("[createField] args =", args)

        const stadionId = Number(args.stadionId)
        if (!Number.isInteger(stadionId)) throw new Error("stadionId tidak valid")
        if (typeof args.pricePerHour !== "number") throw new Error("pricePerHour harus number")

        const stadion = await prisma.stadion.findUnique({ where: { id: stadionId }, select: { id: true } })
        if (!stadion) throw new Error(`Stadion ${stadionId} tidak ditemukan`)

        const created = await prisma.field.create({
          data: {
            stadionId,
            name: args.name,
            description: args.description ?? null,
            pricePerHour: args.pricePerHour,
            images: args.images?.length
              ? { create: args.images.map(i => ({ imageUrl: i.imageUrl })) }
              : undefined,
          },
          include: { images: true, bookingDetails: true, Stadion: true }, 
        })

        console.log("[createField] created =", created?.id)
        return created // <— WAJIB return object Field
      } catch (e: any) {
        console.error("[createField] ERROR =", e?.message || e)
        throw new Error(e?.message || "Gagal membuat Field")
      }
    },

    updateField: async (_: any, { fieldId, stadionId, name, description, pricePerHour }: any) =>
      prisma.field.update({
        where: { id: Number(fieldId) },
        data: { stadionId: Number(stadionId), name, description, pricePerHour: Number(pricePerHour) },
      }),

    deleteField: async (_: any, { fieldId }: { fieldId: number }) => {
      await prisma.imageField.deleteMany({ where: { fieldId: Number(fieldId) } })
      await prisma.field.delete({ where: { id: Number(fieldId) } })
      return true
    },
  },
}