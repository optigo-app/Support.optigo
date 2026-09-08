/**
 * PWA Configuration & Constants
 */
export const PWA_CONFIG = {
  appName: "Optigo Central System",
  shortName: "Optigo",
  themeColor: "#000000",
  backgroundColor: "#FFFFFF",
  swPath: "/sw.js",
  cacheName: "optigo-pwa-v1",
  dismissedInstallKey: "pwa_install_dismissed_time",
  dismissCooldownDays: 7, // Days before showing the banner again if dismissed
  shortcuts: [
    { title: "Tickets", url: "/Ticket", icon: "ticket" },
    { title: "Calls", url: "/callLog", icon: "call" },
    { title: "Orders", url: "/Orders", icon: "orders" },
  ],
};
