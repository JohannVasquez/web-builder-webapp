'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  allows,
  needsDecision,
  OPTIONAL_PURPOSES,
  type ConsentDecision,
  type ConsentPurpose,
} from '../domain/Consent';
import {
  clearCookiesFor,
  getDecisionSnapshot,
  getServerDecisionSnapshot,
  publishDecision,
  readOrCreateSubject,
  subscribeToDecision,
} from '../application/consentStorage';
import { ConsentService, type ConsentSource } from '../application/ConsentService';
import { getPublicApiBaseUrl } from '@/shared/config/api';

interface ConsentContextValue {
  readonly decision: ConsentDecision | null;
  readonly allows: (purpose: ConsentPurpose) => boolean;
  // Verdadero mientras no haya una decisión sobre el texto vigente.
  readonly shouldAsk: boolean;
  // El aviso se puede volver a abrir desde el pie: la decisión no es para siempre.
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly decide: (decision: ConsentDecision, source?: ConsentSource) => void;
  // Para que un formulario registre su propio consentimiento con el mismo identificador.
  readonly recordFor: (decision: ConsentDecision, source: ConsentSource) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

// En el servidor no existe: lo que decide qué se carga es la decisión guardada en el
// navegador, y antes de hidratar todavía no se conoce.
const subscribeToHydration = (): (() => void) => () => undefined;
const hydratedOnClient = (): boolean => true;
const notHydratedOnServer = (): boolean => false;

export function ConsentProvider({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  const decision = useSyncExternalStore(
    subscribeToDecision,
    getDecisionSnapshot,
    getServerDecisionSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    hydratedOnClient,
    notHydratedOnServer,
  );
  const [isOpen, setIsOpen] = useState(false);

  const service = useMemo(() => new ConsentService(getPublicApiBaseUrl()), []);

  const recordFor = useCallback(
    (next: ConsentDecision, source: ConsentSource) => {
      void service.record(next, readOrCreateSubject(), source);
    },
    [service],
  );

  const decide = useCallback(
    (next: ConsentDecision, source: ConsentSource = 'cookies') => {
      publishDecision(next);
      setIsOpen(false);

      // Dejar de cargar el script no quita lo que ya quedó puesto: una cookie de medición que
      // sobrevive al rechazo es exactamente lo que se estaba rechazando.
      clearCookiesFor(
        OPTIONAL_PURPOSES.filter((purpose) => !next.purposes.includes(purpose)),
      );

      recordFor(next, source);
    },
    [recordFor],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      decision,
      allows: (purpose) => allows(decision, purpose),
      // Antes de hidratar no se pregunta: evita que el aviso parpadee en cada carga para
      // quien ya decidió.
      shouldAsk: hydrated && needsDecision(decision),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      decide,
      recordFor,
    }),
    [decision, hydrated, isOpen, decide, recordFor],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const value = useContext(ConsentContext);
  if (value === null) {
    throw new Error('useConsent necesita estar dentro de <ConsentProvider>');
  }
  return value;
}
