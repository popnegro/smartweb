import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import GSAPReveal from './components/GSAPReveal';

export const metadata: Metadata = {
  title: 'Luis Grasso | Work & Case Studies',
  description: 'Casos de diseño UX/UI, desarrollo frontend y performance web de Luis Grasso.',
  openGraph: {
    title: 'Luis Grasso | Work & Case Studies',
    description: 'Estrategia, diseño y tecnología aplicados a productos digitales con impacto.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-neutral-950 text-white antialiased">
        <GSAPReveal />
        {children}
      </body>
    </html>
  );
}