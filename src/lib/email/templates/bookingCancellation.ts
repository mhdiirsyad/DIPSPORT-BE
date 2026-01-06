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
    }
  }
}

interface BookingCancellationData {
  bookingCode: string
  name: string
  email: string
  institution?: string
  isAcademic: boolean
  details: BookingDetail[]
}

export const generateBookingCancellationEmail = (booking: BookingCancellationData): string => {
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

  const bookingDetailsHtml = Object.entries(detailsByDate).map(([dateKey, details]) => {
    const formattedDate = dayjs(dateKey).format('dddd, DD MMMM YYYY')
    const timeSlots = details
      .sort((a, b) => a.startHour - b.startHour)
      .map(d => `${String(d.startHour).padStart(2, '0')}:00-${String(d.startHour + 1).padStart(2, '0')}:00`)
      .join(', ')
    
    return `
      <tr>
        <td colspan="2" style="padding: 12px 16px; background-color: #fee2e2; border-radius: 8px;">
          <div style="margin-bottom: 8px;">
            <span style="color: #dc2626; font-weight: 600;">📅 ${formattedDate}</span>
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
    <title>Pembatalan Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">❌ Booking Dibatalkan</h1>
                            <p style="margin: 10px 0 0 0; color: #fee2e2; font-size: 16px;">Notifikasi Pembatalan Booking</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">Halo <strong>${booking.name}</strong>,</p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                Kami informasikan bahwa booking Anda telah <strong style="color: #dc2626;">dibatalkan</strong>. Berikut adalah detail booking yang dibatalkan:
                            </p>
                            
                            <!-- Booking Code Highlight -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Kode Booking</p>
                                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); display: inline-block; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                                    <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${booking.bookingCode}</span>
                                </div>
                                <div style="margin-top: 12px;">
                                    <span style="background-color: #fca5a5; color: #7f1d1d; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">❌ DIBATALKAN</span>
                                </div>
                            </div>

                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #fef2f2; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1); border: 2px solid #fecaca;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <h3 style="margin: 0 0 20px 0; color: #7f1d1d; font-size: 18px; font-weight: 600; border-bottom: 2px solid #fecaca; padding-bottom: 12px;">📋 Detail Booking yang Dibatalkan</h3>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 40%; vertical-align: top;">👤 Nama Pemesan</td>
                                                <td style="padding: 12px 0; color: #1f2937; font-weight: 500;">${booking.name}</td>
                                            </tr>
                                            ${booking.isAcademic && booking.institution ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #6b7280; font-weight: 600; vertical-align: top;">🏫 Institusi</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #1f2937; font-weight: 500;">${booking.institution}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #6b7280; font-weight: 600; vertical-align: top;">🏟️ Stadion</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #1f2937; font-weight: 500;">${stadionName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #6b7280; font-weight: 600; vertical-align: top;">⚽ Lapangan</td>
                                                <td style="padding: 12px 0; border-top: 1px solid #fecaca; color: #1f2937; font-weight: 500;">${fieldName}</td>
                                            </tr>
                                        </table>
                                        
                                        <h4 style="margin: 24px 0 16px 0; color: #7f1d1d; font-size: 16px; font-weight: 600;">📅 Jadwal yang Dibatalkan</h4>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            ${bookingDetailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <div style="background: linear-gradient(to right, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 24px; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);">
                                <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 700; font-size: 17px; display: flex; align-items: center;">
                                    <span style="font-size: 24px; margin-right: 8px;">📋</span> Informasi Penting
                                </p>
                                <ul style="margin: 0; padding-left: 24px; color: #78350f; line-height: 1.8;">
                                    <li style="margin-bottom: 8px;">Booking dengan kode <strong>${booking.bookingCode}</strong> telah dibatalkan</li>
                                    <li style="margin-bottom: 8px;">Jika Anda merasa ini adalah kesalahan, silakan hubungi kami segera</li>
                                    <li>Untuk booking baru, silakan datang kembali ke venue kami</li>
                                </ul>
                            </div>
                            
                            <!-- Contact Info -->
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">Ada Pertanyaan?</p>
                                <p style="margin: 0; color: #1e3a8a;">
                                    Jangan ragu untuk menghubungi kami:<br>
                                    📞 <strong>+62 851-6566-0339</strong><br>
                                    📧 <strong>helpdesk@live.undip.ac.id</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; font-size: 16px; color: #374151; text-align: center;">
                                Terima kasih atas pengertian Anda.<br>
                                <strong>Tim VENUE UNDIP</strong>
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
