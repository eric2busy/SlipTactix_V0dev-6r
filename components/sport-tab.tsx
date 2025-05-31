"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface SportTabProps {
  name: string
  logo: string
  active: boolean
  onClick: () => void
}

export function SportTab({ name, logo, active, onClick }: SportTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-sm",
        active ? "bg-[#b8562f] text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white",
      )}
    >
      <div className="w-4 h-4 relative">
        <Image
          src={logo || "/placeholder.svg"}
          alt={name}
          width={16}
          height={16}
          className="object-contain"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=16&width=16"
          }}
        />
      </div>
      <span className="font-medium">{name}</span>
    </button>
  )
}
