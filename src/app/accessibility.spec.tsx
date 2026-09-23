import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Prueba de regresión sobre el layout de tenant: son garantías que se pierden con un
// refactor distraído y que no se notan hasta que alguien intenta navegar con teclado.
describe('accesibilidad del layout público', () => {
  const layout = readFileSync(
    join(process.cwd(), 'src/app/[tenantDomain]/layout.tsx'),
    'utf8',
  );

  it('ofrece saltar al contenido antes del menú', () => {
    expect(layout).toContain('href="#contenido"');
    expect(layout).toContain('Saltar al contenido');
  });

  it('el destino del salto existe y puede recibir el foco', () => {
    expect(layout).toContain('id="contenido"');
    expect(layout).toContain('tabIndex={-1}');
  });

  it('el enlace solo se ve al enfocarlo, para no estorbar con el mouse', () => {
    expect(layout).toContain('sr-only');
    expect(layout).toContain('focus:not-sr-only');
  });
});
