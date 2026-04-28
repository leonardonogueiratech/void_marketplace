import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Feito de Gente — Marketplace de Artesanato",
    template: "%s | Feito de Gente",
  },
  description:
    "Descubra produtos artesanais únicos, feitos à mão por artesãos brasileiros. Consumo consciente, afetivo e sustentável.",
  keywords: ["artesanato", "handmade", "feito à mão", "artesãos", "marketplace"],
  openGraph: {
    siteName: "Feito de Gente",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
