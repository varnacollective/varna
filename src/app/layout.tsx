import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Playfair_Display, Inter, Jost, Caveat, Cedarville_Cursive } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["400", "600", "700"],
});

const cedarville = Cedarville_Cursive({
  subsets: ["latin"],
  variable: "--font-cedarville",
  display: "swap",
  weight: ["400"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Varna Collective: Sustainability Dashboard",
  description:
    "Enterprise sustainability intelligence for ethical procurement. Track ESG impact, supplier scores, and carbon metrics.",
  keywords: [
    "sustainability",
    "ESG",
    "ethical procurement",
    "hotel sustainability",
    "Varna Collective",
  ],
  icons: {
    icon: "/Varna 13 Carbon solid.svg",
    shortcut: "/Varna 13 Carbon solid.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${jost.variable} ${inter.variable} ${cormorant.variable} ${playfair.variable} ${caveat.variable} ${cedarville.variable} font-sans antialiased bg-[#FAF8F5] dark:bg-[#121316] text-[#1A1F26] dark:text-[#FAF8F5] transition-colors duration-300 selection:bg-[#B85333] selection:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
