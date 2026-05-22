import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geist = localFont({
  src: [
    { path: "./fonts/GeistVF.woff", weight: "100 900" },
  ],
  variable: "--font-geist",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "DTF Acabamentos",
  description: "Sistema Comercial DTF Acabamentos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased bg-[#FAFAFA] text-[#18181B]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
