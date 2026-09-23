// Formatea un monto en pesos chilenos (enteros, sin decimales) al mismo estilo que ya trae
// formateado la API en `ProductView.price`/`salePrice` ("$29.990"): solo se usa para montos
// que la API entrega en crudo, como los totales de `/api/store/quote` y `/checkout`.
export const formatClp = (amount: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
