import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, } from '@react-email/components';
export const BookingConfirmationEmail = ({ customerName, bookingId, roomType, roomNumber, checkInDate, checkOutDate, numberOfGuests, totalPrice, paymentMethod, }) => {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Preview, { children: ["X\u00E1c nh\u1EADn \u0111\u1EB7t ph\u00F2ng #", bookingId] }), _jsx(Body, { style: main, children: _jsxs(Container, { style: container, children: [_jsx(Heading, { style: h1, children: "\uD83C\uDF89 \u0110\u1EB7t ph\u00F2ng th\u00E0nh c\u00F4ng!" }), _jsxs(Text, { style: text, children: ["Xin ch\u00E0o ", _jsx("strong", { children: customerName }), ","] }), _jsxs(Text, { style: text, children: ["C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 \u0111\u1EB7t ph\u00F2ng t\u1EA1i ", _jsx("strong", { children: "TravelBook" }), ". \u0110\u01A1n \u0111\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c x\u00E1c nh\u1EADn th\u00E0nh c\u00F4ng."] }), _jsxs(Section, { style: bookingDetails, children: [_jsx(Heading, { as: "h2", style: h2, children: "Chi ti\u1EBFt \u0111\u1EB7t ph\u00F2ng" }), _jsx("table", { style: detailsTable, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { style: label, children: "M\u00E3 \u0111\u1EB7t ph\u00F2ng:" }), _jsxs("td", { style: value, children: ["#", bookingId] })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Lo\u1EA1i ph\u00F2ng:" }), _jsx("td", { style: value, children: roomType })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "S\u1ED1 ph\u00F2ng:" }), _jsx("td", { style: value, children: roomNumber })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Ng\u00E0y nh\u1EADn ph\u00F2ng:" }), _jsx("td", { style: value, children: checkInDate })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Ng\u00E0y tr\u1EA3 ph\u00F2ng:" }), _jsx("td", { style: value, children: checkOutDate })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "S\u1ED1 kh\u00E1ch:" }), _jsxs("td", { style: value, children: [numberOfGuests, " ng\u01B0\u1EDDi"] })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n:" }), _jsx("td", { style: value, children: paymentMethod })] })] }) }), _jsx(Hr, { style: hr }), _jsx("table", { style: totalTable, children: _jsx("tbody", { children: _jsxs("tr", { children: [_jsx("td", { style: totalLabel, children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("td", { style: totalValue, children: totalPrice })] }) }) })] }), _jsx(Section, { style: buttonSection, children: _jsx(Button, { style: button, href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, children: "Xem chi ti\u1EBFt \u0111\u1EB7t ph\u00F2ng" }) }), _jsx(Text, { style: footer, children: _jsx("strong", { children: "L\u01B0u \u00FD quan tr\u1ECDng:" }) }), _jsxs(Text, { style: footerText, children: ["\u2022 Vui l\u00F2ng mang theo gi\u1EA5y t\u1EDD t\u00F9y th\u00E2n khi nh\u1EADn ph\u00F2ng", _jsx("br", {}), "\u2022 Gi\u1EDD nh\u1EADn ph\u00F2ng: 14:00 | Gi\u1EDD tr\u1EA3 ph\u00F2ng: 12:00", _jsx("br", {}), "\u2022 N\u1EBFu c\u1EA7n h\u1ED7 tr\u1EE3, vui l\u00F2ng li\u00EAn h\u1EC7: support@travelbook.com"] }), _jsx(Hr, { style: hr }), _jsx(Text, { style: footerText, children: "N\u1EBFu b\u1EA1n c\u00F3 b\u1EA5t k\u1EF3 c\u00E2u h\u1ECFi n\u00E0o, \u0111\u1EEBng ng\u1EA7n ng\u1EA1i li\u00EAn h\u1EC7 v\u1EDBi ch\u00FAng t\u00F4i." })] }) })] }));
};
export default BookingConfirmationEmail;
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
    textAlign: 'center',
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
    fontWeight: '500',
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
    fontWeight: 'bold',
    padding: '8px 0',
};
const totalValue = {
    color: '#2563eb',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '8px 0',
    textAlign: 'right',
};
const buttonSection = {
    textAlign: 'center',
    margin: '32px 0',
};
const button = {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '12px 32px',
};
const footer = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
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
//# sourceMappingURL=booking-confirmation.js.map