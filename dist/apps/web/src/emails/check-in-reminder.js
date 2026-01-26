import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, } from '@react-email/components';
export const CheckInReminderEmail = ({ customerName, bookingId, roomType, roomNumber, checkInDate, checkInTime, }) => {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Preview, { children: ["Nh\u1EAFc nh\u1EDF nh\u1EADn ph\u00F2ng - ", checkInDate] }), _jsx(Body, { style: main, children: _jsxs(Container, { style: container, children: [_jsx(Heading, { style: h1, children: "\u23F0 Nh\u1EAFc nh\u1EDF nh\u1EADn ph\u00F2ng" }), _jsxs(Text, { style: text, children: ["Xin ch\u00E0o ", _jsx("strong", { children: customerName }), ","] }), _jsxs(Text, { style: text, children: ["\u0110\u00E2y l\u00E0 email nh\u1EAFc nh\u1EDF v\u1EC1 \u0111\u01A1n \u0111\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n t\u1EA1i ", _jsx("strong", { children: "TravelBook" }), "."] }), _jsxs(Section, { style: reminderBox, children: [_jsx(Text, { style: reminderTitle, children: "B\u1EA1n s\u1EBD nh\u1EADn ph\u00F2ng v\u00E0o:" }), _jsxs(Text, { style: reminderDate, children: [checkInDate, " l\u00FAc ", checkInTime] })] }), _jsxs(Section, { style: detailsSection, children: [_jsx(Text, { style: detailsTitle, children: "Th\u00F4ng tin \u0111\u1EB7t ph\u00F2ng:" }), _jsxs(Text, { style: detailsText, children: [_jsx("strong", { children: "M\u00E3 \u0111\u1EB7t ph\u00F2ng:" }), " #", bookingId, _jsx("br", {}), _jsx("strong", { children: "Lo\u1EA1i ph\u00F2ng:" }), " ", roomType, _jsx("br", {}), _jsx("strong", { children: "S\u1ED1 ph\u00F2ng:" }), " ", roomNumber] })] }), _jsx(Section, { style: buttonSection, children: _jsx(Button, { style: button, href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, children: "Xem th\u00F4ng tin \u0111\u1EB7t ph\u00F2ng" }) }), _jsxs(Text, { style: infoText, children: [_jsx("strong", { children: "L\u01B0u \u00FD:" }), _jsx("br", {}), "\u2022 Vui l\u00F2ng mang theo gi\u1EA5y t\u1EDD t\u00F9y th\u00E2n h\u1EE3p l\u1EC7", _jsx("br", {}), "\u2022 Gi\u1EDD nh\u1EADn ph\u00F2ng ti\u00EAu chu\u1EA9n: 14:00", _jsx("br", {}), "\u2022 Li\u00EAn h\u1EC7 l\u1EC5 t\u00E2n n\u1EBFu b\u1EA1n \u0111\u1EBFn s\u1EDBm h\u01A1n", _jsx("br", {}), "\u2022 Hotline: 1900-2468"] }), _jsx(Text, { style: footerText, children: "Ch\u00FAng t\u00F4i r\u1EA5t mong \u0111\u01B0\u1EE3c ph\u1EE5c v\u1EE5 b\u1EA1n!" })] }) })] }));
};
export default CheckInReminderEmail;
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
    textAlign: 'center',
};
const reminderTitle = {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 8px 0',
};
const reminderDate = {
    color: '#92400e',
    fontSize: '24px',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginBottom: '12px',
};
const detailsText = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0',
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
    fontWeight: '500',
    padding: '0 40px',
    marginTop: '32px',
    textAlign: 'center',
};
//# sourceMappingURL=check-in-reminder.js.map