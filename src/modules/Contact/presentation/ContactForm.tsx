'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useSiteApiBaseUrl } from '@/shared/lib/useSiteApiBaseUrl';
import {
  ContactFormSchema,
  toContactInput,
  type ContactFormInput,
} from '../domain/ContactSchema';
import { useConsent } from '@/modules/Consent/presentation/ConsentProvider';
import { CONSENT_TEXT_VERSION } from '@/modules/Consent/domain/Consent';
import { ContactService } from '../application/ContactService';

interface ContactFormProps {
  // Dirección de la política de privacidad del cliente; nula = no hay página que enlazar.
  readonly privacyHref?: string | null;
}

export function ContactForm({ privacyHref = null }: ContactFormProps): ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { recordFor } = useConsent();
  const apiBaseUrl = useSiteApiBaseUrl();
  const contactService = useMemo(
    () =>
      new ContactService(
        apiBaseUrl,
        typeof window === 'undefined' ? undefined : window.location.hostname,
      ),
    [apiBaseUrl],
  );

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(ContactFormSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '', website: '' },
  });

  const onSubmit = async (values: ContactFormInput): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Primero el permiso y después el dato: si el registro falla, el mensaje igual se
      // manda (la persona ya autorizó en pantalla), pero el orden deja la prueba antes que
      // el tratamiento cuando ambos llegan.
      recordFor(
        { purposes: ['necessary'], textVersion: CONSENT_TEXT_VERSION },
        'contact',
      );
      const result = await contactService.sendContact(toContactInput(values));
      toast.success(result.message);
      form.reset();
    } catch {
      toast.error('No pudimos enviar tu mensaje. Inténtalo nuevamente en unos minutos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        className="relative space-y-6"
        noValidate
      >
        {/* Honeypot: fuera de pantalla y oculto a lectores, no con display:none (algunos bots lo detectan). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="website">No completar</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register('website')}
          />
        </div>
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
                <Input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  {...field}
                />
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
              <FormLabel>Teléfono (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos sobre tu proyecto..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acceptedPrivacy"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-2 text-sm">
                <FormControl>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={field.value === true}
                    onChange={(event) => field.onChange(event.target.checked)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <span>
                  Autorizo el tratamiento de mis datos para responder esta consulta
                  {privacyHref !== null && (
                    <>
                      , según la{' '}
                      <a
                        href={privacyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        política de privacidad
                      </a>
                    </>
                  )}
                  .
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Send /> Enviar mensaje
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
