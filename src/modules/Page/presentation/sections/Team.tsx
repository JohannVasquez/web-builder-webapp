import type { ComponentType, ReactElement } from 'react';
import { z } from 'zod';
import { Link as LinkIcon } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { imageLoading } from '@/shared/lib/imageLoading';
import { HEADING_TAGS, subHeadingLevel } from '@/shared/lib/heading';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const TEAM_VARIANTS = ['grid', 'list'] as const;

const TEAM_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof TEAM_VARIANTS)[number], SectionLayoutDefaults>
> = {
  grid: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  list: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
};

const TeamPropsSchema = z.object({
  // Línea corta sobre el título (ej. "Nuestro equipo").
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // Color CSS del avatar cuando no hay foto y de los acentos del bloque.
  accentColor: z.string().optional(),
  // `grid` (default, tarjetas) o `list` (una fila por persona, foto a la izquierda).
  variant: z.enum(TEAM_VARIANTS).default('grid').catch('grid'),
  members: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        photoUrl: z.string().optional(),
        bio: z.string().optional(),
        socials: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      }),
    )
    .default([]),
});

type TeamMember = z.infer<typeof TeamPropsSchema>['members'][number];

// Ícono por red conocida; una red sin ícono propio cae al genérico de enlace.
const SOCIAL_ICONS: Readonly<Record<string, ComponentType<{ className?: string }>>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitter: FaXTwitter,
};

function socialIconFor(label: string): ComponentType<{ className?: string }> {
  return SOCIAL_ICONS[label.trim().toLowerCase()] ?? LinkIcon;
}

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function Avatar({
  member,
  accent,
  size,
}: {
  readonly member: TeamMember;
  readonly accent: string;
  readonly size: string;
}): ReactElement {
  if (member.photoUrl !== undefined) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
      <img
        src={member.photoUrl}
        alt={member.name}
        className={cn(size, 'shrink-0 rounded-full object-cover')}
        {...imageLoading()}
      />
    );
  }
  return (
    <div
      className={cn(
        size,
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
      )}
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      {initialsOf(member.name)}
    </div>
  );
}

function SocialRow({
  socials,
  justify,
}: {
  readonly socials: readonly { label: string; url: string }[];
  readonly justify: string;
}): ReactElement | null {
  if (socials.length === 0) {
    return null;
  }
  return (
    <div className={cn('mt-3 flex flex-wrap gap-3', justify)}>
      {socials.map((social) => {
        const Icon = socialIconFor(social.label);
        return (
          <a
            key={`${social.label}-${social.url}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </div>
  );
}

export function Team({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
  const SubHeading = HEADING_TAGS[subHeadingLevel(headingLevel)];
  const parsed = TeamPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, members, accentColor, variant } = parsed.data;
  if (members.length === 0) {
    return null;
  }

  const accent = accentColor ?? 'var(--brand-accent)';
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, TEAM_LAYOUT_DEFAULTS[variant]);

  const header = (eyebrow !== undefined || title !== '') && (
    <div className={cn('mb-12', variant === 'grid' && 'text-center')}>
      {eyebrow !== undefined && (
        <p
          className={cn(
            'mb-2 text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      {title !== '' && (
        <Heading
          className={cn(
            'ui-heading text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </Heading>
      )}
    </div>
  );

  if (variant === 'list') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="flex flex-col gap-8">
            {members.map((member) => (
              <div key={member.name} className="flex items-start gap-5 text-left">
                <Avatar member={member} accent={accent} size="size-16 text-lg" />
                <div>
                  <SubHeading
                    className={cn(
                      'text-lg font-semibold',
                      hasBackgroundImage && 'text-white',
                    )}
                  >
                    {member.name}
                  </SubHeading>
                  <p
                    className={cn(
                      'text-sm',
                      hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                    )}
                  >
                    {member.role}
                  </p>
                  {member.bio !== undefined && (
                    <p
                      className={cn(
                        'mt-2 text-sm leading-relaxed',
                        hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                      )}
                    >
                      {member.bio}
                    </p>
                  )}
                  <SocialRow socials={member.socials} justify="justify-start" />
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {header}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.name}
              className="ui-card flex flex-col items-center gap-3 p-8 text-center"
            >
              <Avatar member={member} accent={accent} size="size-20 text-lg" />
              <div>
                <SubHeading className="text-lg font-semibold">{member.name}</SubHeading>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
              {member.bio !== undefined && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.bio}
                </p>
              )}
              <SocialRow socials={member.socials} justify="justify-center" />
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
