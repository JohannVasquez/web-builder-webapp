# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primario: el visitante del sitio publicado de una pyme chilena.** Llega desde Instagram, Google o un enlace que alguien le compartió por WhatsApp, casi siempre en el celular. Su trabajo es entender rápido qué hace el negocio, si le da confianza y cómo contactarlo. Decide en segundos y el contacto real ocurre fuera del sitio.

**Secundario: el operador de la agencia** (dueño y editores). Arma, corrige y publica sitios desde el panel, atiende mensajes recibidos, sube imágenes y gestiona varios clientes en la misma sesión. Su trabajo es entregar rápido y corregir sin miedo a romper algo publicado.

**Terciario: el dueño del negocio cliente.** Existe como rol con permisos limitados a su propio sitio.

Cuando hay que priorizar entre superficies, mandan los sitios publicados por sobre el panel: es lo que el cliente compra y lo que ve su público.

## Product Purpose

Plataforma multi-cliente donde una agencia arma, publica y mantiene sitios para pymes chilenas —landing pages, y opcionalmente blog y tienda—, cada uno servido en su propio dominio y con su propia identidad.

El éxito es un sitio publicado en el dominio del cliente que la agencia pueda corregir y mantener a escala, cobrando de forma recurrente, sin que cada cliente nuevo cueste lo mismo que el primero.

## Positioning

Cuatro mecanismos, confirmados como diferenciales:

- **Un agente de IA arma y mantiene el sitio completo** por las mismas rutas que usa el panel, con los mismos permisos, validaciones y registro de actividad. Lo que otros hacen a mano, aquí se pide conversando.
- **Cumplimiento chileno de fábrica**: Ley 21.719, consentimiento auditable, derechos ARCOP, retención y borrado automático, páginas legales generadas desde plantilla. Una pyme sola no llega ahí, y una plantilla genérica tampoco.
- **Identidad de marca, estilo visual y variante de bloque son tres capas independientes** que se combinan libremente. El mismo contenido se ve con cualquier combinación sin reescribirlo.
- **De cero a publicado en minutos** desde kits por rubro, con paleta, tipografía y textos de ejemplo en español de Chile.

## Operating Context

- El visitante llega mayoritariamente en celular, muchas veces con conexión móvil.
- Todo el producto opera en español de Chile.
- Cada cliente entra por su propio dominio o subdominio; el contenido se resuelve por el host de la visita, nunca por un identificador.
- El contacto real ocurre fuera del sitio: botón flotante de WhatsApp y formulario que llega por correo al negocio.
- El operador trabaja con varios clientes a la vez y alterna entre ellos dentro de la misma sesión del panel.
- Las fotos llegan como las manda el cliente: por WhatsApp, sacadas con el celular, sin encuadrar.

## Capabilities and Constraints

**Confirmado y funcionando**

- 28 tipos de bloque, 13 estilos visuales, variantes por bloque y opciones comunes de espaciado, ancho, alineación, animación y visibilidad por dispositivo.
- Identidad de marca por cliente: paleta, tipografía desde un catálogo curado, logos, modo claro/oscuro.
- Multi-cliente por dominio, con borrador, publicación, historial de 50 versiones y caché invalidada por dominio.
- Blog y tienda opcionales por cliente: sin contenido cargado, simplemente no existen.
- Panel: clientes, demos de prospecto (crear, enviar el enlace por WhatsApp, seguir visitas, extender, descartar y convertir en cliente), dominios, páginas y bloques, identidad, biblioteca de imágenes, menú, mensajes, blog, tienda, usuarios, claves de agente y registro de actividad.
- Conexión para agentes con 46 herramientas, sobre las mismas rutas del panel.

**Restricciones que el trabajo futuro debe respetar**

- Un bloque tiene que verse bien sin imágenes: los kits nacen sin ellas a propósito.
- Los bloques no pueden traer colores propios escritos a mano; los toman de la identidad del cliente.
- Un tipo de bloque desconocido o con datos inválidos se ignora en silencio en vez de romper la página.
- Ningún cliente puede ver ni afectar los datos de otro.

**Decisiones abiertas y carencias conocidas** (no asumirlas resueltas)

- Los datos del negocio de un cliente no se pueden editar por ningún medio después de crearlo.
- Los campos de título, descripción e imagen para compartir existen en los datos pero no en el panel.
- Galería, Equipo, Logos de marcas, Antes y después y la portada del bloque de Video no aceptan imágenes de la biblioteca del cliente: solo direcciones externas.
- Un agente no puede subir imágenes; no hay recorte ni optimización al subirlas.
- No existe instalación en internet: la plataforma corre solo en el entorno de desarrollo.

## Brand Commitments

**La plataforma no tiene marca definida.** No hay nombre comercial comprometido, logo ni identidad propia: el panel no muestra marca alguna y `public/` solo contiene ejemplos del styleguide. El dominio `webbuilder.co` aparece en la configuración como destino técnico de los sitios, pero no está confirmado como nombre comercial.

Ningún trabajo futuro debe inventar un nombre, un logo ni una identidad para la plataforma. Es una decisión pendiente del dueño.

Cada cliente sí tiene su propia identidad, configurable y obligatoriamente respetada: cualquier bloque debe funcionar con cualquier paleta y cualquier tipografía del catálogo.

## Evidence on Hand

- Sitios de demostración existentes (ElectroAndes, Synova y otro de pruebas) armados para probar el desarrollo, **no** para vender: tienen textos de prueba y datos que no corresponden a un negocio creíble.
- Kits por rubro con textos de ejemplo reales en español de Chile, y sin imágenes por diseño.
- Capturas de pantalla de desarrollo en la raíz del monorepo.
- Grafo de conocimiento de ambos repositorios en `graphify-out/`.

**El repositorio no registra ningún cliente real ni ninguna venta.** Ninguna pieza futura debe inventar nombres de clientes, testimonios, métricas de resultados, casos de éxito ni cifras de uso.

## Product Principles

1. **El mismo contenido se muestra con cualquier identidad, cualquier estilo y cualquier variante sin reescribirlo.** Cambiar una capa nunca rompe las otras.
2. **Todo tiene que verse bien sin imágenes.** Las fotos llegan después, o no llegan.
3. **Nada que el panel permita hacer queda fuera del alcance de un agente, ni al revés.** Mismas rutas, mismos permisos, mismas validaciones, mismo registro.
4. **Lo que el público ve es una foto publicada.** Editar no cambia el sitio hasta que una persona decide publicar, y siempre se puede volver atrás.
5. **Un dato que falta usa un valor por defecto razonable en vez de romper el sitio.**

## Accessibility & Inclusion

- El color de texto sobre cualquier color de marca se deriva automáticamente para superar 4.5:1, con pruebas que lo verifican sobre una batería de paletas.
- Meta declarada: navegable con teclado, texto alternativo en las imágenes y contraste nivel AA.
- Las animaciones se desactivan cuando el visitante tiene configurado "reducir movimiento".
- El texto alternativo se pide y se edita aparte del momento de subir la imagen, porque en la práctica casi nunca se escribe ahí.
