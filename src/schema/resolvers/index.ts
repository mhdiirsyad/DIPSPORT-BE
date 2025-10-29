import { DateTimeResolver } from "graphql-scalars"
import { stadionResolvers } from "./stadionResolver"
import { fieldResolvers } from "./fieldResolver"

export default {
  Query: {
    // stadions: async(_:any, __:any, {prisma}: any) => {
    //   return prisma.stadion.findMany({
    //     include: {
    //       fields: true,
    //       images: true,
    //     }
    //   })
    // }
    ...stadionResolvers.Query,
    ...fieldResolvers.Query,
  },

  Mutation: {
    // createStadion: async(_:any, args:any, {prisma}: any) => {
    //   const {name, description, mapUrl} = args
    //   return prisma.stadion.create({
    //     data: {
    //       name,
    //       description,
    //       mapUrl,
    //     }
    //   })
      ...stadionResolvers.Mutation,
      ...fieldResolvers.Mutation,
    },

  DateTime: DateTimeResolver,
}