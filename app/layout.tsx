import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { PWARegister } from "@/components/layout/pwa-register";

export const metadata: Metadata = {
  title: "DTF Acabamentos",
  description: "Sistema Comercial DTF Acabamentos",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DTF" },
};

export const viewport: Viewport = {
  themeColor: "#232021",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(t==="dark"||(t===null&&d))document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-[var(--background)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
