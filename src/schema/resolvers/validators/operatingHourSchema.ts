import * as yup from "yup"

export const operatingHourUpdateSchema = yup
  .object({
    openHour: yup
      .number()
      .typeError("Jam buka harus berupa angka")
      .integer("Jam buka harus bilangan bulat")
      .min(0, "Jam buka minimal 0")
      .max(23, "Jam buka maksimal 23")
      .required("Jam buka harus diisi"),
    closeHour: yup
      .number()
      .typeError("Jam tutup harus berupa angka")
      .integer("Jam tutup harus bilangan bulat")
      .min(1, "Jam tutup minimal 1")
      .max(24, "Jam tutup maksimal 24")
      .required("Jam tutup harus diisi")
      .test(
        "is-after-open",
        "Jam tutup harus setelah jam buka",
        function (value) {
          const { openHour } = this.parent
          if (typeof value !== "number" || typeof openHour !== "number") return true
          return value > openHour
        }
      ),
  })
  .strict(true)
