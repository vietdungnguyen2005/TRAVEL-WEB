import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  customerName: string;
  bookingId: string;
  roomType: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: string;
  paymentMethod: string;
}

export const BookingConfirmationEmail = ({
  customerName,
  bookingId,
  roomType,
  roomNumber,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  totalPrice,
  paymentMethod,
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Xác nhận đặt phòng #{bookingId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Đặt phòng thành công!</Heading>
          
          <Text style={text}>
            Xin chào <strong>{customerName}</strong>,
          </Text>
          
          <Text style={text}>
            Cảm ơn bạn đã đặt phòng tại <strong>TravelBook</strong>. Đơn đặt phòng của bạn đã được xác nhận thành công.
          </Text>

          <Section style={bookingDetails}>
            <Heading as="h2" style={h2}>
              Chi tiết đặt phòng
            </Heading>
            
            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={label}>Mã đặt phòng:</td>
                  <td style={value}>#{bookingId}</td>
                </tr>
                <tr>
                  <td style={label}>Loại phòng:</td>
                  <td style={value}>{roomType}</td>
                </tr>
                <tr>
                  <td style={label}>Số phòng:</td>
                  <td style={value}>{roomNumber}</td>
                </tr>
                <tr>
                  <td style={label}>Ngày nhận phòng:</td>
                  <td style={value}>{checkInDate}</td>
                </tr>
                <tr>
                  <td style={label}>Ngày trả phòng:</td>
                  <td style={value}>{checkOutDate}</td>
                </tr>
                <tr>
                  <td style={label}>Số khách:</td>
                  <td style={value}>{numberOfGuests} người</td>
                </tr>
                <tr>
                  <td style={label}>Phương thức thanh toán:</td>
                  <td style={value}>{paymentMethod}</td>
                </tr>
              </tbody>
            </table>

            <Hr style={hr} />

            <table style={totalTable}>
              <tbody>
                <tr>
                  <td style={totalLabel}>Tổng tiền:</td>
                  <td style={totalValue}>{totalPrice}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={buttonSection}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              Xem chi tiết đặt phòng
            </Button>
          </Section>

          <Text style={footer}>
            <strong>Lưu ý quan trọng:</strong>
          </Text>
          <Text style={footerText}>
            • Vui lòng mang theo giấy tờ tùy thân khi nhận phòng<br />
            • Giờ nhận phòng: 14:00 | Giờ trả phòng: 12:00<br />
            • Nếu cần hỗ trợ, vui lòng liên hệ: support@travelbook.com
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 16px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const bookingDetails = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
};

const detailsTable = {
  width: '100%',
  marginBottom: '16px',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  width: '40%',
};

const value = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500' as const,
  padding: '8px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const totalTable = {
  width: '100%',
};

const totalLabel = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '8px 0',
};

const totalValue = {
  color: '#2563eb',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  padding: '8px 0',
  textAlign: 'right' as const,
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '0 40px',
  marginTop: '32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '8px',
};
