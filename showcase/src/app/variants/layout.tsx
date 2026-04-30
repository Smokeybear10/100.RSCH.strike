import Link from "next/link";
import {
  Anton,
  Oswald,
  Barlow_Condensed,
  Playfair_Display,
  EB_Garamond,
  Orbitron,
  Space_Mono,
} from "next/font/google";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});
const barlow = Barlow_Condensed({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const fontVars = [
  anton.variable,
  oswald.variable,
  barlow.variable,
  playfair.variable,
  ebGaramond.variable,
  orbitron.variable,
  spaceMono.variable,
].join(" ");

export default function VariantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fontVars} relative z-20`}>
      <aside className="sticky top-0 z-[100] border-b border-amber-500/40 bg-black px-6 py-3 font-mono text-xs leading-relaxed text-amber-100">
        Archived design study. Scores and performance claims on this page are unverified mock content.
        {" "}<Link href="/" className="underline">Read the current research report.</Link>
      </aside>
      {children}
    </div>
  );
}
