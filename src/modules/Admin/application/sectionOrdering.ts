// Lógica pura de reordenamiento de bloques (Pantalla 2). El editor siempre manda TODOS los
// ids en el orden final a `PUT .../sections/reorder`, así que estas funciones solo calculan
// esa lista; quien las llama es responsable de hacer la petición.

export const moveSectionUp = (ids: readonly number[], id: number): number[] => {
  const index = ids.indexOf(id);
  if (index <= 0) {
    return [...ids];
  }
  const next = [...ids];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
};

export const moveSectionDown = (ids: readonly number[], id: number): number[] => {
  const index = ids.indexOf(id);
  if (index === -1 || index >= ids.length - 1) {
    return [...ids];
  }
  const next = [...ids];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
};

// Dónde queda el id del bloque recién duplicado: justo después del original. Si el
// original ya no está en la lista (no debería pasar), se agrega al final.
export const insertDuplicateAfter = (
  ids: readonly number[],
  sourceId: number,
  newId: number,
): number[] => {
  const index = ids.indexOf(sourceId);
  if (index === -1) {
    return [...ids, newId];
  }
  const next = [...ids];
  next.splice(index + 1, 0, newId);
  return next;
};
