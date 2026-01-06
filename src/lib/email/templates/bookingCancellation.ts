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
                            
                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #fef2f2; border-radius: 8px; overflow: hidden; border: 2px solid #fecaca;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Kode Booking</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">
                                                    <span style="background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 18px;">${booking.bookingCode}</span>
                                                    <span style="background-color: #fca5a5; color: #7f1d1d; padding: 4px 12px; border-radius: 4px; font-weight: bold; margin-left: 8px;">DIBATALKAN</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Nama Pemesan</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${booking.name}</td>
                                            </tr>
                                            ${booking.isAcademic && booking.institution ? `
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Institusi</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${booking.institution}</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Stadion</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${stadionName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Lapangan</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca;">${fieldName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #6b7280; font-weight: 600;">Jadwal yang Dibatalkan</td>
                                            </tr>
                                            ${bookingDetailsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                                <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">📋 Informasi</p>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
                                    <li>Booking dengan kode <strong>${booking.bookingCode}</strong> telah dibatalkan</li>
                                    <li>Jika Anda merasa ini adalah kesalahan, silakan hubungi kami segera</li>
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
