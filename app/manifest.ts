import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SLIPTACTIX",
    short_name: "SLIPTACTIX",
    description: "Sports betting analysis and recommendations",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#B8562F",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  }
}
