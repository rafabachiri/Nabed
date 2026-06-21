import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/locale";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export const metadata: Metadata = {
  title: "Nabed - Medical English Learning",
  description: "Web application for Algerian university medical students to learn Medical English.",
  applicationName: "Nabed",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nabed",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d7a6b" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1c1a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));}catch(e){}` }} />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
