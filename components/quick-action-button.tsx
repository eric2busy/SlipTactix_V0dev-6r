"use client"

interface QuickActionButtonProps {
  label: string
  onClick: () => void
}

export function QuickActionButton({ label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap text-sm bg-white/15 text-white hover:bg-white/25"
    >
      {label}
    </button>
  )
}
