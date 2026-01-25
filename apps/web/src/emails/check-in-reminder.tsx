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
} from '@react-email/components';
import * as React from 'react';

interface CheckInReminderEmailProps {
  customerName: string;
  bookingId: string;
  roomType: string;
  roomNumber: string;
  checkInDate: string;
  checkInTime: string;
}

export const CheckInReminderEmail = ({
  customerName,
  bookingId,
  roomType,
  roomNumber,
  checkInDate,
  checkInTime,
}: CheckInReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nhắc nhở nhận phòng - {checkInDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ Nhắc nhở nhận phòng</Heading>
          
          <Text style={text}>
            Xin chào <strong>{customerName}</strong>,
          </Text>
          
          <Text style={text}>
            Đây là email nhắc nhở về đơn đặt phòng của bạn tại <strong>TravelBook</strong>.
          </Text>

          <Section style={reminderBox}>
            <Text style={reminderTitle}>
              Bạn sẽ nhận phòng vào:
            </Text>
            <Text style={reminderDate}>
              {checkInDate} lúc {checkInTime}
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={detailsTitle}>Thông tin đặt phòng:</Text>
            <Text style={detailsText}>
              <strong>Mã đặt phòng:</strong> #{bookingId}<br />
              <strong>Loại phòng:</strong> {roomType}<br />
              <strong>Số phòng:</strong> {roomNumber}
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              Xem thông tin đặt phòng
            </Button>
          </Section>

          <Text style={infoText}>
            <strong>Lưu ý:</strong><br />
            • Vui lòng mang theo giấy tờ tùy thân hợp lệ<br />
            • Giờ nhận phòng tiêu chuẩn: 14:00<br />
            • Liên hệ lễ tân nếu bạn đến sớm hơn<br />
            • Hotline: 1900-2468
          </Text>

          <Text style={footerText}>
            Chúng tôi rất mong được phục vụ bạn!
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CheckInReminderEmail;

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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '16px',
};

const reminderBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
  textAlign: 'center' as const,
};

const reminderTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500' as const,
  margin: '0 0 8px 0',
};

const reminderDate = {
  color: '#92400e',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
};

const detailsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
};

const detailsTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '12px',
};

const detailsText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
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

const infoText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
};

const footerText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500' as const,
  padding: '0 40px',
  marginTop: '32px',
  textAlign: 'center' as const,
};
