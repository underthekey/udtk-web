import '@/styles/globals.css'
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";  // Header 컴포넌트 import
import Script from 'next/script';

export const metadata: Metadata = {
  title: "underthekey | 언더더키",
  description: "Explore all about custom keyboards | 커스텀 키보드에 대한 모든 것",
  keywords: "underthekey, 언더더키, custom keyboard, 커스텀 키보드",
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
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-1MC3X2SVR7`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1MC3X2SVR7');
            `,
          }}
        />
      </head>
      <body>
        <Header />  {/* Header 컴포넌트 추가 */}
        {children}
      </body>
    </html>
  );
}