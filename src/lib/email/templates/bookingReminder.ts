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
        <td colspan="2" style="padding: 12px 16px; background-color: #fef3c7; border-radius: 8px;">
          <div style="margin-bottom: 8px;">
            <span style="color: #f59e0b; font-weight: 600;">📅 ${formattedDate}</span>
          </div>
          <div>
            <span style="color: #1f2937; font-weight: 500;">⏰ ${timeSlots}</span>
          </div>
        </td>
      </tr>
      <tr><td colspan="2" style="padding: 6px;"></td></tr>
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
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; padding: 28px; margin-bottom: 30px; border-radius: 16px; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
                                <p style="margin: 0; font-size: 32px; font-weight: 900; color: #78350f; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">⏰ BESOK!</p>
                                <p style="margin: 12px 0 0 0; font-size: 20px; color: #92400e; font-weight: 700;">${tomorrowDate}</p>
                            </div>
                            
                            <!-- Booking Code Highlight -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Kode Booking Anda</p>
                                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); display: inline-block; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                                    <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${booking.bookingCode}</span>
                                </div>
                            </div>

                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #fffbeb; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1); border: 2px solid #fde68a;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="margin: 0 0 20px 0; color: #78350f; font-size: 18px; font-weight: 600; border-bottom: 2px solid #fde68a; padding-bottom: 12px;">📋 Detail Booking Besok</h3>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 40%; vertical-align: top;">👤 Nama Pemesan</td>
                                                <td style="padding: 12px 0; color: #1f2937; font-weight: 500;">${booking.name}</td>
                                            </tr>
                                            ${booking.isAcademic && booking.institution ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #6b7280; font-weight: 600; vertical-align: top;">🏫 Institusi</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #1f2937; font-weight: 500;">${booking.institution}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #6b7280; font-weight: 600; vertical-align: top;">🏟️ Stadion</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #1f2937; font-weight: 500;">${stadionName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #6b7280; font-weight: 600; vertical-align: top;">⚽ Lapangan</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fde68a; color: #1f2937; font-weight: 500;">${fieldName}</td>
                                            </tr>
                                        </table>
                                        
                                        <h4 style="margin: 24px 0 16px 0; color: #78350f; font-size: 16px; font-weight: 600;">📅 Jadwal Booking Besok</h4>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            ${bookingDetailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Checklist -->
                            <div style="background: linear-gradient(to right, #dbeafe, #bfdbfe); border-left: 5px solid #3b82f6; padding: 24px; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);">
                                <p style="margin: 0 0 16px 0; color: #1e40af; font-weight: 700; font-size: 19px; display: flex; align-items: center;">
                                    <span style="font-size: 26px; margin-right: 10px;">✅</span> Checklist Persiapan
                                </p>
                                <ul style="margin: 0; padding-left: 28px; color: #1e3a8a; line-height: 2;">
                                    <li style="margin-bottom: 10px;"><strong>⏰ Datang 15 menit sebelum</strong> waktu booking</li>
                                    <li style="margin-bottom: 10px;"><strong>🪪 Bawa kartu identitas</strong> yang valid</li>
                                    <li style="margin-bottom: 10px;"><strong>📱 Siapkan kode booking:</strong> ${booking.bookingCode}</li>
                                    <li style="margin-bottom: 10px;"><strong>👕 Pakai pakaian olahraga</strong> yang nyaman</li>
                                    <li><strong>🌤️ Periksa kondisi cuaca</strong> sebelum berangkat</li>
                                </ul>
                            </div>
                            

                            <!-- Location Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${mapUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                                            <span style="font-size: 22px; margin-right: 10px;">📍</span> Lihat Lokasi di Maps
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
