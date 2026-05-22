import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MenuQR — Premium QR Code Digital Menus for Restaurants",
  description: "Create beautiful QR code digital menus for your restaurant, cafe, or food truck. Free 1-month trial, no credit card required.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fdf6f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased min-h-screen bg-[#fdf6f2] text-[#2d2d2d] font-body selection:bg-[#f7906c]/30 selection:text-[#e8754f]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}