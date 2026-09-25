#!/bin/bash
sed -i '' 's/const handleSubmit = async (e: FormEvent) => {/const handleSubmit = async (e: FormEvent): Promise<void> => {/' src/modules/Admin/presentation/BusinessSettingsForm.tsx
sed -i '' 's/const handleSubmit = async (e: FormEvent) => {/const handleSubmit = async (e: FormEvent): Promise<void> => {/' src/modules/Admin/presentation/VisibilitySettingsForm.tsx

sed -i '' 's/const updateField = (key: keyof GlobalSettings, value: string) => {/const updateField = (key: keyof GlobalSettings, value: string): void => {/' src/modules/Admin/presentation/BusinessSettingsForm.tsx
sed -i '' 's/const getError = (key: string) => errorMsg/const getError = (key: string): string | undefined => errorMsg/' src/modules/Admin/presentation/BusinessSettingsForm.tsx
sed -i '' 's/onSubmit={handleSubmit}/onSubmit={(e) => { void handleSubmit(e); }}/' src/modules/Admin/presentation/BusinessSettingsForm.tsx

sed -i '' 's/const updateField = (key: keyof GlobalSettings, value: string | boolean) => {/const updateField = (key: keyof GlobalSettings, value: string | boolean): void => {/' src/modules/Admin/presentation/VisibilitySettingsForm.tsx
sed -i '' 's/const getError = (key: string) => errorMsg/const getError = (key: string): string | undefined => errorMsg/' src/modules/Admin/presentation/VisibilitySettingsForm.tsx
sed -i '' 's/onSubmit={handleSubmit}/onSubmit={(e) => { void handleSubmit(e); }}/' src/modules/Admin/presentation/VisibilitySettingsForm.tsx

sed -i '' 's/const updateDay = (day: DayKey, changes: Partial<OpeningHoursDay>) => {/const updateDay = (day: DayKey, changes: Partial<OpeningHoursDay>): void => {/' src/modules/Admin/presentation/OpeningHoursInput.tsx
sed -i '' 's/const toggleDay = (day: DayKey) => {/const toggleDay = (day: DayKey): void => {/' src/modules/Admin/presentation/OpeningHoursInput.tsx
sed -i '' 's/const addSlot = (day: DayKey) => {/const addSlot = (day: DayKey): void => {/' src/modules/Admin/presentation/OpeningHoursInput.tsx
sed -i '' 's/const updateSlot = (day: DayKey, index: number, field: keyof OpeningHoursSlot, val: string) => {/const updateSlot = (day: DayKey, index: number, field: keyof OpeningHoursSlot, val: string): void => {/' src/modules/Admin/presentation/OpeningHoursInput.tsx
sed -i '' 's/const removeSlot = (day: DayKey, index: number) => {/const removeSlot = (day: DayKey, index: number): void => {/' src/modules/Admin/presentation/OpeningHoursInput.tsx

# Also OpeningHoursInput line 73: `const parsed = JSON.parse(value);` -> `const parsed = JSON.parse(value) as Partial<OpeningHoursData>;`
sed -i '' 's/const parsed = JSON.parse(value);/const parsed = JSON.parse(value) as Partial<OpeningHoursData>;/' src/modules/Admin/presentation/OpeningHoursInput.tsx
