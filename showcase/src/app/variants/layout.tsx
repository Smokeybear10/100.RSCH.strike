import {
  Anton,
  Oswald,
  Barlow_Condensed,
  Playfair_Display,
  EB_Garamond,
  Orbitron,
  Rajdhani,
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
const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
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
  rajdhani.variable,
  spaceMono.variable,
].join(" ");

export default function VariantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${fontVars} relative z-20`}>{children}</div>;
}
