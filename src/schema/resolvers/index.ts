import { DateTimeResolver } from "graphql-scalars"
import { GraphQLError } from "graphql"
import { generateToken, verifyPassword } from "../../lib/auth.js"
import { requireAuth } from "../../lib/context.js"

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
    me: async (_: any, __: any, { prisma, admin }: any) => {
      const currentAdmin = requireAuth(admin)

      return prisma.admin.findUnique({
        where: { id: currentAdmin.adminId },
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
    login: async (_: any, { email, password }: any, { prisma }: any) => {
      const admin = await prisma.admin.findUnique({
        where: { email },
      })

      if (!admin) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const isValidPassword = await verifyPassword(password, admin.password)

      if (!isValidPassword) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const token = generateToken({
        adminId: admin.id,
        email: admin.email ?? null,
        name: admin.name,
      })

      const { password: _password, ...safeAdmin } = admin

      return {
        token,
        admin: safeAdmin,
      }
    },
  },

  DateTime: DateTimeResolver,
}
