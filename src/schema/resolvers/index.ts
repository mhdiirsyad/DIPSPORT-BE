import { DateTimeResolver } from "graphql-scalars"
import { fieldResolvers } from "./fieldResolver.js"

export default {
  Query: {
    stadions: async (_: any, __: any, { prisma }: any) => {
      return prisma.stadion.findMany({
        include: { fields: true, images: true, operatingHours: true },
      })
    },

    // perbaikan: menambahkan resolver stadion by id (return boleh null sesuai schema)
    stadion: async (_: any, { stadionId }: { stadionId: string | number }, { prisma }: any) => {
      const id = Number(stadionId)
      if (!Number.isInteger(id)) return null
      return prisma.stadion.findUnique({
        where: { id },
        include: { fields: true, images: true, operatingHours: true },
      })
    },

    admins: async (_: any, __: any, { prisma }: any) => {
      return prisma.admin.findMany({ orderBy: { id: "asc" } })
    },

    // gabungkan Query dari modul field
    ...(fieldResolvers.Query || {}),
  },

  Mutation: {
    // Create stadion (sudah ada)
    createStadion: async (_: any, args: any, { prisma }: any) => {
      const { name, description, mapUrl } = args
      return prisma.stadion.create({
        data: { name, description, mapUrl },
      })
    },

    // perbaikan: updateStadion harus mengembalikan Stadion!
    updateStadion: async (
      _: any,
      { stadionId, name, description, mapUrl }: { stadionId: string | number; name: string; description?: string; mapUrl: string },
      { prisma }: any
    ) => {
      const id = Number(stadionId)
      if (!Number.isInteger(id)) throw new Error("stadionId tidak valid")

      // Pastikan — supaya tidak return null
      const exists = await prisma.stadion.findUnique({ where: { id }, select: { id: true } })
      if (!exists) throw new Error(`Stadion dengan id ${id} tidak ditemukan`)

      return prisma.stadion.update({
        where: { id },
        data: { name, description: description ?? null, mapUrl },
        include: { fields: true, images: true, operatingHours: true },
      })
    },

    // perbaikan: deleteStadion harus mengembalikan Boolean! (true/false, bukan null)
    deleteStadion: async (_: any, { stadionId }: { stadionId: string | number }, { prisma }: any) => {
      const id = Number(stadionId)
      if (!Number.isInteger(id)) throw new Error("stadionId tidak valid")

      const exists = await prisma.stadion.findUnique({ where: { id }, select: { id: true } })
      if (!exists) return false

      // Opsional: hapus child lebih dulu kalo FK onDelete ga cascade
      await prisma.imageStadion.deleteMany({ where: { stadionId: id } })
      await prisma.field.deleteMany({ where: { stadionId: id } })
      await prisma.operatingHour.deleteMany({ where: { stadionId: id } })

      await prisma.stadion.delete({ where: { id } })
      return true
    },

    // gabungkan Mutasi dari modul field (createField/updateField/deleteField)
    ...(fieldResolvers.Mutation || {}),
  },

  DateTime: DateTimeResolver,
}