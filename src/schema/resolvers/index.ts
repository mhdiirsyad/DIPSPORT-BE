import { DateResolver } from "graphql-scalars"

export default {
  Query: {
    stadions: async(_:any, __:any, {prisma}: any) => {
      return prisma.stadion.findMany({
        include: {
          fields: true,
          images: true,
        }
      })
    }
  },

  Mutation: {
    createStadion: async(_:any, args:any, {prisma}: any) => {
      const {name, description, mapUrl} = args
      return prisma.stadion.create({
        data: {
          name,
          description,
          mapUrl,
        }
      })
    }
  },

  DateTime: DateResolver
}