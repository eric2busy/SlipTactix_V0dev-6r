"use client"

import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform())

    if (Capacitor.isNativePlatform()) {
      // Hide splash screen
      SplashScreen.hide()

      // Configure status bar
      StatusBar.setStyle({ style: Style.Default })
    }
  }, [])

  return { isNative }
}
