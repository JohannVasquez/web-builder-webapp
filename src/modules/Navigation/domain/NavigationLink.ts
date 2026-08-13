import { z } from 'zod';

/**
 * Un enlace del menú del sitio, dictado por la base de datos. Su `href` puede
 * apuntar a una página propia (`/nosotros`) o al ancla de una sección
 * (`/#caracteristicas`), lo que permite estructurar el sitio como
 * multi-página o como one-page sin tocar el código.
 */
export const NavigationLinkSchema = z.strictObject({
  label: z.string(),
  href: z.string(),
});

export const NavigationSchema = z.array(NavigationLinkSchema);

export type NavigationLink = z.infer<typeof NavigationLinkSchema>;

/** Menú mínimo para que el sitio siga siendo navegable si la API no responde. */
export const DEFAULT_NAVIGATION_LINKS: readonly NavigationLink[] = [
  { label: 'Inicio', href: '/' },
];
