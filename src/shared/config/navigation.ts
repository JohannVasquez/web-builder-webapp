export interface NavigationLink {
  readonly label: string;
  readonly href: string;
}

export const NAVIGATION_LINKS: readonly NavigationLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Contacto', href: '/contacto' },
];
