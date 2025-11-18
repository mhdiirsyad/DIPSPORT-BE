import * as yup from "yup"

const bookingDetailSchema = yup.object({
  fieldId: yup.number().required(),
  bookingDate: yup.date().required(),
  startHour: yup.number().min(8, "Minumun jam 8").max(21, "Maksimum jam 21").required(),
  pricePerHour: yup.number(),
  subtotal: yup.number(),
})

export const createBookingSchema = yup.object({
  name: yup.string().trim().required("Nama harus diisi"),
  contact: yup.string().trim().required("Contact harus diisi"),
  email: yup.string().email("Email tidak valid").required("Email harus diisi"),
  institution: yup.string(),
  isAcademic: yup.boolean(),
  suratUrl: yup
    .string()
    .trim()
    .url("Surat harus berupa URL valid")
    .nullable()
    .optional(),
  details: yup.array().of(bookingDetailSchema).min(1, "Mminimal 1 detail booking").required(),
})

export const updateBookingSchema = yup.object({
  bookingCode: yup.string().required("Booking code diperlukan"),
  status: yup.string().oneOf(["PENDING", "APPROVED", "CANCELLED", "DONE"]).required("Status Order diperlukan")
})

export const updatePaymenStatusSchema = yup.object({
  bookingCode: yup.string().required("Booking code diperlukan"),
  paymentStatus: yup.string().oneOf(["UNPAID", "PAID"]).required("Payment Status diperlukan")
})
