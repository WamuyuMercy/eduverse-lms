"use client";

import { useUIStore } from "@/store/useUIStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useUIStore();

  return (
    <>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-fade-in",
              toast.variant === "destructive"
                ? "bg-red-50 border-red-200"
                : toast.variant === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
            )}
          >
            {toast.variant === "success" && (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            )}
            {toast.variant === "destructive" && (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            )}
            {(!toast.variant || toast.variant === "default") && (
              <Info className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              {toast.description && (
                <p className="text-sm text-gray-500 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
