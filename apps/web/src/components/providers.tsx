"use client";

// NOTE: Sonner Toaster disabled to remove the corner overlay/toast UI.
// Re-enable by importing and rendering <Toaster /> again.
// import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* <Toaster position="top-right" richColors closeButton /> */}
    </>
  );
}
