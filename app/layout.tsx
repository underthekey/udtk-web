import '@/styles/globals.css'
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import ThemeWrapper from '@/components/ThemeWrapper';

export const metadata: Metadata = {
  title: "underthekey",
  description: "언더더키 - 온라인 타건샵에서 타이핑 연습, 키보드 테스트, 스위치 및 커스텀 키보드 정보를 탐색하세요.",
  keywords: "언더더키, 커스텀 키보드, 타건샵, 키보드 ASMR, 타이핑 연습, 키보드 스위치 정보, 키보드 테스트, underthekey, custom keyboard, typing",
  openGraph: {
    title: 'underthekey',
    description: '언더더키 - 온라인 타건샵에서 타이핑 연습, 키보드 테스트, 스위치 및 커스텀 키보드 정보를 탐색하세요.',
    url: 'https://underthekey.com',
    siteName: 'underthekey',
    images: [
      {
        url: 'https://underthekey.com/images/image-logo/3d/logo-3d-background-512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
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
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ThemeWrapper>
            <Header />
            {children}
            <Footer />
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}