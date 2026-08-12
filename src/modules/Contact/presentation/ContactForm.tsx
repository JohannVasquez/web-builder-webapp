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
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { ContactSchema, type ContactInput } from '../domain/ContactSchema';
import { ContactService } from '../application/ContactService';

export function ContactForm(): ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactService = useMemo(() => new ContactService(getPublicApiBaseUrl()), []);

  const form = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values: ContactInput): Promise<void> => {
    setIsSubmitting(true);
    try {
      const result = await contactService.sendContact(values);
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
        className="space-y-6"
        noValidate
      >
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
