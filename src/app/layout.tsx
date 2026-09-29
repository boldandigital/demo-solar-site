import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Solaria Brasil — Energia solar residencial que cabe no seu bolso",
  description:
    "Energia solar residencial no Brasil. Projeto, financiamento e instalação em até 90 dias. Economize até R$ 612/mês na conta de luz.",
};

// Root layout renders the html/body shell + brand fonts.
// Locale-aware providers (NextIntlClientProvider, Nav, Footer,
// SmoothScrollProvider, WhatsAppButton) live under [locale]/layout.tsx
// so they can use the locale param to fetch messages and key the UI.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${grotesk.variable} ${plex.variable} h-full antialiased`}
    >
      <head>
        {/* Inline theme init — runs before paint so we don't flash on reload */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('solar-theme');var d=s==='dark'||(s==null&&window.matchMedia('(prefers-color-scheme: dark)').matches);var h=document.documentElement;if(d){h.setAttribute('data-theme','dark');h.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
