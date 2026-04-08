import type { Metadata } from "next";
import Script from "next/script";
import { Anton, Oswald, Barlow_Condensed, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "STR1KE | Strike Detection · Main Event",
  description:
    "Fight Card broadcast. MMA strike detection using SAM2 + TSN, trained on 38 hand-labeled windows. One weekend of film study.",
  openGraph: {
    title: "STR1KE | Strike Detection",
    description:
      "MMA strike detection using SAM2 + TSN, trained on 38 hand-labeled windows. One weekend of film study.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STR1KE | Strike Detection",
    description:
      "MMA strike detection using SAM2 + TSN, trained on 38 hand-labeled windows.",
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
      className={`${anton.variable} ${oswald.variable} ${barlow.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <Script strategy="beforeInteractive" id="scroll-restore">
          {`if("scrollRestoration"in history)history.scrollRestoration="manual";window.scrollTo(0,0);`}
        </Script>
      </head>
      <body>
        <a
          href="#weigh-in"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#dc2626] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
