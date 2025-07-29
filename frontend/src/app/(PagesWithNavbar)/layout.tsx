import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cutive_Mono } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { beVietnamProFont, codeFont } from "../layout";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}