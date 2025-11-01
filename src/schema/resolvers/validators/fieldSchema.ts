import * as yup from "yup"

const imageSchema = yup
  .object({
    imageUrl: yup
      .string()
      .trim()
      .url("URL gambar harus valid")
      .matches(/^https?:\/\//i, "URL gambar harus dimulai dengan http atau https")
      .required("URL gambar wajib diisi"),
  })
  .strict(true)

export const fieldCreateSchema = yup
  .object({
    stadionId: yup
      .number()
      .typeError("stadionId harus berupa angka")
      .integer("stadionId harus bilangan bulat")
      .positive("stadionId harus lebih besar dari 0")
      .required("stadionId wajib diisi"),
    name: yup
      .string()
      .trim()
      .min(3, "Nama lapangan minimal 3 karakter")
      .max(100, "Nama lapangan maksimal 100 karakter")
      .required("Nama lapangan wajib diisi"),
    description: yup.string().trim().max(1000, "Deskripsi maksimal 1000 karakter").optional(),
    pricePerHour: yup
      .number()
      .typeError("Harga per jam harus berupa angka")
      .integer("Harga per jam harus bilangan bulat")
      .positive("Harga per jam harus lebih besar dari 0")
      .max(5000000, "Harga per jam terlalu besar")
      .required("Harga per jam wajib diisi"),
    images: yup.array().of(imageSchema).max(10, "Maksimal 10 gambar").optional(),
  })
  .strict(true)

export const fieldUpdateSchema = fieldCreateSchema.shape({
  fieldId: yup
    .number()
    .typeError("fieldId harus berupa angka")
    .integer("fieldId harus bilangan bulat")
    .positive("fieldId harus lebih besar dari 0")
    .required("fieldId wajib diisi"),
})
