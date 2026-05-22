import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { PWARegister } from "@/components/layout/pwa-register";

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
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DTF" },
};

export const viewport: Viewport = {
  themeColor: "#18181B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(t==="dark"||(t===null&&d))document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geist.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
