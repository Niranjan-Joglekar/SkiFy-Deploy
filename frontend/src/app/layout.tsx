import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cutive_Mono } from "next/font/google";
import "@/app/globals.css";

export const beVietnamProFont = Be_Vietnam_Pro({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro"
})

export const codeFont = Cutive_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cutive-mono"
})

export const metadata: Metadata = {
  title: "Ski-Fy",
  description: "Ski-Fy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${beVietnamProFont.variable} ${codeFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}