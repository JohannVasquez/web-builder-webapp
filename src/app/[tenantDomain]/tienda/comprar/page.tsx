'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCart } from '@/modules/Store/presentation/CartProvider';
import { createIdempotencyKeyTracker } from '@/modules/Store/application/idempotencyKey';
import { OrderSummary } from '@/modules/Store/presentation/OrderSummary';
import { SellerIdentityCard } from '@/modules/Store/presentation/SellerIdentityCard';
import { formatClp } from '@/modules/Store/presentation/money';
import { afterCheckout } from '@/modules/Store/presentation/thanksData';
import { StoreOrderService } from '@/modules/Store/application/StoreOrderService';
import { CustomerInputSchema } from '@/modules/Store/domain/Checkout';
import type { DeliveryMethod } from '@/modules/Store/domain/Checkout';
import type { QuoteResponse } from '@/modules/Store/domain/Quote';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { useSiteApiBaseUrl } from '@/shared/lib/useSiteApiBaseUrl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

const EMPTY_QUOTE: QuoteResponse = {
  lines: [],
  totals: {
    subtotalCents: 0,
    discountCents: 0,
    shippingCents: 0,
    totalCents: 0,
    taxCents: 0,
  },
  currency: 'CLP',
  coupon: null,
  couponRejection: null,
  shipping: null,
  availableShipping: [],
  taxIncluded: true,
  taxRatePercent: 0,
  termsPageSlug: null,
};

// La dirección se valida en el servidor, no acá: `CustomerInputSchema` ya trae los mensajes
// para nombre/correo/teléfono, esta extensión solo declara las claves del formulario.
const CheckoutFormSchema = CustomerInputSchema.extend({
  addressLine: z.string(),
  addressCity: z.string(),
  addressRegion: z.string(),
  addressNotes: z.string(),
});

type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage(): ReactElement {
  const router = useRouter();
  const cart = useCart();
  // Una clave por compra, estable entre dobles clics y reintentos (ver idempotencyKey.ts).
  const submittingRef = useRef(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [keyForPurchase] = useState(() =>
    createIdempotencyKeyTracker(() => crypto.randomUUID()),
  );
  const apiBaseUrl = useSiteApiBaseUrl();
  const orderService = useMemo(
    () =>
      new StoreOrderService(
        apiBaseUrl,
        typeof window === 'undefined' ? undefined : window.location.hostname,
      ),
    [apiBaseUrl],
  );

  const [selectedShippingCode, setSelectedShippingCode] = useState<string | undefined>(
    undefined,
  );
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsKey = JSON.stringify(cart.items);

  // Las formas de envío no dependen de cuál esté elegida ni del cupón: se piden aparte, con
  // una clave estable, para saber cuál es la primera opción (la que se usa por defecto) SIN
  // necesitar un efecto que la fije después de que la cotización de abajo ya resolvió.
  const { data: optionsData } = useAsyncData<QuoteResponse>(
    `store-checkout-options:${itemsKey}`,
    () =>
      cart.items.length === 0
        ? Promise.resolve(EMPTY_QUOTE)
        : orderService.quote({ items: [...cart.items] }),
  );
  const availableShipping = optionsData?.availableShipping ?? [];
  const effectiveShippingCode = selectedShippingCode ?? availableShipping[0]?.code;
  const selectedOption = availableShipping.find(
    (option) => option.code === effectiveShippingCode,
  );
  const requiresAddress = selectedOption?.requiresAddress ?? false;

  const { data } = useAsyncData<QuoteResponse>(
    `store-checkout-quote:${itemsKey}:${effectiveShippingCode ?? ''}:${appliedCoupon ?? ''}`,
    () =>
      cart.items.length === 0
        ? Promise.resolve(EMPTY_QUOTE)
        : orderService.quote({
            items: [...cart.items],
            couponCode: appliedCoupon,
            shippingCode: effectiveShippingCode,
          }),
  );
  const quote = data ?? EMPTY_QUOTE;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      addressLine: '',
      addressCity: '',
      addressRegion: '',
      addressNotes: '',
    },
  });

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="ui-heading text-3xl">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-3">Agrega productos antes de comprar.</p>
        <Button asChild className="mt-6">
          <Link href="/tienda">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: CheckoutFormValues): Promise<void> => {
    // Dos clics seguidos llegan antes de que React vuelva a pintar el botón deshabilitado: la
    // ref los frena en el acto. La clave de idempotencia de la API queda como respaldo.
    if (submittingRef.current) {
      return;
    }
    // La API también lo valida; acá se ataja antes para no mandar una compra que va a fallar.
    if (quote.termsPageSlug !== null && !acceptedTerms) {
      setTermsError(
        'Para comprar tienes que aceptar los términos y condiciones de compra.',
      );
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const method: DeliveryMethod = requiresAddress ? 'shipping' : 'pickup';
      const purchase = {
        items: [...cart.items],
        couponCode: appliedCoupon,
        shippingCode: effectiveShippingCode,
        customer: { name: values.name, email: values.email, phone: values.phone },
        delivery: {
          method,
          addressLine: requiresAddress ? values.addressLine : undefined,
          addressCity: requiresAddress ? values.addressCity : undefined,
          addressRegion: requiresAddress ? values.addressRegion : undefined,
          addressNotes: requiresAddress ? values.addressNotes : undefined,
        },
        returnUrl:
          typeof window === 'undefined'
            ? undefined
            : `${window.location.origin}/tienda/gracias`,
        acceptedTerms,
      };
      const response = await orderService.checkout(purchase, keyForPurchase(purchase));

      cart.clear();

      const next = afterCheckout(response, window.location.origin);
      if (next.kind === 'external') {
        window.location.href = next.url;
        return;
      }
      router.push(next.path);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'No pudimos procesar tu compra.',
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="ui-heading mb-8 text-3xl md:text-4xl">Confirma tu compra</h1>

      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <Form {...form}>
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            className="flex flex-col gap-8"
            noValidate
          >
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Tus datos</h2>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Entrega</h2>
              <div className="flex flex-col gap-2">
                {availableShipping.map((option) => (
                  <label
                    key={option.code}
                    className="ui-input flex cursor-pointer items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingCode"
                        value={option.code}
                        checked={effectiveShippingCode === option.code}
                        onChange={() => setSelectedShippingCode(option.code)}
                      />
                      {option.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {option.priceCents === 0 ? 'Gratis' : formatClp(option.priceCents)}
                    </span>
                  </label>
                ))}
              </div>

              {requiresAddress && (
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="addressLine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle y número" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comuna</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressRegion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Región</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="addressNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas de despacho (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: departamento, referencia" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Cupón de descuento</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Código del cupón"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAppliedCoupon(couponInput.trim() || undefined)}
                >
                  Aplicar
                </Button>
              </div>
            </section>

            {quote.termsPageSlug !== null && (
              <div className="space-y-1">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={acceptedTerms}
                    aria-describedby={termsError === null ? undefined : 'terms-error'}
                    onChange={(event) => {
                      setAcceptedTerms(event.target.checked);
                      setTermsError(null);
                    }}
                  />
                  <span>
                    Leí y acepto los{' '}
                    <a
                      href={`/${quote.termsPageSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      términos y condiciones de compra
                    </a>
                    .
                  </span>
                </label>
                {termsError !== null && (
                  <p id="terms-error" role="alert" className="text-destructive text-sm">
                    {termsError}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Procesando...
                </>
              ) : (
                'Confirmar compra'
              )}
            </Button>
          </form>
        </Form>

        <div className="h-fit space-y-4">
          <OrderSummary quote={quote} />
          {/* Antes de pagar, no después: quien contrata tiene derecho a saber con quién. */}
          <SellerIdentityCard seller={quote.seller} variant="checkout" />
        </div>
      </div>
    </div>
  );
}
