import type { ComponentType } from 'react';
import type { SectionComponentProps } from './SectionComponentProps';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { CallToAction } from './sections/CallToAction';
import { TextBlock } from './sections/TextBlock';
import { ContactFormSection } from './sections/ContactFormSection';
import { Stats } from './sections/Stats';
import { ServiceCards } from './sections/ServiceCards';
import { SplitHighlights } from './sections/SplitHighlights';
import { Testimonials } from './sections/Testimonials';
import { LocationMap } from './sections/LocationMap';
import { Columns } from './sections/Columns';
import { Faq } from './sections/Faq';
import { Pricing } from './sections/Pricing';
import { Gallery } from './sections/Gallery';
import { LogoCloud } from './sections/LogoCloud';
import { Team } from './sections/Team';
import { Timeline } from './sections/Timeline';
import { VideoBlock } from './sections/VideoBlock';
import { AnnouncementBar } from './sections/AnnouncementBar';
import { BeforeAfter } from './sections/BeforeAfter';
import { OpeningHours } from './sections/OpeningHours';
import { Newsletter } from './sections/Newsletter';
import { GoogleReviews } from './sections/GoogleReviews';
import { LatestPosts } from './sections/LatestPosts';
import { FeaturedProducts } from './sections/FeaturedProducts';

export type SectionComponent = ComponentType<SectionComponentProps>;

// Diccionario de componentes: traduce el `type` que dicta la base de datos al bloque de
// React que lo renderiza. Agregar un bloque es una línea aquí y otra en `blockCatalog.ts`;
// el catálogo que ven los agentes cruza ambos y avisa si uno se olvidó.
export const COMPONENT_MAP: Readonly<Record<string, SectionComponent>> = {
  Hero,
  Features,
  CallToAction,
  TextBlock,
  ContactForm: ContactFormSection,
  Stats,
  ServiceCards,
  SplitHighlights,
  Testimonials,
  LocationMap,
  Columns,
  Faq,
  Pricing,
  Gallery,
  LogoCloud,
  Team,
  Timeline,
  Video: VideoBlock,
  AnnouncementBar,
  BeforeAfter,
  OpeningHours,
  Newsletter,
  GoogleReviews,
  LatestPosts,
  FeaturedProducts,
};

export const resolveSectionComponent = (type: string): SectionComponent | undefined => {
  return COMPONENT_MAP[type];
};
