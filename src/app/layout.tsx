import type { Metadata } from "next";
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
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jost.variable} ${inter.variable} ${cormorant.variable} ${playfair.variable} ${caveat.variable} ${cedarville.variable} font-sans antialiased bg-[#D8CFB8] dark:bg-[#18191D] text-[#222326] dark:text-[#FAF6EE] transition-colors duration-300 selection:bg-[#7A3F1E] selection:text-[#D8CFB8]`}>
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
