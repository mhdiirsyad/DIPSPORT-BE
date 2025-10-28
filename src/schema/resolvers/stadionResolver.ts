import { prisma } from "../../lib/prisma.js"

export const stadionResolvers = {
  Query: {
    stadions: async () => {
      return prisma.stadion.findMany({
        include: {fields: true}         
      })
    },

    stadion: async (args: any) => {
      return prisma.stadion.findUnique(args.id)
    }
  }
}
