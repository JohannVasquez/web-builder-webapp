#!/bin/bash
sed -i '' 's/eslint-disable-next-line @typescript-eslint\/no-unsafe-member-access//g' src/modules/Admin/presentation/BusinessSettingsForm.spec.tsx
