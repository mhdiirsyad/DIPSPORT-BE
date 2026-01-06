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

interface BookingConfirmationData {
  bookingCode: string
  name: string
  email: string
  contact: string
  institution?: string
  isAcademic: boolean
  totalPrice: number
  details: BookingDetail[]
}

export const generateBookingConfirmationEmail = (booking: BookingConfirmationData): string => {
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

  const bookingDetailsHtml = Object.entries(detailsByDate).map(([dateKey, details]) => {
    const formattedDate = dayjs(dateKey).format('dddd, DD MMMM YYYY')
    const timeSlots = details
      .sort((a, b) => a.startHour - b.startHour)
      .map(d => `${String(d.startHour).padStart(2, '0')}:00-${String(d.startHour + 1).padStart(2, '0')}:00`)
      .join(', ')
    
    return `
      <tr>
        <td colspan="2" style="padding: 12px 16px; background-color: #eff6ff; border-radius: 8px;">
          <div style="margin-bottom: 8px;">
            <span style="color: #3b82f6; font-weight: 600;">📅 ${formattedDate}</span>
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
    <title>Konfirmasi Booking - VENUE UNDIP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ Booking Berhasil!</h1>
                            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px;">Terima kasih telah melakukan booking di VENUE UNDIP</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">Halo <strong>${booking.name}</strong>,</p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                Booking Anda telah berhasil dikonfirmasi! Berikut adalah detail booking Anda:
                            </p>
                            
                            <!-- Booking Code Highlight -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Kode Booking Anda</p>
                                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display: inline-block; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                    <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${booking.bookingCode}</span>
                                </div>
                            </div>

                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f9fafb; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">📋 Detail Booking</h3>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 40%; vertical-align: top;">👤 Nama Pemesan</td>
                                                <td style="padding: 12px 0; color: #1f2937; font-weight: 500;">${booking.name}</td>
                                            </tr>
                                            ${booking.isAcademic && booking.institution ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; vertical-align: top;">🏫 Institusi</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${booking.institution}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; vertical-align: top;">🏟️ Stadion</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${stadionName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; vertical-align: top;">⚽ Lapangan</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${fieldName}</td>
                                            </tr>
                                        </table>
                                        
                                        <h4 style="margin: 24px 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📅 Jadwal Booking</h4>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            ${bookingDetailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <div style="background: linear-gradient(to right, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 24px; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);">
                                <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 700; font-size: 17px; display: flex; align-items: center;">
                                    <span style="font-size: 24px; margin-right: 8px;">⚠️</span> Hal Penting yang Perlu Diperhatikan
                                </p>
                                <ul style="margin: 0; padding-left: 24px; color: #78350f; line-height: 1.8;">
                                    <li style="margin-bottom: 8px;">Harap datang <strong>15 menit sebelum</strong> waktu booking</li>
                                    <li style="margin-bottom: 8px;">Tunjukkan <strong>kode booking</strong> ini kepada petugas</li>
                                    <li style="margin-bottom: 8px;">Bawa kartu identitas yang valid</li>
                                    ${!booking.isAcademic ? '<li>Lakukan pembayaran di tempat sebelum mulai bermain</li>' : ''}
                                </ul>
                            </div>
                            
                            <!-- Location Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${mapUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                                            <span style="font-size: 20px; margin-right: 8px;">📍</span> Lihat Lokasi di Maps
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Contact Info -->
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Butuh Bantuan?</p>
                                <p style="margin: 0; color: #1e3a8a;">
                                    Hubungi kami di:<br>
                                    📞 <strong>+62 851-6566-0339</strong><br>
                                    📧 <strong>helpdesk@live.undip.ac.id</strong>
                                </p>
                            </div>
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
