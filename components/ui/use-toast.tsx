"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// Types
type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number; // ms
  variant?: "default" | "destructive";
};

type Toast = ToastOptions & { id: number };

// Toast Context
const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => void;
}>({
  toast: () => {},
});

// Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Date.now();
    const newToast: Toast = { ...options, id, duration: options.duration ?? 3000 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-md shadow-md text-white ${
                t.variant === "destructive" ? "bg-red-500" : "bg-gray-800"
              }`}
            >
              {t.title && <div className="font-bold">{t.title}</div>}
              {t.description && <div>{t.description}</div>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
