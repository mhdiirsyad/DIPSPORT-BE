import { prisma } from "../../lib/prisma.js";
export const stadionResolvers = {
    Query: {
        stadions: async () => {
            return prisma.stadion.findMany({
                include: { fields: true }
            });
        },
        stadion: async (args) => {
            return prisma.stadion.findUnique(args.id);
        }
    }
};
