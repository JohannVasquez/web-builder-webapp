#!/bin/bash
sed -i '' '/import type { AdminApiClient }/d' src/modules/Admin/presentation/BusinessSettingsForm.spec.tsx
sed -i '' 's/const hours = JSON.parse(putCallArgs.openingHours) as Record<string, any>;/const hours = JSON.parse(putCallArgs.openingHours) as Record<string, { isOpen: boolean, slots: Array<{ open: string, close: string }> }>;/' src/modules/Admin/presentation/BusinessSettingsForm.spec.tsx
sed -i '' 's/eslint-disable-next-line @typescript-eslint\/no-unsafe-assignment//g' src/modules/Admin/presentation/BusinessSettingsForm.spec.tsx

sed -i '' 's/const parsed = JSON.parse(value) as Partial<OpeningHoursData>;/const parsed = JSON.parse(value);/' src/modules/Admin/presentation/OpeningHoursInput.tsx
