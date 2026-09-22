import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { VisualStyleTokens } from '@/modules/VisualStyle/presentation/VisualStyleTokens';
import { VISUAL_STYLES } from '@/modules/VisualStyle/domain/registry';
import { COMPONENT_MAP } from '@/modules/Page/presentation/componentMap';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Props de ejemplo por cada tipo de bloque, con las mismas claves que COMPONENT_MAP.
const SAMPLE_PROPS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  Hero: {
    eyebrow: 'Certificados SEC Clase A',
    title: 'Instalaciones eléctricas',
    titleAccent: 'seguras y certificadas',
    subtitle:
      'Diseñamos, instalamos y mantenemos proyectos eléctricos residenciales e industriales.',
    ctaLabel: 'Solicitar cotización',
    ctaHref: '#',
    secondaryCtaLabel: 'Ver servicios',
    secondaryCtaHref: '#',
  },
  Features: {
    eyebrow: 'Por qué elegirnos',
    title: 'Todo lo que necesitas en un solo lugar',
    variant: 'card',
    items: [
      { icon: 'zap', title: 'Rápido', description: 'Respuesta en menos de 24 horas.' },
      {
        icon: 'shield',
        title: 'Seguro',
        description: 'Certificación SEC en cada proyecto.',
      },
      {
        icon: 'layers',
        title: 'Completo',
        description: 'Diseño, instalación y mantención.',
      },
    ],
  },
  CallToAction: {
    title: '¿Listo para comenzar?',
    subtitle: 'Conversemos sobre tu proyecto sin compromiso.',
    buttonLabel: 'Contáctanos',
    buttonHref: '#',
  },
  TextBlock: {
    title: 'Sobre nosotros',
    content:
      'Somos una empresa con más de 10 años de experiencia en proyectos eléctricos residenciales, comerciales e industriales.',
  },
  ContactForm: {
    title: 'Contáctanos',
    subtitle: 'Te responderemos a la brevedad.',
  },
  Stats: {
    title: 'Nuestros números',
    items: [
      { value: '120+', label: 'Proyectos' },
      { value: '15', label: 'Años' },
      { value: '98%', label: 'Satisfacción' },
      { value: '24/7', label: 'Soporte' },
    ],
  },
  ServiceCards: {
    title: 'Nuestros servicios',
    subtitle: 'Soluciones a medida para cada proyecto.',
    items: [
      {
        icon: 'wrench',
        title: 'Instalaciones',
        description: 'Proyectos eléctricos completos, de principio a fin.',
        checklist: ['Diseño', 'Ejecución', 'Certificación'],
      },
      {
        icon: 'gauge',
        title: 'Mantención',
        description: 'Revisiones periódicas para evitar fallas.',
        checklist: [],
      },
      {
        icon: 'shield',
        title: 'Certificación SEC',
        description: 'Trámites y documentación al día.',
        checklist: [],
      },
    ],
  },
  SplitHighlights: {
    eyebrow: '¿Por qué elegirnos?',
    title: 'La diferencia está en el detalle',
    items: [
      {
        icon: 'badge-check',
        title: 'Certificados',
        description: 'Cumplimos toda la normativa vigente.',
      },
      {
        icon: 'clock',
        title: 'Puntualidad',
        description: 'Llegamos y entregamos cuando prometemos.',
      },
    ],
  },
  Testimonials: {
    title: 'Lo que dicen nuestros clientes',
    items: [
      {
        badgeLabel: 'Proyecto residencial',
        quote: 'Excelente servicio, muy profesionales y puntuales.',
        rating: 5,
        authorName: 'Juan Pérez',
        authorLocation: 'Santiago',
      },
    ],
  },
  LocationMap: {
    title: 'Encuéntranos',
    subtitle: 'Visítanos en nuestra oficina',
    address: 'Av. Providencia 1234, Santiago',
  },
  Columns: {
    title: 'Cómo trabajamos',
    subtitle: 'Un proceso simple, de principio a fin.',
    columns: [
      {
        eyebrow: 'Paso 1',
        title: 'Diagnóstico',
        content: 'Evaluamos tu proyecto en terreno.',
      },
      {
        eyebrow: 'Paso 2',
        title: 'Propuesta',
        content: 'Te enviamos una cotización clara.',
      },
      {
        eyebrow: 'Paso 3',
        title: 'Ejecución',
        content: 'Realizamos el trabajo y certificamos.',
      },
    ],
  },
  Faq: {
    eyebrow: 'Dudas frecuentes',
    title: '¿Tienes preguntas?',
    items: [
      {
        question: '¿Trabajan fuera de Santiago?',
        answer:
          'Sí, cubrimos toda la Región Metropolitana y alrededores con recargo de traslado.',
      },
      {
        question: '¿Cuánto demora una cotización?',
        answer:
          'Respondemos dentro del día hábil siguiente, con precio y plazo cerrados.',
      },
      {
        question: '¿Emiten boleta o factura?',
        answer: 'Las dos. Lo indicas al confirmar el trabajo.',
      },
    ],
  },
  Pricing: {
    eyebrow: 'Planes',
    title: 'Elige cómo empezar',
    showBillingToggle: true,
    plans: [
      {
        name: 'Básico',
        description: 'Para partir con presencia en línea.',
        priceMonthly: 29000,
        priceYearly: 290000,
        features: ['Sitio de una página', 'Formulario de contacto', 'Dominio propio'],
        ctaLabel: 'Empezar',
        ctaHref: '/contacto',
      },
      {
        name: 'Profesional',
        description: 'El que eligen la mayoría de los negocios.',
        priceMonthly: 49000,
        priceYearly: 490000,
        features: ['Hasta 5 páginas', 'Blog incluido', 'Soporte prioritario'],
        ctaLabel: 'Empezar',
        ctaHref: '/contacto',
        featured: true,
      },
      {
        name: 'Tienda',
        description: 'Para vender en línea.',
        priceMonthly: 79000,
        features: ['Catálogo de productos', 'Pedidos por WhatsApp', 'Reportes de ventas'],
        ctaLabel: 'Empezar',
        ctaHref: '/contacto',
      },
    ],
  },
  Gallery: {
    eyebrow: 'Trabajos',
    title: 'Algunos proyectos',
    images: [
      { url: '/styleguide/sample-1.svg', alt: 'Tablero eléctrico recién instalado' },
      { url: '/styleguide/sample-2.svg', alt: 'Cuadrilla trabajando en terreno' },
      { url: '/styleguide/sample-3.svg', alt: 'Luminarias de una bodega industrial' },
    ],
  },
  LogoCloud: {
    title: 'Confían en nosotros',
    logos: [
      { url: '/styleguide/sample-1.svg', alt: 'Cliente uno' },
      { url: '/styleguide/sample-2.svg', alt: 'Cliente dos' },
      { url: '/styleguide/sample-3.svg', alt: 'Cliente tres' },
    ],
  },
  Team: {
    eyebrow: 'Quiénes somos',
    title: 'El equipo',
    members: [
      {
        name: 'Camila Soto',
        role: 'Jefa de proyectos',
        bio: 'Doce años coordinando obras eléctricas.',
      },
      {
        name: 'Rodrigo Pérez',
        role: 'Instalador SEC clase A',
        bio: 'Especialista en tableros industriales.',
      },
      {
        name: 'Valentina Ruiz',
        role: 'Atención a clientes',
        bio: 'Responde cotizaciones el mismo día.',
      },
    ],
  },
  Timeline: {
    eyebrow: 'Cómo trabajamos',
    title: 'Tres pasos, sin sorpresas',
    steps: [
      {
        title: 'Diagnóstico',
        description: 'Visitamos el lugar y evaluamos la instalación existente.',
      },
      {
        title: 'Propuesta',
        description: 'Te enviamos una cotización clara, con precio y plazo.',
      },
      {
        title: 'Ejecución',
        description: 'Realizamos el trabajo y entregamos la certificación.',
      },
    ],
  },
  Video: {
    eyebrow: 'Conócenos',
    title: 'Un minuto con nosotros',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    caption: 'Así trabajamos en terreno.',
  },
  AnnouncementBar: {
    message: '20% de descuento en mantenciones durante este mes.',
    linkLabel: 'Ver condiciones',
    linkHref: '/contacto',
    variant: 'inline',
  },
  BeforeAfter: {
    eyebrow: 'Resultados',
    title: 'Antes y después',
    beforeUrl: '/styleguide/sample-1.svg',
    afterUrl: '/styleguide/sample-2.svg',
    beforeLabel: 'Antes',
    afterLabel: 'Después',
    caption: 'Tablero de un edificio de Ñuñoa, renovado en dos días.',
  },
  OpeningHours: {
    eyebrow: 'Atención',
    title: 'Cuándo puedes visitarnos',
    days: [
      { day: 'lunes', open: '09:00', close: '18:00' },
      { day: 'martes', open: '09:00', close: '18:00' },
      { day: 'miercoles', open: '09:00', close: '18:00' },
      { day: 'jueves', open: '09:00', close: '18:00' },
      { day: 'viernes', open: '09:00', close: '18:00' },
      { day: 'sabado', open: '10:00', close: '14:00' },
      { day: 'domingo', closed: true },
    ],
  },
  Newsletter: {
    eyebrow: 'Novedades',
    title: 'Te avisamos cuando haya algo bueno',
    subtitle: 'Un correo al mes, sin relleno.',
  },
  GoogleReviews: {
    eyebrow: 'Opiniones',
    title: 'Lo que dicen en Google',
    rating: 4.8,
    reviewCount: 127,
    reviews: [
      {
        author: 'Marcela Reyes',
        rating: 5,
        text: 'Llegaron a la hora acordada y dejaron todo certificado. Impecable.',
      },
      {
        author: 'Jorge Fuentes',
        rating: 5,
        text: 'Cotizaron el mismo día y el precio no cambió al final del trabajo.',
      },
    ],
  },
  // Sin `tenantDomain` (esta página no tiene un tenant real) el bloque no pide datos y no se
  // muestra: es el mismo comportamiento que tendría un sitio sin publicaciones todavía.
  LatestPosts: {
    eyebrow: 'Blog',
    title: 'Últimas publicaciones',
    count: 3,
    variant: 'grid',
  },
  // Sin `storeService` (esta página no tiene una tienda real) el bloque no pide datos y no
  // se muestra: mismo comportamiento que `LatestPosts` sin `blogService`.
  FeaturedProducts: {
    eyebrow: 'Tienda',
    title: 'Productos destacados',
    limit: 4,
  },
};

function SampleRow(): ReactElement {
  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-6 px-6 py-10">
      <Button>Botón de ejemplo</Button>
      <Input placeholder="Campo de ejemplo" className="max-w-xs" />
      <div className="ui-card max-w-xs flex-1 p-6">
        <p className="text-sm">Tarjeta de ejemplo con el estilo activo.</p>
      </div>
    </div>
  );
}

export default function StyleguidePage(): ReactElement {
  return (
    <>
      <VisualStyleTokens styleId="classic" />
      {VISUAL_STYLES.map((style) => (
        <section
          key={style.id}
          data-visual-style={style.id}
          data-backdrop="local"
          className="ui-page-backdrop border-b"
        >
          <header className="mx-auto max-w-5xl px-6 pt-10">
            <h2 className="text-2xl font-bold">{style.label}</h2>
            <p className="text-muted-foreground mt-1">{style.description}</p>
          </header>
          <SampleRow />
          {Object.entries(COMPONENT_MAP).map(([type, Component]) => (
            <Component key={type} sectionProps={SAMPLE_PROPS[type] ?? {}} />
          ))}
        </section>
      ))}
    </>
  );
}
