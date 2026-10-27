import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const display = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-display",
  adjustFontFallback: false,
});

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-text",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "MetaCheck",
  description: "Projected result of the operation against its contract targets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-paper font-sans text-ink">
        <Script id="theme" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
