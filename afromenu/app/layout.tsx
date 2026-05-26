import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: 'Afromenu - Digital QR Menu',
  description: 'Premium QR code menus for restaurants',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f9fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#faf8f6] text-[#1a1a2e] font-body selection:bg-brand/30 selection:text-brand-secondary">
        <AuthProvider>
          {children}
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: '#1b3151',
              color: '#ffffff',
            },
            success: {
              iconTheme: {
                primary: '#f2bd11',
                secondary: '#1b3151',
              },
            },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}