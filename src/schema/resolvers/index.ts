import type { PrismaClient } from "@prisma/client"
import { DateTimeResolver } from "graphql-scalars"
import { GraphQLError } from "graphql"
import { generateToken, verifyPassword } from "../../lib/auth.js"
import { requireAuth } from "../../lib/context.js"
import { stadionResolvers } from "./stadionResolver.js"
import { fieldResolvers } from "./fieldResolver.js"
import { bookingResolvers } from "./bookingResolver.js"
import { operatingHourResolvers } from "./operatingHourResolver.js"

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

const resolvers = {
  Query: {
    ...stadionResolvers.Query,
    ...fieldResolvers.Query,
    ...bookingResolvers.Query,
    ...operatingHourResolvers.Query,
    me: async (_: unknown, __: unknown, { prisma, admin }: ResolverContext) => {
      const currentAdmin = requireAuth(admin)

      return prisma.admin.findUnique({
        where: { id: currentAdmin.adminId },
      })
    },
  },
  Mutation: {
    ...stadionResolvers.Mutation,
    ...fieldResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...operatingHourResolvers.Mutation,
    login: async (_: unknown, { email, password }: { email: string; password: string }, { prisma }: ResolverContext) => {
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

export default resolvers