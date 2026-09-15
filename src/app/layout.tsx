import type { ReactElement, ReactNode } from 'react';
import { ALL_FONT_VARIABLE_CLASSNAMES } from '@/modules/Brand/presentation/fonts';
import './globals.css';

// Las 17 variables de fuente se declaran aquí porque `:root` es el <html>, y ahí es donde
// el layout de tenant necesita poder apuntar `--font-heading` a la que eligió el cliente.
// Cada className solo define una variable CSS: el archivo se descarga solo si se usa.
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html
      lang="es"
      className={`scroll-smooth ${ALL_FONT_VARIABLE_CLASSNAMES}`}
      // El script de tema toca la clase de <html> antes de hidratar; el aviso es esperado.
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col antialiased">{children}</body>
    </html>
  );
}
