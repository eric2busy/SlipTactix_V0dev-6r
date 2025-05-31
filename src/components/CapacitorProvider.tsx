"use client"

import type React from "react"

import { useCapacitor } from "@/hooks/useCapacitor"
import { useEffect } from "react"

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { isNative } = useCapacitor()

  useEffect(() => {
    if (isNative) {
      // Add any native-specific initialization here
      console.log("Running in native app")
    }
  }, [isNative])

  return <>{children}</>
}
