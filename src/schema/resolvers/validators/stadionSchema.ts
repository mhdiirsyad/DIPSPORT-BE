// src/schema/resolvers/validators/stadionSchema.ts
import * as yup from "yup";
import { Status } from "@prisma/client";

const statusValues = Object.values(Status);

export const stadionCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .required("Nama wajib diisi"),

  description: yup
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional(),

  mapUrl: yup
    .string()
    .trim()
    .url("Map URL harus berupa URL valid")
    .matches(/^https?:\/\//i, "Map URL harus dimulai dengan http atau https")
    .required("Map URL wajib diisi"),

  status: yup
    .mixed<Status>()
    .oneOf(statusValues, `Status tidak valid. Pilihan: ${statusValues.join(", ")}`)
    .optional(),

  facilityIds: yup
    .array()
    .of(yup.number().integer().positive("ID Fasilitas harus angka positif"))
    .max(10, "Anda hanya dapat memilih maksimal 10 fasilitas")
    .optional()
    .nullable()
    .default(null),
}).strict(true);

export const stadionUpdateSchema = stadionCreateSchema.shape({
  stadionId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "stadionId harus berupa angka")
    .required("stadionId wajib diisi"),
});

export const stadionDeleteSchema = yup.object({
  stadionId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "stadionId harus berupa string angka")
    .required("stadionId wajib diisi"),
}).strict(true);