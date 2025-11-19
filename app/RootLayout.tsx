import type { Metadata } from "next";
import { Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_CONFIG } from "@/lib/site-config";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  variable: "--font-merriweather",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const defaultDescription = "Developer, AI tinkerer, word shaker, generative metalhead";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: defaultDescription,
    images: [
      {
        url: SITE_CONFIG.avatar.path,
        width: SITE_CONFIG.avatar.width,
        height: SITE_CONFIG.avatar.height,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.social.twitter,
    creator: SITE_CONFIG.social.twitter,
    title: SITE_CONFIG.name,
    description: defaultDescription,
    images: [SITE_CONFIG.avatar.path],
  },
  authors: [
    {
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
  ],
  creator: SITE_CONFIG.name,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${merriweather.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
