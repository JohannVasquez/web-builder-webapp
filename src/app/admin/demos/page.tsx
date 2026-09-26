import type { ReactElement } from 'react';
import { connection } from 'next/server';
import { DemoManager } from '@/modules/Admin/presentation/DemoManager';
import { getPlatformDomain } from '@/shared/config/demo';

export default async function DemosPage(): Promise<ReactElement> {
  // `PLATFORM_DOMAIN` se lee al pedir la página y no al compilar: cada despliegue tiene el suyo.
  await connection();
  return <DemoManager platformDomain={getPlatformDomain()} />;
}
