import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

interface BookingDetail {
  fieldId: number
  bookingDate: Date | string
  startHour: number
  pricePerHour: number
  subtotal: number
  Field?: {
    name: string
    Stadion?: {
      name: string
      mapUrl: string
    }
  }
}

interface BookingReminderData {
  bookingCode: string
  name: string
  email: string
  contact: string
  institution?: string
  isAcademic: boolean
  totalPrice: number
  paymentStatus: string
  details: BookingDetail[]
}

export const generateBookingReminderEmail = (booking: BookingReminderData): string => {
  const detailsByDate = booking.details.reduce((acc, detail) => {
    const dateKey = dayjs(detail.bookingDate).format('YYYY-MM-DD')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(detail)
    return acc
  }, {} as Record<string, typeof booking.details>)

  const firstDetail = booking.details[0]
  const stadionName = firstDetail?.Field?.Stadion?.name || 'Stadion'
  const fieldName = firstDetail?.Field?.name || 'Lapangan'
  const mapUrl = firstDetail?.Field?.Stadion?.mapUrl || '#'

  const tomorrowDate = dayjs(firstDetail?.bookingDate).format('dddd, DD MMMM YYYY')
  
  const bookingDetailsHtml = Object.entries(detailsByDate).map(([dateKey, details]) => {
    const formattedDate = dayjs(dateKey).format('dddd, DD MMMM YYYY')
    const timeSlots = details
      .sort((a, b) => a.startHour - b.startHour)
      .map(d => `${String(d.startHour).padStart(2, '0')}:00-${String(d.startHour + 1).padStart(2, '0')}:00`)
      .join(', ')
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">📅 ${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">⏰ ${timeSlots}</td>
      </tr>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengingat Booking - VENUE UNDIP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔔 Pengingat Booking</h1>
                            <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">Booking Anda Besok!</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">Halo <strong>${booking.name}</strong>,</p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                Ini adalah <strong>pengingat</strong> bahwa Anda memiliki booking <strong>besok, ${tomorrowDate}</strong>. Pastikan Anda sudah siap!
                            </p>
                            
                            <!-- Reminder Alert -->
                            <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #92400e;">⏰ BESOK!</p>
                                <p style="margin: 10px 0 0 0; font-size: 18px; color: #92400e; font-weight: 600;">${tomorrowDate}</p>
                            </div>
                            
                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #fffbeb; border-radius: 8px; overflow: hidden; border: 2px solid #fde68a;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Kode Booking</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a;">
                                                    <span style="background-color: #f59e0b; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 18px;">${booking.bookingCode}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Nama Pemesan</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a;">${booking.name}</td>
                                            </tr>
                                            ${booking.isAcademic && booking.institution ? `
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Institusi</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a;">${booking.institution}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Stadion</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a;">${stadionName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Lapangan</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a;">${fieldName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fde68a; color: #6b7280; font-weight: 600;">Jadwal Booking</td>
                                            </tr>
                                            ${bookingDetailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Checklist -->
                            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                                <p style="margin: 0 0 15px 0; color: #1e40af; font-weight: 600; font-size: 18px;">✅ Checklist Persiapan</p>
                                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                                    <li>Datang <strong>15 menit sebelum</strong> waktu booking</li>
                                    <li>Bawa <strong>kartu identitas</strong> yang valid</li>
                                    <li>Siapkan <strong>kode booking: ${booking.bookingCode}</strong></li>
                                    <li>Pakai pakaian dan sepatu olahraga yang nyaman</li>
                                    <li>Periksa kondisi cuaca sebelum berangkat</li>
                                </ul>
                            </div>
                            

                            <!-- Location Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${mapUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">
                                            📍 Lihat Lokasi di Maps
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Contact Info -->
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Perlu Bantuan?</p>
                                <p style="margin: 0; color: #1e3a8a;">
                                    Hubungi kami jika ada pertanyaan:<br>
                                    📞 <strong>+62 851-6566-0339</strong><br>
                                    📧 <strong>helpdesk@live.undip.ac.id</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 16px; color: #374151; text-align: center;">
                                Sampai jumpa besok!<br>
                                <strong>Tim VENUE UNDIP</strong> 🏟️
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                Email ini dikirim otomatis oleh sistem VENUE UNDIP<br>
                                © ${new Date().getFullYear()} VENUE UNDIP - Universitas Diponegoro
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `
}
