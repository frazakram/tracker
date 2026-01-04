import { create } from "zustand"

export type ToastVariant = "error" | "success" | "info"

export interface Toast {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  createdAt: number
}

interface ToastStore {
  toasts: Toast[]
  push: (toast: Omit<Toast, "id" | "createdAt"> & { durationMs?: number }) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: ({ durationMs = 3500, ...toast }) => {
    const id = crypto.randomUUID()
    const createdAt = Date.now()

    set((state) => ({
      toasts: [{ id, createdAt, ...toast }, ...state.toasts].slice(0, 4),
    }))

    window.setTimeout(() => {
      get().remove(id)
    }, durationMs)
  },
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clear: () => set({ toasts: [] }),
}))


