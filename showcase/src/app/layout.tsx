import type { Metadata } from "next";
import Script from "next/script";
import {
  Anton,
  Oswald,
  Barlow_Condensed,
  Geist_Mono,
  Source_Serif_4,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STR1KE — Technical report",
  description:
    "Strike detection in MMA broadcast video with a 5-frame temporal classifier on top of SAM2 silhouettes. A three-stage pipeline trained on 38 hand-labeled windows.",
  openGraph: {
    title: "STR1KE — Technical report",
    description:
      "Strike detection in MMA broadcast video with a 5-frame temporal classifier on top of SAM2 silhouettes. Trained on 38 hand-labeled windows.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "STR1KE — Technical report",
    description:
      "Strike detection in MMA broadcast video. SAM2 + TSN, 38 hand-labeled windows, Kinetics-400 transfer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${oswald.variable} ${barlow.variable} ${geistMono.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        <Script strategy="beforeInteractive" id="scroll-restore">
          {`if("scrollRestoration"in history)history.scrollRestoration="manual";window.scrollTo(0,0);`}
        </Script>
      </head>
      <body>
        <a
          href="#abstract"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--red)] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
