import type { AdminRole } from '@/modules/Auth/domain/Session';

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface NavLinkDefinition extends NavLink {
  // Pantallas exclusivas de la dueña de la cuenta: claves de acceso y usuarios (SPEC 9.2).
  readonly ownerOnly: boolean;
}

const NAV_LINK_DEFINITIONS: readonly NavLinkDefinition[] = [
  { href: '/', label: 'Clientes', ownerOnly: false },
  { href: '/claves', label: 'Claves de acceso', ownerOnly: true },
  { href: '/usuarios', label: 'Usuarios', ownerOnly: true },
  { href: '/cobros', label: 'Cobros', ownerOnly: true },
  { href: '/actividad', label: 'Actividad', ownerOnly: false },
];

export const visibleNavLinks = (role: AdminRole): readonly NavLink[] =>
  NAV_LINK_DEFINITIONS.filter((link) => !link.ownerOnly || role === 'owner').map(
    ({ href, label }) => ({ href, label }),
  );

// Rutas que un rol sin acceso puede escribir a mano en la barra de direcciones: la pantalla
// debe mostrar el aviso de "solo para la dueña" en vez de un error crudo o quedar vacía.
export const isOwnerOnlyPath = (pathname: string): boolean =>
  NAV_LINK_DEFINITIONS.some((link) => link.ownerOnly && link.href === pathname);
