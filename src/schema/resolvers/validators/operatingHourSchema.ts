import * as yup from "yup"
import { DayofWeek } from "@prisma/client"

const dayofWeekValues = Object.values(DayofWeek)

export const operatingHourSchema = yup
  .object({
    stadionId: yup
      .number()
      .typeError("stadionId harus berupa angka")
      .integer("stadionId harus bilangan bulat")
      .positive("stadionId harus lebih besar dari 0")
      .required("Stadion ID harus diisi"),
    day: yup
      .mixed<DayofWeek>()
      .oneOf(dayofWeekValues, "Hari tidak valid")
      .required("Hari harus diisi"),
    openTime: yup.date().required("Jam buka harus diisi"),
    closeTime: yup
      .date()
      .required("Jam tutup harus diisi")
      .min(yup.ref('openTime'), "Jam tutup harus setelah jam buka"),
  })
  .strict(true)

export const operatingHourUpdateSchema = operatingHourSchema.shape({
  id: yup
    .number()
    .typeError("ID harus berupa angka")
    .integer("ID harus bilangan bulat")
    .positive("ID harus lebih besar dari 0")
    .required("ID wajib diisi"),
})