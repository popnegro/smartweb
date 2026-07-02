import type { Metadata } from "next";
// @ts-ignore: allow side-effect import of global CSS without type declarations
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "CX Recovery & Quality Hub",
  description: "Plataforma de calidad y experiencia del cliente para grupos automotrices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
