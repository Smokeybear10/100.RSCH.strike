import type { Metadata } from "next";
import { SkipLink } from "@/components/skip-link";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://strike.thomasou.com"),
  title: "Strike — Video review",
  description:
    "Review MMA footage, label strike attempts, and inspect recorded model predictions.",
  openGraph: {
    title: "Strike — Video review",
    description:
      "Review MMA footage, label strike attempts, and inspect recorded model predictions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strike — Video review",
    description:
      "Review MMA footage, label strike attempts, and inspect recorded model predictions.",
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
      className={`${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
