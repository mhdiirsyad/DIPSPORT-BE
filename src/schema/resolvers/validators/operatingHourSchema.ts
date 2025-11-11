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
      .test(
        "is-after-open",
        "Jam tutup harus setelah jam buka",
        function (value) {
          const { openTime } = this.parent
          if (!value || !openTime) return true
          return new Date(value).getTime() > new Date(openTime).getTime()
        }
      ),
  })
  .strict(true)

// Update schema - excludes stadionId (can't change stadium of existing hours)
export const operatingHourUpdateSchema = yup
  .object({
    id: yup
      .number()
      .typeError("ID harus berupa angka")
      .integer("ID harus bilangan bulat")
      .positive("ID harus lebih besar dari 0")
      .required("ID wajib diisi"),
    day: yup
      .mixed<DayofWeek>()
      .oneOf(dayofWeekValues, "Hari tidak valid")
      .required("Hari harus diisi"),
    openTime: yup.date().required("Jam buka harus diisi"),
    closeTime: yup
      .date()
      .required("Jam tutup harus diisi")
      .test(
        "is-after-open",
        "Jam tutup harus setelah jam buka",
        function (value) {
          const { openTime } = this.parent
          if (!value || !openTime) return true
          return new Date(value).getTime() > new Date(openTime).getTime()
        }
      ),
  })
  .strict(true)
