import type { Metadata } from "next";
import { Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  variable: "--font-merriweather",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vovazakharov.com"),
  title: {
    default: "Vova Zakharov",
    template: "%s | Vova Zakharov",
  },
  description: "Developer, AI tinkerer, word shaker, generative metalhead",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vovazakharov.com",
    siteName: "Vova Zakharov",
    title: "Vova Zakharov",
    description: "Developer, AI tinkerer, word shaker, generative metalhead",
    images: [
      {
        url: "/ava.png",
        width: 150,
        height: 150,
        alt: "Vova Zakharov",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vovahimself",
    creator: "@vovahimself",
    title: "Vova Zakharov",
    description: "Developer, AI tinkerer, word shaker, generative metalhead",
    images: ["/ava.png"],
  },
  authors: [
    {
      name: "Vova Zakharov",
      url: "https://vovazakharov.com",
    },
  ],
  creator: "Vova Zakharov",
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
