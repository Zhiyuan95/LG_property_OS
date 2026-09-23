export const stages = [
  'Watching',
  'Researching',
  'Inspect',
  'Offer',
  'Rejected',
  'Purchased',
] as const;
export type Stage = (typeof stages)[number];
export type StateCode = 'NT' | 'WA' | 'QLD' | 'SA' | 'VIC' | 'NSW' | 'TAS' | 'ACT';
export interface Provenance {
  source: 'mock';
  asOf: string;
  confidence: 'Illustrative';
}
export interface Suburb {
  id: string;
  name: string;
  state: StateCode;
  postcode: string;
  median: number;
  vacancy: number;
  rentGrowth: number;
  population: number;
  x: number;
  y: number;
}
export interface Property {
  id: string;
  address: string;
  suburbId: string;
  price: number;
  rent: number;
  beds: number;
  propertyType?: PropertyType;
  baths?: number;
  carSpaces?: number;
  garageSpaces?: number;
  land: number;
  score: number;
  days: number;
  status: 'For sale' | 'Under offer';
  why: string[];
  questions: string[];
  provenance: Provenance;
}
export interface TimelineEvent {
  id: string;
  propertyId: string;
  at: string;
  text: string;
  kind: 'market' | 'stage' | 'note';
}
export interface Preferences {
  name: string;
  minPrice: number;
  maxPrice: number;
  minYield: number;
  buyBox?: BuyBox;
}
export const propertyTypes = [
  'House',
  'Apartment / unit',
  'Townhouse',
  'Villa',
  'Duplex',
  'Acreage',
  'Land',
] as const;
export type PropertyType = (typeof propertyTypes)[number];
export const stateCodes: StateCode[] = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
export interface BuyBox {
  propertyTypes: PropertyType[];
  states: StateCode[];
  suburbs: string;
  minBeds: number;
  maxBeds: number | null;
  minBaths: number;
  minCarSpaces: number;
  minGarageSpaces: number;
  minLand: number;
  maxLand: number | null;
  excludeUnderOffer: boolean;
}
export interface UserState {
  version: 1;
  stages: Record<string, Stage>;
  events: TimelineEvent[];
  notes: Record<string, string>;
  checks: Record<string, boolean>;
  preferences: Preferences;
}
export interface Dataset {
  properties: Property[];
  suburbs: Suburb[];
  events: TimelineEvent[];
}
