import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ToasterProvider } from "@/components/ui/ToasterProvider";
import VersionSync from "@/components/VersionSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BaseScribe - Encrypted Audio & Video Transcription",
  description: "Privacy focused audio & video transcription",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VersionSync />
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
