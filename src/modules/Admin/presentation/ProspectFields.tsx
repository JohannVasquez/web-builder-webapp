import type { ReactElement } from 'react';
import type { ProspectFormValues, ProspectTextField } from '../application/demoForm';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

interface FieldDefinition {
  readonly field: Exclude<ProspectTextField, 'notes'>;
  readonly label: string;
  readonly placeholder: string;
  readonly type: 'text' | 'tel' | 'email';
  readonly autoComplete: string;
}

const FIELDS: readonly FieldDefinition[] = [
  {
    field: 'businessName',
    label: 'Negocio',
    placeholder: 'Pastelería Luna',
    type: 'text',
    autoComplete: 'organization',
  },
  {
    field: 'contactName',
    label: 'Contacto (opcional)',
    placeholder: 'Luna Pérez',
    type: 'text',
    autoComplete: 'off',
  },
  {
    field: 'phone',
    label: 'Teléfono (opcional)',
    placeholder: '+56 9 1234 5678',
    type: 'tel',
    autoComplete: 'off',
  },
  {
    field: 'email',
    label: 'Correo (opcional)',
    placeholder: 'luna@ejemplo.cl',
    type: 'email',
    autoComplete: 'off',
  },
  {
    field: 'industry',
    label: 'Rubro (opcional)',
    placeholder: 'Pastelería',
    type: 'text',
    autoComplete: 'off',
  },
  {
    field: 'source',
    label: 'Origen (opcional)',
    placeholder: 'Google Maps',
    type: 'text',
    autoComplete: 'off',
  },
];

interface ProspectFieldsProps {
  readonly idPrefix: string;
  readonly values: ProspectFormValues;
  readonly invalidField: string | null;
  readonly onChange: (values: ProspectFormValues) => void;
}

// Los mismos campos al crear la demo y en la ficha: el vendedor encuentra cada dato en el
// mismo lugar. El correo solo sirve para el aviso de vencimiento; sin él, el prospecto
// aparece en "Por vencer" para llamarlo.
export function ProspectFields({
  idPrefix,
  values,
  invalidField,
  onChange,
}: ProspectFieldsProps): ReactElement {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((definition) => {
          const id = `${idPrefix}-${definition.field}`;
          return (
            <div key={definition.field} className="space-y-2">
              <Label htmlFor={id}>{definition.label}</Label>
              <Input
                id={id}
                type={definition.type}
                inputMode={
                  definition.type === 'tel'
                    ? 'tel'
                    : definition.type === 'email'
                      ? 'email'
                      : undefined
                }
                autoComplete={definition.autoComplete}
                value={values[definition.field]}
                placeholder={definition.placeholder}
                aria-invalid={invalidField === definition.field}
                required={definition.field === 'businessName'}
                onChange={(event) =>
                  onChange({ ...values, [definition.field]: event.target.value })
                }
              />
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>Notas (opcional)</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          value={values.notes}
          rows={4}
          placeholder="Qué se habló en la llamada, reseñas, cuándo volver a llamar…"
          onChange={(event) => onChange({ ...values, notes: event.target.value })}
        />
      </div>
    </div>
  );
}
