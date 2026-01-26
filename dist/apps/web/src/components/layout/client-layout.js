"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
export function ClientLayout({ children }) {
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1", children: children }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=client-layout.js.map