import { DateTimeResolver } from "graphql-scalars";
import { GraphQLError } from "graphql";
import { verifyPassword, generateToken } from "../lib/auth.js";
export default {
    Query: {
        // Stadion queries
        stadions: async (_, __, { prisma }) => {
            return prisma.stadion.findMany({
                include: {
                    fields: true,
                    images: true,
                },
            });
        },
        // Admin queries (protected)
        me: async (_, __, { prisma, admin }) => {
            if (!admin) {
                throw new GraphQLError("Not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            return prisma.admin.findUnique({
                where: { id: admin.adminId },
            });
        },
        admins: async (_, __, { prisma, admin }) => {
            if (!admin) {
                throw new GraphQLError("Not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            return prisma.admin.findMany({
                orderBy: { createdAt: "desc" },
            });
        },
        admin: async (_, { id }, { prisma, admin }) => {
            if (!admin) {
                throw new GraphQLError("Not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            return prisma.admin.findUnique({
                where: { id: parseInt(id) },
            });
        },
    },
    Mutation: {
        // Auth mutations
        login: async (_, { email, password }, { prisma }) => {
            // Find admin by email
            const admin = await prisma.admin.findUnique({
                where: { email },
            });
            if (!admin) {
                throw new GraphQLError("Invalid email or password", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            // Verify password
            const isValid = await verifyPassword(password, admin.password);
            if (!isValid) {
                throw new GraphQLError("Invalid email or password", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            // Generate token
            const token = generateToken({
                adminId: admin.id,
                email: admin.email,
                name: admin.name,
            });
            // Log login activity
            await prisma.adminLog.create({
                data: {
                    adminId: admin.id,
                    action: "LOGIN",
                    description: "Admin logged in successfully",
                },
            });
            return {
                token,
                admin,
            };
        },
        // Stadion mutations
        createStadion: async (_, args, { prisma }) => {
            const { name, description, mapUrl } = args;
            return prisma.stadion.create({
                data: {
                    name,
                    description,
                    mapUrl,
                },
            });
        },
    },
    DateTime: DateTimeResolver,
};
