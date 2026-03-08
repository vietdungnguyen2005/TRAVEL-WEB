import { resend, FROM_EMAIL } from './email';
import { render } from '@react-email/components';
import BookingConfirmationEmail from '@/emails/booking-confirmation';
import CheckInReminderEmail from '@/emails/check-in-reminder';
import CancellationEmail from '@/emails/cancellation-email';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface BookingData {
  id: string;
  user: {
    email: string;
    name: string | null;
  };
  room: {
    roomNumber: string;
    roomType: {
      name: string;
    };
  };
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  totalPrice: number;
  paymentMethod: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export async function sendBookingConfirmationEmail(booking: BookingData) {
  try {
    const emailHtml = await render(
      BookingConfirmationEmail({
        customerName: booking.user.name || 'Khách hàng',
        bookingId: booking.id.slice(0, 8).toUpperCase(),
        roomType: booking.room.roomType.name,
        roomNumber: booking.room.roomNumber,
        checkInDate: format(new Date(booking.checkIn), 'dd/MM/yyyy', { locale: vi }),
        checkOutDate: format(new Date(booking.checkOut), 'dd/MM/yyyy', { locale: vi }),
        numberOfGuests: booking.numberOfGuests,
        totalPrice: formatCurrency(Number(booking.totalPrice)),
        paymentMethod: booking.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPay' : 'Thanh toán tại khách sạn',
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [booking.user.email],
      subject: `Xác nhận đặt phòng #${booking.id.slice(0, 8).toUpperCase()} - TravelBook`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, error };
    }

    console.log('Booking confirmation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendCheckInReminderEmail(booking: BookingData) {
  try {
    const emailHtml = await render(
      CheckInReminderEmail({
        customerName: booking.user.name || 'Khách hàng',
        bookingId: booking.id.slice(0, 8).toUpperCase(),
        roomType: booking.room.roomType.name,
        roomNumber: booking.room.roomNumber,
        checkInDate: format(new Date(booking.checkIn), 'dd/MM/yyyy', { locale: vi }),
        checkInTime: '14:00',
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [booking.user.email],
      subject: `Nhắc nhở nhận phòng - ${format(new Date(booking.checkIn), 'dd/MM/yyyy')}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending check-in reminder email:', error);
      return { success: false, error };
    }

    console.log('Check-in reminder email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send check-in reminder email:', error);
    return { success: false, error };
  }
}

export async function sendCancellationEmail(
  booking: BookingData,
  refundAmount?: number,
  cancellationReason?: string
) {
  try {
    const emailHtml = await render(
      CancellationEmail({
        customerName: booking.user.name || 'Khách hàng',
        bookingId: booking.id.slice(0, 8).toUpperCase(),
        roomType: booking.room.roomType.name,
        checkInDate: format(new Date(booking.checkIn), 'dd/MM/yyyy', { locale: vi }),
        checkOutDate: format(new Date(booking.checkOut), 'dd/MM/yyyy', { locale: vi }),
        totalPrice: formatCurrency(Number(booking.totalPrice)),
        refundAmount: refundAmount ? formatCurrency(refundAmount) : undefined,
        cancellationReason,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [booking.user.email],
      subject: `Xác nhận hủy đặt phòng #${booking.id.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending cancellation email:', error);
      return { success: false, error };
    }

    console.log('Cancellation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return { success: false, error };
  }
}
