// Lógica pura de reordenamiento de bloques (Pantalla 2). El editor siempre manda TODOS los
// ids en el orden final a `PUT .../sections/reorder`, así que estas funciones solo calculan
// esa lista; quien las llama es responsable de hacer la petición.

export const moveSectionUp = (ids: readonly string[], id: string): string[] => {
  const index = ids.indexOf(id);
  if (index <= 0) {
    return [...ids];
  }
  const next = [...ids];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
};

export const moveSectionDown = (ids: readonly string[], id: string): string[] => {
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
  ids: readonly string[],
  sourceId: string,
  newId: string,
): string[] => {
  const index = ids.indexOf(sourceId);
  if (index === -1) {
    return [...ids, newId];
  }
  const next = [...ids];
  next.splice(index + 1, 0, newId);
  return next;
};

export type DropPlacement = 'before' | 'after';

// A qué lado del bloque objetivo cae el que se está arrastrando, según en qué mitad de su
// alto se soltó el puntero (0 = borde superior del bloque objetivo, 1 = borde inferior).
export const dropPlacement = (offsetRatio: number): DropPlacement =>
  offsetRatio < 0.5 ? 'before' : 'after';

// Nuevo orden completo al soltar un bloque arrastrado sobre otro (Pantalla 2, arrastrar con
// la API nativa de HTML5). Si alguno de los dos ids no está en la lista, o se suelta sobre
// sí mismo, el orden no cambia.
export const reorderByDrag = (
  ids: readonly string[],
  draggedId: string,
  targetId: string,
  placement: DropPlacement,
): string[] => {
  if (draggedId === targetId || !ids.includes(draggedId) || !ids.includes(targetId)) {
    return [...ids];
  }
  const withoutDragged = ids.filter((id) => id !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  const insertAt = placement === 'before' ? targetIndex : targetIndex + 1;
  const next = [...withoutDragged];
  next.splice(insertAt, 0, draggedId);
  return next;
};
