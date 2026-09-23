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
