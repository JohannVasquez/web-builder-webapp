import type { ReactElement, ReactNode } from 'react';
import './globals.css';

/**
 * Layout raíz: solo el chrome del documento. Todo lo que depende del tenant
 * (navbar, footer, metadata de marca) vive en `[tenantDomain]/layout.tsx`,
 * porque aquí todavía no se sabe qué tenant es — el segmento lo aporta el
 * reescrito de `proxy.ts`.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="flex min-h-dvh flex-col antialiased">{children}</body>
    </html>
  );
}
