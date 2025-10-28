import { DateTimeResolver } from "graphql-scalars"

export default {
  Query: {
    stadions: async (_: any, __: any, { prisma }: any) => {
      return prisma.stadion.findMany({
        include: {
          fields: true,
          images: true,
        },
      })
    },
    admins: async (_: any, __: any, { prisma }: any) => {
      return prisma.admin.findMany({
        orderBy: { id: "asc" },
      })
    },
  },

  Mutation: {
    createStadion: async (_: any, args: any, { prisma }: any) => {
      const { name, description, mapUrl } = args
      return prisma.stadion.create({
        data: {
          name,
          description,
          mapUrl,
        },
      })
    },
  },

  DateTime: DateTimeResolver,
}