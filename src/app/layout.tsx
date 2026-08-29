import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NutriOS",
  description: "Sistema operacional clínico para nutricionistas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
