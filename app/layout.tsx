import '@/styles/globals.css'
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";  // Header 컴포넌트 import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "underthekey",
  description: "Explore all about custom keyboards",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/image-logo/3d/logo-3d-background-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/images/image-logo/3d/logo-3d-background-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/image-logo/3d/logo-3d-background-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/images/image-logo/3d/logo-3d-background-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/image-logo/3d/logo-3d-background-256.png',
  },
  appleWebApp: {
    title: 'underthekey',
    statusBarStyle: 'default',
    startupImage: [
      '/images/image-logo/3d/logo-3d-background-512.png',
    ],
    capable: true,
  },
  manifest: '/manifest.json',
  applicationName: 'underthekey',
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#f0f0f0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />  {/* Header 컴포넌트 추가 */}
        {children}
      </body>
    </html>
  );
}