import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { tenantCacheTag } from '@/shared/lib/cacheTags';

/**
 * Invalida la caché del contenido público de uno o más dominios (SPEC 0.2).
 * Lo llama la API después de cada escritura de administración o de un agente,
 * para que el cambio se vea publicado sin reiniciar nada.
 *
 * No es una ruta pública: entrando por Caddy, `/api/*` lo atiende la API y
 * este endpoint ni siquiera es alcanzable desde internet. La API le pega
 * directo al puerto del frontend, por la red interna, con un secreto
 * compartido (`REVALIDATE_SECRET`).
 */
const RevalidateRequestSchema = z.object({
  domains: z.array(z.string().min(1)).max(50),
});

const SECRET_HEADER = 'x-revalidate-secret';

/** Comparación en tiempo constante: un `===` filtra el secreto por timing. */
const isValidSecret = (provided: string | null, expected: string): boolean => {
  if (expected === '' || provided === null) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const expected = process.env.REVALIDATE_SECRET ?? '';
  if (!isValidSecret(request.headers.get(SECRET_HEADER), expected)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Secreto de revalidación inválido.' },
      { status: 401 },
    );
  }

  const parsed = RevalidateRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'BadRequest', message: 'Se espera { domains: string[] }.' },
      { status: 400 },
    );
  }

  const tags = parsed.data.domains.map(tenantCacheTag);
  for (const tag of tags) {
    // `{ expire: 0 }` en vez de `'max'`: con stale-while-revalidate el primer
    // visitante después de guardar seguiría viendo la versión vieja, y lo que
    // pide la spec es que el cambio se vea de inmediato.
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: tags });
}
