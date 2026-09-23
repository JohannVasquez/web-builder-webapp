// Lógica pura del editor de `props` en JSON (Pantalla 2): parsea el texto del textarea y
// explica cualquier problema en español, sin exponer el mensaje crudo de `JSON.parse`.

export type ParsePropsResult =
  | { readonly ok: true; readonly value: Record<string, unknown> }
  | { readonly ok: false; readonly error: string };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// `JSON.parse` no da siempre el mismo formato de mensaje (varía según el tipo de error y el
// motor de JS), así que se extrae la posición cuando está y se explica el resto con un
// texto genérico en vez de repetir el inglés crudo de la excepción.
const describeSyntaxError = (message: string): string => {
  const positionMatch = /position (\d+)/.exec(message);
  if (positionMatch !== null) {
    return `El JSON tiene un error de sintaxis cerca de la posición ${positionMatch[1]}. Revisa que no falte o sobre una coma, una llave o una comilla.`;
  }
  const lineColumnMatch = /line (\d+) column (\d+)/.exec(message);
  if (lineColumnMatch !== null) {
    return `El JSON tiene un error de sintaxis en la línea ${lineColumnMatch[1]}, columna ${lineColumnMatch[2]}. Revisa que no falte o sobre una coma, una llave o una comilla.`;
  }
  if (/unexpected end/i.test(message)) {
    return 'El JSON está incompleto: falta cerrar una llave "}", un corchete "]" o una comilla.';
  }
  return 'El JSON tiene un error de sintaxis. Revisa que no falte o sobre una coma, una llave o una comilla.';
};

export const parseProps = (text: string): ParsePropsResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { ok: false, error: describeSyntaxError(message) };
  }

  if (!isPlainObject(parsed)) {
    return {
      ok: false,
      error:
        'El contenido debe ser un objeto (entre llaves { }), no una lista ni un valor suelto.',
    };
  }

  return { ok: true, value: parsed };
};

export const formatProps = (props: Readonly<Record<string, unknown>>): string =>
  JSON.stringify(props, null, 2);
