#!/bin/bash
sed -i '' 's/const parsed = JSON.parse(value);/const parsed = JSON.parse(value) as unknown as Partial<OpeningHoursData>;/' src/modules/Admin/presentation/OpeningHoursInput.tsx
sed -i '' 's/const putCallArgs = mockPut.mock.calls\[0\]\[1\] as { openingHours: string };/const putCallArgs = (mockPut.mock.calls[0] as unknown[])[1] as { openingHours: string };/' src/modules/Admin/presentation/BusinessSettingsForm.spec.tsx
