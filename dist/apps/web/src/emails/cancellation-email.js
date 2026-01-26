import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, } from '@react-email/components';
export const CancellationEmail = ({ customerName, bookingId, roomType, checkInDate, checkOutDate, totalPrice, refundAmount, cancellationReason, }) => {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Preview, { children: ["X\u00E1c nh\u1EADn h\u1EE7y \u0111\u1EB7t ph\u00F2ng #", bookingId] }), _jsx(Body, { style: main, children: _jsxs(Container, { style: container, children: [_jsx(Heading, { style: h1, children: "\u0110\u01A1n \u0111\u1EB7t ph\u00F2ng \u0111\u00E3 b\u1ECB h\u1EE7y" }), _jsxs(Text, { style: text, children: ["Xin ch\u00E0o ", _jsx("strong", { children: customerName }), ","] }), _jsxs(Text, { style: text, children: ["\u0110\u01A1n \u0111\u1EB7t ph\u00F2ng c\u1EE7a b\u1EA1n t\u1EA1i ", _jsx("strong", { children: "TravelBook" }), " \u0111\u00E3 \u0111\u01B0\u1EE3c h\u1EE7y th\u00E0nh c\u00F4ng."] }), _jsxs(Section, { style: cancellationBox, children: [_jsx(Heading, { as: "h2", style: h2, children: "Th\u00F4ng tin \u0111\u1EB7t ph\u00F2ng \u0111\u00E3 h\u1EE7y" }), _jsx("table", { style: detailsTable, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { style: label, children: "M\u00E3 \u0111\u1EB7t ph\u00F2ng:" }), _jsxs("td", { style: value, children: ["#", bookingId] })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Lo\u1EA1i ph\u00F2ng:" }), _jsx("td", { style: value, children: roomType })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Ng\u00E0y nh\u1EADn ph\u00F2ng:" }), _jsx("td", { style: value, children: checkInDate })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "Ng\u00E0y tr\u1EA3 ph\u00F2ng:" }), _jsx("td", { style: value, children: checkOutDate })] }), _jsxs("tr", { children: [_jsx("td", { style: label, children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("td", { style: value, children: totalPrice })] }), cancellationReason && (_jsxs("tr", { children: [_jsx("td", { style: label, children: "L\u00FD do h\u1EE7y:" }), _jsx("td", { style: value, children: cancellationReason })] }))] }) })] }), refundAmount && (_jsxs(Section, { style: refundSection, children: [_jsx(Text, { style: refundTitle, children: "\uD83D\uDCB0 Th\u00F4ng tin ho\u00E0n ti\u1EC1n" }), _jsxs(Text, { style: refundText, children: ["S\u1ED1 ti\u1EC1n ho\u00E0n l\u1EA1i: ", _jsx("strong", { children: refundAmount })] }), _jsx(Text, { style: refundNote, children: "Ti\u1EC1n s\u1EBD \u0111\u01B0\u1EE3c ho\u00E0n l\u1EA1i v\u00E0o t\u00E0i kho\u1EA3n c\u1EE7a b\u1EA1n trong v\u00F2ng 5-7 ng\u00E0y l\u00E0m vi\u1EC7c." })] })), _jsx(Hr, { style: hr }), _jsx(Text, { style: footerText, children: "N\u1EBFu b\u1EA1n c\u00F3 b\u1EA5t k\u1EF3 c\u00E2u h\u1ECFi n\u00E0o v\u1EC1 vi\u1EC7c h\u1EE7y \u0111\u1EB7t ph\u00F2ng, vui l\u00F2ng li\u00EAn h\u1EC7 v\u1EDBi ch\u00FAng t\u00F4i qua:" }), _jsxs(Text, { style: contactText, children: ["Email: support@travelbook.com", _jsx("br", {}), "Hotline: 1900-2468"] }), _jsx(Text, { style: footerText, children: "Ch\u00FAng t\u00F4i hy v\u1ECDng s\u1EBD \u0111\u01B0\u1EE3c ph\u1EE5c v\u1EE5 b\u1EA1n trong t\u01B0\u01A1ng lai!" })] }) })] }));
};
export default CancellationEmail;
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
    color: '#dc2626',
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
    fontWeight: '500',
    padding: '8px 0',
};
const refundSection = {
    backgroundColor: '#ecfdf5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
    margin: '24px 40px',
    padding: '24px',
    textAlign: 'center',
};
const refundTitle = {
    color: '#065f46',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
};
const refundText = {
    color: '#065f46',
    fontSize: '20px',
    fontWeight: 'bold',
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
    fontWeight: '500',
};
//# sourceMappingURL=cancellation-email.js.map