import {
  Body,
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

interface CancellationEmailProps {
  customerName: string;
  bookingId: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: string;
  refundAmount?: string;
  cancellationReason?: string;
}

export const CancellationEmail = ({
  customerName,
  bookingId,
  roomType,
  checkInDate,
  checkOutDate,
  totalPrice,
  refundAmount,
  cancellationReason,
}: CancellationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Xác nhận hủy đặt phòng #{bookingId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Đơn đặt phòng đã bị hủy</Heading>
          
          <Text style={text}>
            Xin chào <strong>{customerName}</strong>,
          </Text>
          
          <Text style={text}>
            Đơn đặt phòng của bạn tại <strong>TravelBook</strong> đã được hủy thành công.
          </Text>

          <Section style={cancellationBox}>
            <Heading as="h2" style={h2}>
              Thông tin đặt phòng đã hủy
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
                  <td style={label}>Ngày nhận phòng:</td>
                  <td style={value}>{checkInDate}</td>
                </tr>
                <tr>
                  <td style={label}>Ngày trả phòng:</td>
                  <td style={value}>{checkOutDate}</td>
                </tr>
                <tr>
                  <td style={label}>Tổng tiền:</td>
                  <td style={value}>{totalPrice}</td>
                </tr>
                {cancellationReason && (
                  <tr>
                    <td style={label}>Lý do hủy:</td>
                    <td style={value}>{cancellationReason}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {refundAmount && (
            <Section style={refundSection}>
              <Text style={refundTitle}>💰 Thông tin hoàn tiền</Text>
              <Text style={refundText}>
                Số tiền hoàn lại: <strong>{refundAmount}</strong>
              </Text>
              <Text style={refundNote}>
                Tiền sẽ được hoàn lại vào tài khoản của bạn trong vòng 5-7 ngày làm việc.
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={footerText}>
            Nếu bạn có bất kỳ câu hỏi nào về việc hủy đặt phòng, vui lòng liên hệ với chúng tôi qua:
          </Text>
          <Text style={contactText}>
            Email: support@travelbook.com<br />
            Hotline: 1900-2468
          </Text>

          <Text style={footerText}>
            Chúng tôi hy vọng sẽ được phục vụ bạn trong tương lai!
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CancellationEmail;

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
  color: '#dc2626',
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
  margin: '0 0 16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '16px',
};

const cancellationBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
};

const detailsTable = {
  width: '100%',
  marginTop: '16px',
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

const refundSection = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #6ee7b7',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
  textAlign: 'center' as const,
};

const refundTitle = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  margin: '0 0 12px 0',
};

const refundText = {
  color: '#065f46',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0 0 12px 0',
};

const refundNote = {
  color: '#047857',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
};

const footerText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '16px',
};

const contactText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '8px',
  fontWeight: '500' as const,
};
