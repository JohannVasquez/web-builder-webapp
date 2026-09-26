import type { AdminRole } from '@/modules/Auth/domain/Session';

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface NavLinkDefinition extends NavLink {
  // Pantallas exclusivas de la dueña de la cuenta: claves de acceso y usuarios (SPEC 9.2).
  readonly ownerOnly: boolean;
  // Pantallas del equipo de la agencia (dueña y editoras), nunca de un usuario `client`: las
  // demos son prospectos que todavía no son clientes de nadie.
  readonly staffOnly: boolean;
}

const NAV_LINK_DEFINITIONS: readonly NavLinkDefinition[] = [
  { href: '/', label: 'Clientes', ownerOnly: false, staffOnly: false },
  { href: '/demos', label: 'Demos', ownerOnly: false, staffOnly: true },
  { href: '/claves', label: 'Claves de acceso', ownerOnly: true, staffOnly: true },
  { href: '/usuarios', label: 'Usuarios', ownerOnly: true, staffOnly: true },
  { href: '/cobros', label: 'Cobros', ownerOnly: true, staffOnly: true },
  { href: '/actividad', label: 'Actividad', ownerOnly: false, staffOnly: false },
];

const canSee = (link: NavLinkDefinition, role: AdminRole): boolean =>
  (!link.ownerOnly || role === 'owner') && (!link.staffOnly || role !== 'client');

export const visibleNavLinks = (role: AdminRole): readonly NavLink[] =>
  NAV_LINK_DEFINITIONS.filter((link) => canSee(link, role)).map(({ href, label }) => ({
    href,
    label,
  }));

// Pantallas de la dueña dentro de una sección compartida: las métricas de demos muestran
// cómo le va a cada vendedor, que es información del negocio y no del equipo (la API
// responde 403 a una editora).
export const DEMO_METRICS_PATH = '/demos/metricas';
const OWNER_ONLY_SUBPATHS: readonly string[] = [DEMO_METRICS_PATH];

// Rutas que un rol sin acceso puede escribir a mano en la barra de direcciones: la pantalla
// debe mostrar el aviso de "solo para la dueña" en vez de un error crudo o quedar vacía.
export const isOwnerOnlyPath = (pathname: string): boolean =>
  NAV_LINK_DEFINITIONS.some((link) => link.ownerOnly && link.href === pathname) ||
  OWNER_ONLY_SUBPATHS.includes(pathname);

// Igual que la anterior pero para el equipo, y también para las pantallas que cuelgan de la
// sección (`/demos/<id>`): un `client` que escribe la dirección ve el aviso, no la ficha.
export const isStaffOnlyPath = (pathname: string): boolean =>
  NAV_LINK_DEFINITIONS.some(
    (link) =>
      link.staffOnly &&
      !link.ownerOnly &&
      (pathname === link.href || pathname.startsWith(`${link.href}/`)),
  );
