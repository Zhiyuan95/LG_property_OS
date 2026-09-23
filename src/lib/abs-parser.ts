import { absDatasetUrl, type PublicObservation, type PublicSnapshot } from './public-data';
type Obj = Record<string, unknown>;
function obj(v: unknown): Obj {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Unexpected ABS object');
  return v as Obj;
}
function arr(v: unknown): unknown[] {
  if (!Array.isArray(v)) throw new Error('Unexpected ABS array');
  return v;
}
function str(v: unknown): string {
  if (typeof v !== 'string') throw new Error('Unexpected ABS string');
  return v;
}
/** Flat SDMX-JSON 2.0 observations. Decode by metadata order, never by guessed array indices. */
export function parseAbs(input: unknown, fetchedAt: string): PublicSnapshot {
  const root = obj(input),
    data = obj(root.data),
    structure = obj(arr(data.structures)[0]);
  const dimensions = arr(obj(structure.dimensions).observation).map(obj);
  const attrs = arr(obj(structure.attributes).observation).map(obj);
  const dataset = obj(arr(data.dataSets)[0]);
  const observations: PublicObservation[] = [];
  const seen = new Set<string>();
  for (const [key, raw] of Object.entries(obj(dataset.observations))) {
    const indices = key.split(':').map(Number),
      values = arr(raw);
    if (indices.length !== dimensions.length || indices.some((i) => !Number.isInteger(i) || i < 0))
      throw new Error('Invalid ABS dimension key');
    const dim = (id: string) => {
      const n = dimensions.findIndex((d) => d.id === id);
      if (n < 0) throw new Error('Missing ABS dimension');
      return obj(arr(dimensions[n].values)[indices[n]]);
    };
    const attr = (id: string) => {
      const n = attrs.findIndex((a) => a.id === id);
      if (n < 0) return null;
      const index = values[n + 1];
      if (index === null || index === undefined) return null;
      if (typeof index !== 'number') throw new Error('Invalid attribute index');
      return obj(arr(attrs[n].values)[index]);
    };
    const measure = dim('MEASURE'),
      region = dim('REGION'),
      period = str(dim('TIME_PERIOD').id),
      unit = attr('UNIT_MEASURE'),
      mult = attr('UNIT_MULT'),
      status = attr('OBS_STATUS');
    const measureId = str(measure.id),
      regionId = str(region.id);
    if (!['1', '2', '3', '4'].includes(measureId) || !/^\d{4}-Q[1-4]$/.test(period)) continue;
    const exponent = Number(mult?.id),
      unitId = unit?.id;
    if (
      !mult ||
      !Number.isInteger(exponent) ||
      exponent < 0 ||
      exponent > 9 ||
      !['AUD', 'NUM'].includes(String(unitId))
    )
      throw new Error('Unknown ABS unit');
    if (
      (['3', '4'].includes(measureId) && unitId !== 'AUD') ||
      (['1', '2'].includes(measureId) && unitId !== 'NUM')
    )
      throw new Error('Unexpected measure unit');
    const rawValue = values[0];
    if (
      rawValue !== null &&
      (typeof rawValue !== 'number' || !Number.isFinite(rawValue) || rawValue < 0)
    )
      throw new Error('Invalid ABS observation');
    const value = rawValue === null ? null : (rawValue as number) * 10 ** exponent;
    const id = `RES_DWELL:${regionId}:${measureId}:${period}`;
    if (seen.has(id)) throw new Error('Duplicate ABS observation');
    seen.add(id);
    observations.push({
      id,
      regionId,
      region: str(region.name),
      measureId,
      measure: str(measure.name),
      period,
      value,
      unit: String(unitId),
      status: status ? str(status.name) : null,
    });
  }
  if (!observations.length) throw new Error('ABS returned no observations');
  const warnings = [
    'ABS Data API is a Beta service. Regional transfer medians are not suburb medians, property valuations or a repeat-sales growth index.',
  ];
  const meta = obj(root.meta);
  if (meta.test === true)
    warnings.push(
      'The source response includes meta.test=true. Treat this API snapshot as provisional and cross-check the ABS statistical release.',
    );
  const annotations = Array.isArray(structure.annotations) ? structure.annotations : [];
  if (annotations.some((a) => obj(a).type === 'NonProductionDataflow' && obj(a).text === 'true'))
    warnings.push(
      'The source metadata marks this dataflow as NonProductionDataflow. This flag is retained, not silently removed.',
    );
  return {
    source: 'ABS',
    dataset: 'RES_DWELL',
    title: str(structure.name),
    sourceUrl: absDatasetUrl,
    fetchedAt,
    latestPeriod: observations
      .map((o) => o.period)
      .sort()
      .at(-1)!,
    stale: false,
    warnings,
    observations,
  };
}
