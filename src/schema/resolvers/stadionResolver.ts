import { prisma } from "../../lib/prisma"

export const stadionResolvers = {
  Query: {
    stadions: async () => {
      return prisma.stadion.findMany({
        include: {
          fields: true,
          facilities: true,
          images: true,
          operatingHours: true,
        }
      })
    },

    stadion: async (_: any, { stadionId }: { stadionId: number }) => {
      return prisma.stadion.findUnique({
        where: { id: stadionId },
        include: {
          fields: true,
          facilities: true,
          images: true,
          operatingHours: true,
        }
      })
    }
  },

  Mutation: {
    createStadion: async (
      _: any,
      { name, description, mapUrl, facilities, images } : { name: string, description?: string, mapUrl: string, facilities?: { facilityId: number }[], images?: { imageUrl: string }[] }
    ) => {
      return await prisma.stadion.create({
        data: {
          name,
          description,
          mapUrl,
          facilities: facilities ? {
            create: facilities.map((f) => ({
              facilityId: f.facilityId
            }))
          } : undefined,
          images: images ? {
            create: images.map((i) => ({
              imageUrl: i.imageUrl
            }))
          } : undefined,
        },
        include: {
          facilities: {include: {Facility: true}},
          images: true,
        }
      })
    },

    updateStadion: async (
      _: any,
      { stadionId, name, description, mapUrl }: { stadionId: number, name: string, description?: string, mapUrl: string }
    ) => {
      return await prisma.stadion.update({
        where: { id: stadionId },
        data: {
          name,
          description,
          mapUrl,
        }
      })
    },

    deleteStadion: async (
      _: any,
      { stadionId }: { stadionId: number }
    ) => {
      await prisma.imageStadion.deleteMany({ where: { id: stadionId } });
      await prisma.field.deleteMany({ where: { id: stadionId } });
      await prisma.operatingHour.deleteMany({ where: { id: stadionId } });
      return await prisma.stadion.delete({
        where: { id: stadionId }
      })
    }
  }
}