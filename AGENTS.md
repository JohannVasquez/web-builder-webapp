<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Guía para agentes de IA — web-builder-webapp

Frontend del motor de landing pages dinámicas. Las páginas se ensamblan al vuelo desde los bloques que devuelve `web-builder-api`; el código de los componentes es la fuente del producto que ve el visitante. **Un agente mal informado produce cincuenta archivos consistentes con la idea equivocada.**

**No abras todos los documentos a la vez.** Empieza aquí y consulta el resto solo cuando la tarea lo requiera.

## Qué leer ANTES de tocar código

1. [Guía de arquitectura](docs/arquitectura.md) — capas, reglas de dependencia, dónde vive cada cosa.
2. [Guía de convenciones](docs/convenciones.md) — nombres de archivos, comentarios, imports, commits y tests.

## Qué leer SOLO cuando haga falta

- [Cómo agregar algo nuevo](docs/como-agregar-algo-nuevo.md) — bloque de página y estilo visual, paso a paso.
- [Cómo agregar un estilo visual](docs/agregar-un-estilo-visual.md) — guía dedicada al sistema de tokens.
- [README.md](README.md) — stack, arquitectura general, caché, tipografía, cómo levantar el proyecto.
- [PRODUCT.md](PRODUCT.md) — para qué existe el producto, restricciones y decisiones abiertas.
- [DESIGN.md](DESIGN.md) — sistema de diseño: tokens, reglas de layout, componentes, do's and don'ts.
