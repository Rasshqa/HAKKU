import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "HAKKU: Digital Legal Companion | Pahami Hakmu, Tentukan Langkahmu",
  description:
    "Platform pendamping hukum digital untuk masyarakat Indonesia. Ceritakan masalah dengan bahasa sehari-hari, dapatkan klarifikasi terstruktur, ringkasan fakta, informasi hukum berbasis sumber, dan checklist persiapan.",
  keywords: [
    "HAKKU",
    "bantuan hukum",
    "informasi hukum",
    "pendamping hukum digital",
    "edukasi hukum",
    "Traspac 2027",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text antialiased">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
