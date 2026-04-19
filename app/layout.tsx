import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Lemnity — промпт, сборка, публикация",
  description:
    "Создавайте страницы из промпта: схема, codegen и превью в одном редакторе — без сырого HTML из модели.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("dark font-sans", inter.variable)}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
