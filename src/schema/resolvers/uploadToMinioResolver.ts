import { PrismaClient } from "@prisma/client";
import GraphQLUpload, { FileUpload } from "graphql-upload/GraphQLUpload.mjs";
import { requireAuth } from "../../lib/context.js";
import { uploadToMinio } from "../../lib/uploadImageMinio.js";

type ResolverContext = {
  prisma: PrismaClient;
  admin: {
    adminId: number;
    email: string | null;
    name: string;
  } | null;
};

// Reusable helper for upload resolver
async function handleImageUpload(
  files: any[],
  folder: string,
  prismaCreateMany: (data: { imageUrl: string; parentId: number }[]) => Promise<any>,
  parentId: number
) {
  // resolve semua upload (karena GraphQLUpload kirim Upload object)
  const resolvedFiles = await Promise.all(files.map((f) => f.promise));

  const uploadedImages: string[] = [];
  for (const file of resolvedFiles) {
    const {publicUrl, name} = await uploadToMinio(file, folder);
    const url = await publicUrl
    console.log(url)
    uploadedImages.push(name);
  }

  await prismaCreateMany(
    uploadedImages.map((url) => ({
      imageUrl: url,
      parentId,
    }))
  );

  return {
    count: uploadedImages.length,
    imageUrls: uploadedImages,
  };
}

export const stadionImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadStadionImages: async (
      _: unknown,
      { stadionId, files }: { stadionId: number; files: FileUpload[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);

      const stadion = await prisma.stadion.findUnique({ where: { id: stadionId } });
      if (!stadion) throw new Error("Stadion tidak ditemukan");

      const result = await handleImageUpload(
        files,
        "stadion-images",
        async (data) =>
          prisma.imageStadion.createMany({
            data: data.map((d) => ({
              imageUrl: d.imageUrl,
              stadionId: d.parentId,
            })),
          }),
        stadionId
      );

      return result;
    },
  },
};

export const fieldImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadFieldImages: async (
      _: unknown,
      { fieldId, files }: { fieldId: number; files: FileUpload[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);

      const field = await prisma.field.findUnique({ where: { id: fieldId } });
      if (!field) throw new Error("Field tidak ditemukan");

      const result = await handleImageUpload(
        files,
        "field-images",
        async (data) =>
          prisma.imageField.createMany({
            data: data.map((d) => ({
              imageUrl: d.imageUrl,
              fieldId: d.parentId,
            })),
          }),
        fieldId
      );

      return result;
    },
  },
};
