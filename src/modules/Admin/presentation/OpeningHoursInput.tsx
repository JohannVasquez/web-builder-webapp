'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export interface OpeningHoursSlot {
  open: string;
  close: string;
}

export interface OpeningHoursDay {
  isOpen: boolean;
  slots?: OpeningHoursSlot[];
}

export interface OpeningHoursData {
  monday: OpeningHoursDay;
  tuesday: OpeningHoursDay;
  wednesday: OpeningHoursDay;
  thursday: OpeningHoursDay;
  friday: OpeningHoursDay;
  saturday: OpeningHoursDay;
  sunday: OpeningHoursDay;
}

const DAYS_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayKey = (typeof DAYS_ORDER)[number];

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DEFAULT_SLOT: OpeningHoursSlot = { open: '09:00', close: '18:00' };
const DEFAULT_DAY: OpeningHoursDay = { isOpen: false };

const DEFAULT_SCHEDULE: OpeningHoursData = {
  monday: { ...DEFAULT_DAY },
  tuesday: { ...DEFAULT_DAY },
  wednesday: { ...DEFAULT_DAY },
  thursday: { ...DEFAULT_DAY },
  friday: { ...DEFAULT_DAY },
  saturday: { ...DEFAULT_DAY },
  sunday: { ...DEFAULT_DAY },
};

interface Props {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export function OpeningHoursInput({ value, onChange }: Props): ReactElement {
  const [schedule, setSchedule] = useState<OpeningHoursData>(() => {
    if (!value) return DEFAULT_SCHEDULE;
    try {
      const parsed = JSON.parse(value) as unknown as Partial<OpeningHoursData>;
      // Basic fallback
      return { ...DEFAULT_SCHEDULE, ...parsed };
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  // Call onChange only when schedule changes (after initial mount)
  useEffect(() => {
    // Avoid re-triggering if value matches stringified schedule to prevent loops
    const currentStr = JSON.stringify(schedule);
    if (value !== currentStr) {
      onChange(currentStr);
    }
  }, [schedule, onChange, value]);

  const updateDay = (day: DayKey, changes: Partial<OpeningHoursDay>): void => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...changes },
    }));
  };

  const toggleDay = (day: DayKey): void => {
    const isCurrentlyOpen = schedule[day].isOpen;
    if (isCurrentlyOpen) {
      updateDay(day, { isOpen: false, slots: undefined });
    } else {
      updateDay(day, { isOpen: true, slots: [{ ...DEFAULT_SLOT }] });
    }
  };

  const addSlot = (day: DayKey): void => {
    const slots = schedule[day].slots ?? [];
    updateDay(day, { slots: [...slots, { ...DEFAULT_SLOT }] });
  };

  const updateSlot = (day: DayKey, index: number, field: keyof OpeningHoursSlot, val: string): void => {
    const slots = [...(schedule[day].slots ?? [])];
    if (slots[index]) {
      slots[index] = { ...slots[index], [field]: val };
      updateDay(day, { slots });
    }
  };

  const removeSlot = (day: DayKey, index: number): void => {
    const slots = [...(schedule[day].slots ?? [])];
    slots.splice(index, 1);
    updateDay(day, { slots });
  };

  return (
    <div className="flex flex-col gap-4 border rounded-md p-4 bg-muted/20">
      {DAYS_ORDER.map((day) => {
        const dayData = schedule[day];
        return (
          <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 py-3 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-3 w-40 shrink-0 mt-1">
              <input
                type="checkbox"
                id={`day-toggle-${day}`}
                checked={dayData.isOpen}
                onChange={() => toggleDay(day)}
                className="size-4 shrink-0 rounded-sm border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Label htmlFor={`day-toggle-${day}`} className="cursor-pointer font-medium">
                {DAY_LABELS[day]}
              </Label>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              {!dayData.isOpen && (
                <span className="text-sm text-muted-foreground mt-1">Cerrado</span>
              )}
              {dayData.isOpen && dayData.slots && dayData.slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={slot.open}
                    onChange={(e) => updateSlot(day, index, 'open', e.target.value)}
                    className="w-32"
                    aria-label={`Apertura ${DAY_LABELS[day]} tramo ${index + 1}`}
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="time"
                    value={slot.close}
                    onChange={(e) => updateSlot(day, index, 'close', e.target.value)}
                    className="w-32"
                    aria-label={`Cierre ${DAY_LABELS[day]} tramo ${index + 1}`}
                  />
                  {dayData.slots!.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(day, index)}
                      title="Eliminar tramo"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {dayData.isOpen && (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => addSlot(day)}
                  >
                    <Plus className="size-3 mr-1" /> Agregar tramo
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
