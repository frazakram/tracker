"use client"

import { useToastStore } from "@/store/useToastStore"

function variantClasses(variant: "error" | "success" | "info") {
  switch (variant) {
    case "success":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-50"
    case "info":
      return "border-sky-400/30 bg-sky-500/10 text-sky-50"
    case "error":
    default:
      return "border-red-400/30 bg-red-500/10 text-red-50"
  }
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="fixed bottom-6 right-6 z-[99999] w-[360px] max-w-[calc(100vw-3rem)] space-y-3">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className={[
            "w-full text-left rounded-2xl px-4 py-3 glass-panel-strong",
            "border shadow-[0_22px_55px_-40px_rgba(0,0,0,0.9)]",
            "hover:bg-white/10 transition-colors",
            variantClasses(t.variant),
          ].join(" ")}
          aria-label="Dismiss notification"
        >
          {t.title && <div className="text-sm font-bold">{t.title}</div>}
          <div className="text-sm font-medium opacity-90">{t.message}</div>
        </button>
      ))}
    </div>
  )
}


