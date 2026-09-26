import { notFound } from 'next/navigation';

// El canje del enlace mágico lo hace `proxy.ts`, que es el único lugar donde se puede dejar la
// cookie y redirigir antes de renderizar. Aquí solo llega un enlace que no sirvió (inválido,
// vencido, de otra demo, descartado): se ve el 404 normal del sitio, sin explicar por qué.
export default function InvalidDemoLinkPage(): never {
  notFound();
}
