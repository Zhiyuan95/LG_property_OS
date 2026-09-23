import 'server-only';
import { dataset } from './mock';
import type { Dataset, Property, Suburb } from './types';
/** Server-only boundary. Future adapters normalize licensed provider records here. */
export interface PropertyRepository {
  snapshot(): Promise<Dataset>;
  property(id: string): Promise<Property | undefined>;
  suburb(id: string): Promise<Suburb | undefined>;
}
class MockRepository implements PropertyRepository {
  async snapshot() {
    return structuredClone(dataset);
  }
  async property(id: string) {
    return dataset.properties.find((p) => p.id === id);
  }
  async suburb(id: string) {
    return dataset.suburbs.find((s) => s.id === id);
  }
}
export function getRepository(): PropertyRepository {
  const provider = process.env.PROPERTY_DATA_PROVIDER ?? 'mock';
  if (provider !== 'mock') throw new Error(`Provider '${provider}' is not implemented. Use mock.`);
  return new MockRepository();
}
