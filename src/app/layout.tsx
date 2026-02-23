import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EduVerse LMS",
    template: "%s | EduVerse LMS",
  },
  description:
    "A modern virtual learning management system supporting IGCSE and CBC curriculum for Kenyan homeschool students.",
  keywords: ["LMS", "IGCSE", "CBC", "Kenya", "Homeschool", "Education", "Online Learning"],
  authors: [{ name: "EduVerse Team" }],
  creator: "EduVerse",
  openGraph: {
    type: "website",
    locale: "en_KE",
    title: "EduVerse LMS",
    description: "Virtual Homeschool Learning Management System",
    siteName: "EduVerse LMS",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
