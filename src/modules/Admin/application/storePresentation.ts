import type { OrderStatus } from '../domain/StoreApi';

export const formatMoney = (cents: number, currency: string = 'CLP'): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents);
};

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  pending: 'Pendiente de pago',
  paid: 'Pagado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status];
};

const NEXT_STATUSES: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ['paid', 'cancelled'],
  paid: ['preparing', 'shipped', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const getAvailableNextStatuses = (currentStatus: OrderStatus): readonly OrderStatus[] => {
  return NEXT_STATUSES[currentStatus] ?? [];
};

export const isValidSalePrice = (priceCents: number, salePriceCents: number | null): boolean => {
  if (salePriceCents === null) {
    return true;
  }
  return salePriceCents < priceCents;
};

export const isValidCouponPercentage = (discountType: string, value: number): boolean => {
  if (discountType === 'percentage' && value > 100) {
    return false;
  }
  return true;
};

export const proposeSlug = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const padDatePart = (value: number): string => String(value).padStart(2, '0');

const parseDateInput = (value: string): [number, number, number] | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

// Un `<input type="date">` da el día en hora local, y `new Date('2026-09-30')` lo lee como
// medianoche UTC: en Chile eso son las 21:00 del día anterior. Por eso "desde" y "hasta" se
// convierten al primer y último instante del día LOCAL antes de mandarlos a la API.
export const startOfLocalDayIso = (value: string): string | null => {
  const parts = parseDateInput(value);
  if (parts === null) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};

// "Hasta el 30" tiene que incluir todo el 30, no cortar a su medianoche.
export const endOfLocalDayIso = (value: string): string | null => {
  const parts = parseDateInput(value);
  if (parts === null) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};

export const toLocalDateInput = (iso: string | null): string => {
  if (iso === null || iso === '') {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${String(date.getFullYear())}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

interface DeliveryLike {
  readonly method: string;
  readonly shippingName?: string | null;
  readonly addressCity?: string | null;
  readonly addressRegion?: string | null;
}

// El método llega de la API como `shipping` o `pickup`; quien arma el pedido necesita leer
// cómo se entrega, en su idioma, y con el nombre de la forma de envío si la hay.
export const describeDelivery = (delivery: DeliveryLike): string => {
  if (delivery.method === 'pickup') {
    return 'Retiro en tienda';
  }
  const name = delivery.shippingName ?? '';
  return name === '' ? 'Despacho' : `Despacho: ${name}`;
};

// Sin coma colgando cuando falta la ciudad o la región.
export const formatPlace = (delivery: DeliveryLike): string =>
  [delivery.addressCity, delivery.addressRegion]
    .filter((part): part is string => part !== null && part !== undefined && part.trim() !== '')
    .join(', ');

// La API agrupa las ventas por un día que ya es local ("2026-09-22"). Pasarlo por `new Date`
// lo leería como medianoche UTC y en Chile lo mostraría como el día anterior.
export const formatReportDay = (day: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  return match === null ? day : `${match[3]}-${match[2]}-${match[1]}`;
};

// La zona del navegador de quien mira el reporte; si no se puede saber, la de Chile.
export const browserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago';
  } catch {
    return 'America/Santiago';
  }
};
