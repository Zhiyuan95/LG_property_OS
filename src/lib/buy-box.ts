import {
  propertyTypes,
  stateCodes,
  type BuyBox,
  type Preferences,
  type Property,
  type Suburb,
} from './types';
import { grossYield } from './finance';

export const defaultBuyBox: BuyBox = {
  propertyTypes: [],
  states: [],
  suburbs: '',
  minBeds: 0,
  maxBeds: null,
  minBaths: 0,
  minCarSpaces: 0,
  minGarageSpaces: 0,
  minLand: 0,
  maxLand: null,
  excludeUnderOffer: true,
};
export function isBuyBox(value: unknown): value is BuyBox {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const b = value as BuyBox;
  const nonnegative = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  return (
    Array.isArray(b.propertyTypes) &&
    b.propertyTypes.every((t) => propertyTypes.includes(t)) &&
    Array.isArray(b.states) &&
    b.states.every((s) => stateCodes.includes(s)) &&
    typeof b.suburbs === 'string' &&
    b.suburbs.length <= 500 &&
    [b.minBeds, b.minBaths, b.minCarSpaces, b.minGarageSpaces].every(
      (n) => nonnegative(n) && Number.isInteger(n) && n <= 30,
    ) &&
    (b.maxBeds === null ||
      (nonnegative(b.maxBeds) &&
        Number.isInteger(b.maxBeds) &&
        b.maxBeds <= 30 &&
        b.maxBeds >= b.minBeds)) &&
    nonnegative(b.minLand) &&
    (b.maxLand === null || (nonnegative(b.maxLand) && b.maxLand >= b.minLand)) &&
    typeof b.excludeUnderOffer === 'boolean'
  );
}
/** Unknown attributes never satisfy an active constraint. No guessed bathrooms, rent or parking. */
export function matchesBuyBox(p: Property, s: Suburb, pref: Preferences): boolean {
  const b = pref.buyBox ?? defaultBuyBox;
  const locations = b.suburbs
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const atLeast = (value: number | undefined, minimum: number) =>
    minimum === 0 || (value !== undefined && value >= minimum);
  return (
    p.price >= pref.minPrice &&
    p.price <= pref.maxPrice &&
    (pref.minYield === 0 ||
      (p.price > 0 && p.rent > 0 && grossYield(p.price, p.rent) >= pref.minYield)) &&
    (!b.propertyTypes.length ||
      (p.propertyType !== undefined && b.propertyTypes.includes(p.propertyType))) &&
    (!b.states.length || b.states.includes(s.state)) &&
    (!locations.length ||
      locations.includes(s.name.toLowerCase()) ||
      locations.includes(s.postcode)) &&
    p.beds >= b.minBeds &&
    (b.maxBeds === null || p.beds <= b.maxBeds) &&
    atLeast(p.baths, b.minBaths) &&
    atLeast(p.carSpaces, b.minCarSpaces) &&
    atLeast(p.garageSpaces, b.minGarageSpaces) &&
    p.land >= b.minLand &&
    (b.maxLand === null || p.land <= b.maxLand) &&
    (!b.excludeUnderOffer || p.status === 'For sale')
  );
}
export function describeBuyBox(pref: Preferences): string {
  const b = pref.buyBox ?? defaultBuyBox;
  return [
    'For sale',
    b.propertyTypes.join(', ') || 'All property types',
    b.states.join(', ') || 'All states',
    b.suburbs || 'All suburbs',
    `AUD ${pref.minPrice.toLocaleString('en-AU')}–${pref.maxPrice.toLocaleString('en-AU')}`,
    `Bedrooms ${b.minBeds}–${b.maxBeds ?? 'any'}`,
    `Bathrooms ${b.minBaths}+`,
    `Parking spaces ${b.minCarSpaces}+`,
    `Enclosed garage spaces ${b.minGarageSpaces}+`,
    `Land ${b.minLand}–${b.maxLand ?? 'any'} m²`,
    `Gross yield ${pref.minYield}%+`,
    b.excludeUnderOffer ? 'Exclude under offer' : 'Include under offer',
  ].join(' · ');
}
