"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
export function HoldTimer({ expiresAt, onExpire }) {
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const diff = expiry - now;
            return Math.max(0, diff);
        };
        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isLowTime = minutes < 5;
    return (_jsxs("div", { className: `flex items-center gap-2 ${isLowTime ? 'text-red-600' : 'text-gray-700'}`, children: [_jsx(Clock, { className: `h-5 w-5 ${isLowTime ? 'animate-pulse' : ''}` }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold", children: ["Time remaining: ", minutes, ":", seconds.toString().padStart(2, '0')] }), _jsx("p", { className: "text-sm", children: "Your reservation will be held until then" })] })] }));
}
//# sourceMappingURL=hold-timer.js.map