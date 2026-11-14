import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConnectionNotice } from "@/components/layout/ConnectionNotice";
import { TopNav } from "@/components/layout/TopNav";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Altairis · Operaciones", template: "%s · Altairis Operaciones" },
  description: "Operativa diaria de Viajes Altairis: reservas, inventario y catálogo de hoteles",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Providers>
          <TopNav />
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
          <ConnectionNotice />
        </Providers>
      </body>
    </html>
  );
}
