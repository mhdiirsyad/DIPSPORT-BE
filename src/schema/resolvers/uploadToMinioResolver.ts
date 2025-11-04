import { PrismaClient } from "@prisma/client";
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { requireAuth } from "../../lib/context.js";
import { uploadToMinio } from "../../lib/uploadImageMinio.js";


type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

export const stadionImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadStadionImages: async (
      _: unknown,
      { stadionId, files }: { stadionId: number; files: Promise<FileUpload>[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)

      const stadion = await prisma.stadion.findUnique({ where: { id: stadionId } })
      if (!stadion) throw new Error("Stadion tidak ditemukan")

      const resolvedFiles = await Promise.all(files)

      const uploadedImages: string[] = []
      for (const file of resolvedFiles) {
        const publicUrl = await uploadToMinio({ file: Promise.resolve(file) }, "stadion-images")
        uploadedImages.push(publicUrl)
      }

      await prisma.imageStadion.createMany({
        data: uploadedImages.map((url) => ({
          imageUrl: url,
          stadionId,
        })),
      })
      
      return {
        count: uploadedImages.length,
        imageUrls: uploadedImages,
      }
    },
  },
}

export const fieldImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadStadionImages: async (
      _: unknown,
      { fieldId, files }: { fieldId: number; files: Promise<FileUpload>[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin)

      const field = await prisma.field.findUnique({ where: { id: fieldId } })
      if (!field) throw new Error("Field tidak ditemukan")

      const resolvedFiles = await Promise.all(files)

      const uploadedImages: string[] = []
      for (const file of resolvedFiles) {
        const publicUrl = await uploadToMinio({ file: Promise.resolve(file) }, "field-images")
        uploadedImages.push(publicUrl)
      }

      await prisma.imageField.createMany({
        data: uploadedImages.map((url) => ({
          imageUrl: url,
          fieldId,
        })),
      })
      
      return {
        count: uploadedImages.length,
        imageUrls: uploadedImages,
      }
    },
  },
}
