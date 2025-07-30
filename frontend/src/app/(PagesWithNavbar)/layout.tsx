import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

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
    <div>
      <Navbar />
      {children}
    </div>
  );
}