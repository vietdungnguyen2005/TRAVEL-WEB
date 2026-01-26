import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { auth } from "@/lib/auth-session";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
export async function MainLayout({ children }) {
    const session = await auth();
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(Navbar, { user: session?.user }), _jsx("main", { className: "flex-1", children: children }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=main-layout.js.map