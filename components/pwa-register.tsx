"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    // Only register service worker in production and when running on HTTPS or localhost
    if (
      "serviceWorker" in navigator &&
      (process.env.NODE_ENV === "production" ||
        window.location.hostname === "localhost" ||
        window.location.protocol === "https:")
    ) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          // Only log the error in development, don't throw
          if (process.env.NODE_ENV === "development") {
            console.warn("Service Worker registration failed (this is normal in preview environments):", error.message)
          }
        })
    } else {
      console.log("Service Worker not registered - not in production environment or HTTPS not available")
    }
  }, [])

  return null
}
