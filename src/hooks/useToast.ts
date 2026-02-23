// =============================================================
// Toast Hook
// =============================================================

import { useUIStore } from "@/store/useUIStore";

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();

  const toast = {
    success: (title: string, description?: string) =>
      addToast({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      addToast({ title, description, variant: "destructive" }),
    info: (title: string, description?: string) =>
      addToast({ title, description, variant: "default" }),
  };

  return { toast, toasts, removeToast };
}
