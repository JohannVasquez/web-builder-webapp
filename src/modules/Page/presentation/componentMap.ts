import type { ComponentType } from 'react';
import type { SectionComponentProps } from './SectionComponentProps';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { CallToAction } from './sections/CallToAction';
import { TextBlock } from './sections/TextBlock';
import { ContactFormSection } from './sections/ContactFormSection';

export type SectionComponent = ComponentType<SectionComponentProps>;

/**
 * Diccionario de componentes: traduce el `type` que dicta la base de datos
 * al bloque visual de React que lo renderiza (AC1.3).
 */
export const COMPONENT_MAP: Readonly<Record<string, SectionComponent>> = {
  Hero,
  Features,
  CallToAction,
  TextBlock,
  ContactForm: ContactFormSection,
};

export const resolveSectionComponent = (type: string): SectionComponent | undefined => {
  return COMPONENT_MAP[type];
};
