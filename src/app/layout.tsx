import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "scroll-shared",
  description:
    "Bold & Digital scroll narrative skeleton — neutral base for vertical demos.",
};

// Root layout renders the html/body shell + Inter font.
// Locale-aware providers (NextIntlClientProvider, Nav, Footer,
// SmoothScrollProvider, WhatsAppButton) live under [locale]/layout.tsx
// so they can use the locale param to fetch messages and key the UI.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Inline theme init — runs before paint so we don't flash on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('scroll-shared-theme');var d=s==='dark'||(s==null&&window.matchMedia('(prefers-color-scheme: dark)').matches);var h=document.documentElement;if(d){h.setAttribute('data-theme','dark');h.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
