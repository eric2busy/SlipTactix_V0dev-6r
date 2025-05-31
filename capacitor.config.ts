import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.sliptactix.app",
  appName: "SlipTactix",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  ios: {
    scheme: "SlipTactix",
    contentInset: "automatic",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      spinnerColor: "#999999",
    },
    StatusBar: {
      style: "default",
      backgroundColor: "#ffffff",
    },
  },
}

export default config
