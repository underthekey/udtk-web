import '@/styles/globals.css'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";  // Header 컴포넌트 import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "underthekey",
  description: "Explore all about custom keyboards",
  icons: {
    icon: [
      { url: '/images/image-logo/3d/logo-3d-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/images/image-logo/3d/logo-3d-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/image-logo/3d/logo-3d-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/images/image-logo/3d/logo-3d-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/image-logo/3d/logo-3d-256.png',
    other: [
      { rel: 'apple-touch-icon', url: '/images/image-logo/3d/logo-3d-256.png' },
      { rel: 'icon', type: 'image/png', sizes: '256x256', url: '/images/image-logo/3d/logo-3d-256.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/images/image-logo/3d/logo-3d-512.png' },
      { rel: 'manifest', url: '/manifest.json' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />  {/* Header 컴포넌트 추가 */}
        {children}
      </body>
    </html>
  );
}