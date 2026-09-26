// Acciones públicas que el navegador dispara mientras se mira una demo de prospecto. Pasan
// por el servidor de Next (`/demo/api/<acción>`) para que el token viaje desde la cookie
// httpOnly sin exponerlo a los scripts de la página. La API se encarga de que ninguna tenga
// efectos reales en una demo (DEMO 03): no envía correos ni cobra.
//
// Es una lista cerrada a propósito: el reenvío no tiene que servir para llegar a cualquier
// ruta de la API con el token del prospecto.
export const DEMO_FORWARDED_ACTIONS = [
  'contact',
  'newsletter',
  'store/quote',
  'store/checkout',
  'consents',
  'solicitudes-datos',
  'reclamos',
] as const;

export type DemoForwardedAction = (typeof DEMO_FORWARDED_ACTIONS)[number];

export const toForwardedDemoAction = (
  segments: readonly string[],
): DemoForwardedAction | null => {
  const path = segments.join('/');
  return (DEMO_FORWARDED_ACTIONS as readonly string[]).includes(path)
    ? (path as DemoForwardedAction)
    : null;
};
