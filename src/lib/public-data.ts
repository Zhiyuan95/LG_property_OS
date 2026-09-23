/** Public DTOs shared by server adapters and client views. Never mix these with demo listings. */
export interface PublicObservation {
  id: string;
  regionId: string;
  region: string;
  measureId: string;
  measure: string;
  period: string;
  value: number | null;
  unit: string;
  status: string | null;
}
export interface PublicSnapshot {
  source: 'ABS';
  dataset: 'RES_DWELL';
  title: string;
  sourceUrl: string;
  fetchedAt: string;
  latestPeriod: string;
  stale: boolean;
  warnings: string[];
  observations: PublicObservation[];
}
export interface ResearchAnswer {
  answer: string;
  openQuestions: string[];
  sources: { id: string; label: string; url: string }[];
  model: string;
  generatedAt: string;
  inputTokens: number | null;
  outputTokens: number | null;
  warnings: string[];
}
export const absDatasetUrl =
  'https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL/1+2+3+4..Q?lastNObservations=8&format=jsondata&dimensionAtObservation=AllDimensions';
export const suburbRegions: Record<string, string> = {
  muirhead: '7GDAR',
  rockingham: '5GPER',
  baldivis: '5GPER',
  southport: '3RQLD',
  redbank: '3GBRI',
  salisbury: '4GADE',
};
export function latestRegionRows(snapshot: PublicSnapshot, regionId?: string) {
  return snapshot.observations.filter(
    (o) => o.period === snapshot.latestPeriod && (!regionId || o.regionId === regionId),
  );
}
