import '@/styles/globals.css'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";  // Header 컴포넌트 import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "underthekey",
  description: "Explore all about custom keyboards",
  icons: {
    icon: '/images/logo-color-3d.png', // 기본 favicon
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