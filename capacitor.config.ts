import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shuayb.agency",
  appName: "AYNGAL",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true
  }
};

export default config;
