import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { PWARegister } from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "SLIPTACTIX",
  description: "Sports betting analysis and recommendations",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#B8562F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SLIPTACTIX",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
