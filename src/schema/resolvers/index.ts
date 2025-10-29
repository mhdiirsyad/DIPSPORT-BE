import { DateTimeResolver } from "graphql-scalars"
import { GraphQLError } from "graphql"
import { generateToken, verifyPassword } from "../../lib/auth.js"
import { requireAuth } from "../../lib/context.js"
import { stadionResolvers } from "./stadionResolver.js"
import { fieldResolvers } from "./fieldResolver.js"

export default {
  Query: {
    ...stadionResolvers.Query,
    ...fieldResolvers.Query,
    me: async (_: any, __: any, { prisma, admin }: any) => {
      const currentAdmin = requireAuth(admin)
      return prisma.admin.findUnique({
        where: { id: currentAdmin.adminId },
      })
    },
  },
  Mutation: {
    ...stadionResolvers.Mutation,
    ...fieldResolvers.Mutation,
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