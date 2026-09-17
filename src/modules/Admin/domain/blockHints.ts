// Ayuda para el editor de `props` en JSON (Pantalla 2): qué campos acepta cada tipo de
// bloque. Escrito a mano leyendo el `z.object({...})` de cada componente en
// `src/modules/Page/presentation/sections/`. No es una validación, solo texto de ayuda.

// Casi todos los bloques mezclan estos dos grupos de props opcionales además de los suyos.
const BACKGROUND_HINT =
  'backgroundColor (color CSS), backgroundImageUrl (URL de imagen), backgroundOverlayColor (color del velo sobre la imagen)';
const LAYOUT_HINT =
  'paddingY ("compact"/"normal"/"spacious"), contentWidth ("tight"/"narrow"/"medium"/"normal"/"wide"/"full"), textAlign ("left"/"center"/"right"), animation ("none"/"fade"/"slide"), hideOn (null, "mobile" o "desktop")';

export const BLOCK_PROPS_HINTS: Readonly<Record<string, string>> = {
  Hero:
    'eyebrow (texto sobre el título), title, titleAccent (segunda línea destacada), subtitle, ' +
    'ctaLabel/ctaHref (botón principal), secondaryCtaLabel/secondaryCtaHref (botón secundario), ' +
    'imageUrl o images (arreglo de URLs, rotan como carrusel), overlayColor, textColor, accentColor. ' +
    `También: ${LAYOUT_HINT}.`,
  Features:
    'eyebrow, title, accentColor, variant ("card" o "plain"), items (arreglo de {icon, imageUrl, title, description}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  CallToAction:
    'title, subtitle, buttonLabel, buttonHref, textColor. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  TextBlock:
    'title, content (texto principal), imageUrl, imageAlt. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  ContactForm:
    'title, subtitle, accentColor, channels (arreglo de canales de contacto: teléfono, WhatsApp, email, horario). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Stats:
    'title, textColor, accentColor, items (arreglo de {value, label}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  ServiceCards:
    'title, subtitle, accentColor, viewAllLabel/viewAllHref, ' +
    'items (arreglo de {icon, title, description, checklist (arreglo de textos), linkLabel, linkHref}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  SplitHighlights:
    'eyebrow, title, accentColor, imageUrl, imageAlt, imagePosition ("left" o "right"), ' +
    'items (arreglo de {icon, title, description}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Testimonials:
    'title, accentColor, items (arreglo de {badgeLabel, quote, rating (1 a 5), authorName, authorLocation}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  LocationMap:
    'title, subtitle, accentColor, address, lat, lng, mapLabel (texto del enlace a Google Maps). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Columns:
    'title, subtitle, accentColor, columns (1 a 4 elementos: {imageUrl, imageAlt, eyebrow, title, content}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Faq:
    'eyebrow, title, variant ("accordion" o "list"), items (arreglo de {question, answer}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Pricing:
    'eyebrow, title, subtitle, variant ("cards" o "table"), showBillingToggle (booleano), ' +
    'plans (arreglo de {name, description, priceMonthly, priceYearly, currency, features: string[], ctaLabel, ctaHref, featured}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Gallery:
    'eyebrow, title, variant ("grid" o "masonry"), images (arreglo de {url, alt, caption}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  LogoCloud:
    'eyebrow, title, variant ("row" o "marquee"), logos (arreglo de {url, alt, href}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Team:
    'eyebrow, title, accentColor, variant ("grid" o "list"), ' +
    'members (arreglo de {name, role, photoUrl, bio, socials: [{label, url}]}). Sin foto se muestran las iniciales. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Timeline:
    'eyebrow, title, accentColor, variant ("vertical" u "horizontal"), ' +
    'steps (arreglo de {label, title, description, date}). Sin date, los pasos se numeran. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Video:
    'eyebrow, title, videoUrl (YouTube, Vimeo o archivo propio), posterUrl, caption, ' +
    'variant ("contained" o "full"). El reproductor se inserta recién al pulsar play. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  AnnouncementBar:
    'message, linkLabel, linkHref, dismissible (booleano), id (para distinguir un anuncio de otro), ' +
    'accentColor, variant ("top" o "inline"). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  BeforeAfter:
    'eyebrow, title, beforeUrl, afterUrl, beforeLabel, afterLabel, caption, ' +
    'variant ("slider" o "sideBySide"). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  OpeningHours:
    'eyebrow, title, timezone (por defecto "America/Santiago"), variant ("list" o "compact"), ' +
    'days (arreglo de {day, open, close, closed, note}), holidays (arreglo de {date, note}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Newsletter:
    'eyebrow, title, subtitle, buttonLabel, successMessage, variant ("inline" o "card"). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  GoogleReviews:
    'eyebrow, title, rating (0 a 5), reviewCount, profileUrl, variant ("summary" o "cards"), ' +
    'reviews (arreglo de {author, rating, text, date, avatarUrl}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  LatestPosts:
    'eyebrow, title, count (cuántas publicaciones traer, 3 por defecto), tag (filtra por etiqueta), ' +
    'variant ("grid" o "list"). Trae las publicaciones del blog del propio sitio; sin ninguna, el bloque no se muestra. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  FeaturedProducts:
    'eyebrow, title, limit (cuántos productos traer, 4 por defecto). ' +
    'Trae los productos destacados de la tienda del propio sitio; sin ninguno (o sin tienda), el bloque no se muestra. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
};

export const blockPropsHint = (type: string): string =>
  BLOCK_PROPS_HINTS[type] ?? 'Este tipo de bloque no tiene ayuda de props registrada.';
