import type { ReactElement } from 'react';
import { connection } from 'next/server';
import { DemoDetail } from '@/modules/Admin/presentation/DemoDetail';
import { getPlatformDomain } from '@/shared/config/demo';

interface DemoDetailPageProps {
  readonly params: Promise<{ demoId: string }>;
}

export default async function DemoDetailPage({
  params,
}: DemoDetailPageProps): Promise<ReactElement> {
  const { demoId } = await params;
  // `PLATFORM_DOMAIN` se lee al pedir la página y no al compilar: cada despliegue tiene el suyo.
  await connection();
  return <DemoDetail demoId={demoId} platformDomain={getPlatformDomain()} />;
}
