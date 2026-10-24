import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAKKU: Digital Legal Companion",
  description:
    "Platform pendamping hukum digital untuk masyarakat Indonesia. Ceritakan masalah dengan bahasa sehari-hari, dapatkan klarifikasi terstruktur, ringkasan fakta, informasi hukum berbasis sumber, dan checklist persiapan.",
  openGraph: {
    title: "HAKKU: Digital Legal Companion",
    description:
      "Platform pendamping hukum digital untuk masyarakat Indonesia. Ceritakan masalah dengan bahasa sehari-hari, dapatkan klarifikasi terstruktur, ringkasan fakta, informasi hukum berbasis sumber, dan checklist persiapan.",
  },
  icons: {
    icon: "/hakki-icon.svg",
    shortcut: "/hakki-icon.svg",
    apple: "/hakki-icon.svg",
  },
  keywords: [
    "HAKKU",
    "bantuan hukum",
    "informasi hukum",
    "pendamping hukum digital",
    "edukasi hukum",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text antialiased selection:bg-[#00F0FF] selection:text-black">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
