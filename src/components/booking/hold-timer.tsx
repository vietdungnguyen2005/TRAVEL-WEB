"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface HoldTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

export function HoldTimer({ expiresAt, onExpire }: HoldTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

  return (
    <div className={`flex items-center gap-2 ${isLowTime ? 'text-red-600' : 'text-gray-700'}`}>
      <Clock className={`h-5 w-5 ${isLowTime ? 'animate-pulse' : ''}`} />
      <div>
        <p className="font-semibold">
          Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
        <p className="text-sm">
          Your reservation will be held until then
        </p>
      </div>
    </div>
  );
}
