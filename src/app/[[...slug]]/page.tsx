import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { SectionRenderer } from '@/modules/Page/presentation/SectionRenderer';

interface DynamicPageProps {
  readonly params: Promise<{ slug?: string[] }>;
}

const HOME_SLUG = 'home';

const resolveSlug = (segments: string[] | undefined): string => {
  if (segments === undefined || segments.length === 0) {
    return HOME_SLUG;
  }
  return segments.join('/');
};

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await createPageService().getPage(resolveSlug(slug));
  if (page === null) {
    return { title: 'Página no encontrada' };
  }
  return {
    title: page.title,
    description: page.description,
  };
}

export default async function DynamicPage({
  params,
}: DynamicPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const page = await createPageService().getPage(resolveSlug(slug));

  if (page === null) {
    notFound();
  }

  return <SectionRenderer sections={page.sections} />;
}
