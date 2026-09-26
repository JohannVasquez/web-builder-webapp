/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DemoLinksReveal, LINKS_SHOWN_ONCE_WARNING } from './DemoLinksReveal';
import { CREATED_DEMO, PROSPECT_URL, TEAM_URL } from './demoTestData';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const renderReveal = (onDismiss = jest.fn()): void => {
  render(
    <DemoLinksReveal
      title="Demo lista"
      prospectLink={CREATED_DEMO.links.prospect}
      teamLink={CREATED_DEMO.links.team}
      businessName="Pastelería Luna"
      contactName="Luna"
      phone="+56 9 1234 5678"
      onDismiss={onDismiss}
    />,
  );
};

describe('DemoLinksReveal', () => {
  it('avisa que los enlaces no se vuelven a mostrar', () => {
    renderReveal();
    expect(screen.getByRole('alert')).toHaveTextContent(LINKS_SHOWN_ONCE_WARNING);
    expect(LINKS_SHOWN_ONCE_WARNING).toBe(
      'Guarda o envía el enlace ahora; no se vuelve a mostrar. Si lo pierdes, genera uno nuevo.',
    );
    expect(screen.getByText(PROSPECT_URL)).toBeInTheDocument();
    expect(screen.getByText(TEAM_URL)).toBeInTheDocument();
  });

  it('copia el enlace del prospecto', async () => {
    const user = userEvent.setup();
    renderReveal();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');

    await user.click(screen.getByRole('button', { name: /Copiar enlace del prospecto/ }));

    expect(writeText).toHaveBeenCalledWith(PROSPECT_URL);
  });

  it('abre WhatsApp con el teléfono del prospecto y el mensaje editable con el enlace', () => {
    renderReveal();
    const whatsapp = screen.getByRole('link', { name: /Enviar por WhatsApp/ });
    const href = whatsapp.getAttribute('href') ?? '';

    expect(href.startsWith('https://wa.me/56912345678?text=')).toBe(true);
    expect(decodeURIComponent(href.split('?text=')[1] ?? '')).toContain(PROSPECT_URL);
    expect(whatsapp).toHaveAttribute('target', '_blank');

    fireEvent.change(screen.getByLabelText('Mensaje para WhatsApp'), {
      target: { value: `Hola Luna, tu sitio: ${PROSPECT_URL}` },
    });

    expect(
      decodeURIComponent(
        screen.getByRole('link', { name: /Enviar por WhatsApp/ }).getAttribute('href') ??
          '',
      ),
    ).toContain(`Hola Luna, tu sitio: ${PROSPECT_URL}`);
  });

  it('avisa si el mensaje ya no lleva el enlace', () => {
    renderReveal();
    fireEvent.change(screen.getByLabelText('Mensaje para WhatsApp'), {
      target: { value: 'Hola Luna' },
    });
    expect(screen.getByText(/ya no incluye el enlace/)).toBeInTheDocument();
  });

  it('abre el enlace de equipo en otra pestaña', () => {
    renderReveal();
    const team = screen.getByRole('link', { name: /Ver como equipo/ });
    expect(team).toHaveAttribute('href', TEAM_URL);
    expect(team).toHaveAttribute('target', '_blank');
  });

  it('pide confirmar antes de cerrar, porque no se pueden volver a ver', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    window.confirm = jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderReveal(onDismiss);

    await user.click(screen.getByRole('button', { name: 'Cerrar los enlaces' }));
    expect(onDismiss).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cerrar los enlaces' }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
