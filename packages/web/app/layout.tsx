import type { Metadata } from "next";
import { ReactNode } from "react";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Student Tracker",
  description: "Track student progress and performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, montserrat.variable, "antialiased")}>
        {children}
      </body>
    </html>
  );
}


