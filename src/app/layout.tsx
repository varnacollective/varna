import type { Metadata } from "next";
import { Playfair_Display, Inter, Cedarville_Cursive } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

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

const cedarville = Cedarville_Cursive({
  subsets: ["latin"],
  variable: "--font-cedarville",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Varna Collective — Sustainability Dashboard",
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
      <body className={`${inter.variable} ${playfair.variable} ${cedarville.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
