"use client"

interface QuickActionButtonProps {
  label: string
  onClick: () => void
}

export function QuickActionButton({ label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
    >
      {label}
    </button>
  )
}
