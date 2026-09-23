import { stages, type UserState } from './types';
import { isBuyBox } from './buy-box';
export const storageKey = 'property-os:user:v1';
export const initialState: UserState = {
  version: 1,
  stages: {
    smith: 'Researching',
    jones: 'Watching',
    ferry: 'Watching',
    lake: 'Watching',
    wattle: 'Inspect',
    park: 'Researching',
  },
  events: [],
  notes: {},
  checks: {},
  preferences: { name: 'Zane', minPrice: 600000, maxPrice: 850000, minYield: 4.5 },
};
export function isUserState(value: unknown): value is UserState {
  if (!value || typeof value !== 'object') return false;
  const s = value as UserState;
  const record = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  return (
    s.version === 1 &&
    record(s.stages) &&
    Object.values(s.stages).every((v) => stages.includes(v)) &&
    record(s.notes) &&
    Object.values(s.notes).every((v) => typeof v === 'string') &&
    record(s.checks) &&
    Object.values(s.checks).every((v) => typeof v === 'boolean') &&
    Array.isArray(s.events) &&
    s.events.every(
      (e) =>
        e &&
        typeof e.id === 'string' &&
        typeof e.propertyId === 'string' &&
        typeof e.text === 'string' &&
        typeof e.at === 'string' &&
        Number.isFinite(Date.parse(e.at)) &&
        ['market', 'stage', 'note'].includes(e.kind),
    ) &&
    record(s.preferences) &&
    typeof s.preferences.name === 'string' &&
    [s.preferences.minPrice, s.preferences.maxPrice, s.preferences.minYield].every(
      (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    ) &&
    s.preferences.minPrice <= s.preferences.maxPrice &&
    s.preferences.minYield <= 100 &&
    (s.preferences.buyBox === undefined || isBuyBox(s.preferences.buyBox))
  );
}
