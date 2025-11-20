// src/schema/resolvers/validators/facilitySchema.ts
import * as yup from "yup";

export const VALID_FACILITY_ICONS = [
  "heroicons:clipboard-document-list",  // Papan Skor
  "lucide:monitor",                     // Papan Skor Digital
  "heroicons:speaker-wave",             // Sound System
  "lucide:mic",                         // Announcer / MC
  "heroicons:tv",                       // TV Layar Lebar
  "heroicons:plus-circle",              // P3K / Medis
  "lucide:package-plus",                // Kotak P3K
  "lucide:flame-kindling",              // APAR
  "heroicons:video-camera",             // CCTV
  "heroicons:shield-check",             // Keamanan 24 Jam
  "heroicons:light-bulb",               // Lampu Sorot
  "lucide:moon",                        // Tersedia Jam Malam
  "lucide:shower-head",                 // Toilet / WC
  "heroicons:lock-closed",              // Loker
  "heroicons:users",                    // Ruang Ganti
  "lucide:bike",                        // Parkir Motor
  "heroicons:truck",                    // Parkir Bus / Luas
  "heroicons:bolt",                     // Charging Station
  "lucide:plug",                        // Stop Kontak
  "lucide:coffee",                      // Kantin / Coffee Shop
  "heroicons:building-storefront",      // Kantin / Toko
  "lucide:droplet",                     // Air
  "lucide:glass-water",                 // Dispenser
  "heroicons:wifi",                     // WiFi Gratis
  "lucide:armchair",                    // Tribun / Kursi
  "heroicons:user-group",               // Kapasitas Penonton
  "heroicons:trophy",                   // Bisa Turnamen
  "lucide:package-check",               // Peralatan Lengkap
  "lucide:home",                        // Mushola
  "lucide:cigarette-off",               // Dilarang Merokok
  "lucide:cigarette",                   // Area Merokok
  "lucide:trash-2",                     // Tempat Sampah
  "lucide:umbrella",                    // Beratap (Anti Hujan)
  "heroicons:building-office-2",        // Indoor (Tertutup)
  "lucide:sun",                         // Outdoor
  "heroicons:sparkles",                 // Premium / VIP
  "heroicons:star",                     // Rating Tinggi
  "heroicons:credit-card",              // Kartu Kredit/Debit
  "lucide:qr-code",                     // QRIS
  "heroicons:banknotes",                // Tunai (Cash)
  "heroicons:ticket",                   // Loket / Tiket Fisik
  "lucide:megaphone",                   // Event
  "lucide:waves",                       // Kolam Renang
  "lucide:layers",                      // Permukaan Standar
  "lucide:leaf",                        // Rumput Asli
  "lucide:grid-3x3",                    // Rumput Sintetis
  "heroicons:clock",                    // Ruang Tunggu
  "lucide:briefcase",                   // Area Penitipan Barang
  "lucide:more-horizontal",             // Fasilitas Umum Lainnya
] as const; 

export const facilityCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Nama fasilitas minimal 3 karakter")
    .max(50, "Nama fasilitas maksimal 50 karakter")
    .required("Nama fasilitas wajib diisi"),

  icon: yup
    .string()
    .trim()
    .oneOf(
      VALID_FACILITY_ICONS,
      "Ikon tidak valid. Pilih salah satu dari daftar ikon yang tersedia."
    )
    .optional()
    .nullable(),
}).strict(true);

export const facilityUpdateSchema = facilityCreateSchema.shape({
  facilityId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "ID fasilitas harus berupa angka (string)")
    .required("ID fasilitas wajib diisi"),
});

export const facilityDeleteSchema = yup
  .object({
    facilityId: yup
      .string()
      .trim()
      .matches(/^\d+$/, "ID fasilitas harus berupa angka (string)")
      .required("ID fasilitas wajib diisi"),
  })
  .strict(true);