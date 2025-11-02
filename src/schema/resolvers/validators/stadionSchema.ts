import * as yup from "yup"

export const stadionCreateSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .required("Nama wajib diisi"),
    description: yup.string().trim().max(1000, "Deskripsi maksimal 1000 karakter").optional(),
    mapUrl: yup
      .string()
      .trim()
      .required("Map URL wajib diisi")
      .url("Map URL harus berupa URL valid")
      .matches(/^https?:\/\//i, "Map URL harus dimulai dengan http atau https"),
  })
  .strict(true)

export const stadionUpdateSchema = stadionCreateSchema.shape({
  stadionId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "stadionId harus berupa angka")
    .required("stadionId wajib diisi"),
})
