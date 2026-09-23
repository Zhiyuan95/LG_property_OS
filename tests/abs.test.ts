import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAbs } from '../src/lib/abs-parser';
import { requireLocalMutation, readSmallJson } from '../src/lib/local-api';
function fixture() {
  return {
    meta: { test: true },
    data: {
      structures: [
        {
          name: 'Transfer data',
          dimensions: {
            observation: [
              {
                id: 'MEASURE',
                values: [{ id: '3', name: 'Median Price of Established House Transfers' }],
              },
              { id: 'REGION', values: [{ id: '3GBRI', name: 'Greater Brisbane' }] },
              { id: 'FREQ', values: [{ id: 'Q', name: 'Quarterly' }] },
              {
                id: 'TIME_PERIOD',
                values: [
                  { id: '2026-Q2', name: '2026-Q2' },
                  { id: '2026-Q1', name: '2026-Q1' },
                ],
              },
            ],
          },
          attributes: {
            observation: [
              { id: 'UNIT_MEASURE', values: [{ id: 'AUD', name: 'Australian Dollars' }] },
              { id: 'UNIT_MULT', values: [{ id: '3', name: 'Thousands' }] },
              { id: 'OBS_STATUS', values: [{ id: 'p', name: 'preliminary' }] },
            ],
          },
          annotations: [{ type: 'NonProductionDataflow', text: 'true' }],
        },
      ],
      dataSets: [{ observations: { '0:0:0:0': [1155, 0, 0, 0], '0:0:0:1': [1160, 0, 0, null] } }],
    },
  };
}
test('ABS unit multiplier and period ordering come from metadata', () => {
  const parsed = parseAbs(fixture(), '2026-09-23T00:00:00Z');
  assert.equal(parsed.observations[0].value, 1155000);
  assert.equal(parsed.latestPeriod, '2026-Q2');
  assert.equal(parsed.observations[0].status, 'preliminary');
  assert.ok(parsed.warnings.some((w) => w.includes('meta.test=true')));
  assert.ok(parsed.warnings.some((w) => w.includes('NonProductionDataflow')));
});
test('ABS missing value stays null, never becomes zero', () => {
  const j = fixture();
  j.data.dataSets[0].observations['0:0:0:0'][0] = null as unknown as number;
  assert.equal(parseAbs(j, '2026-09-23T00:00:00Z').observations[0].value, null);
});
test('ABS malformed units and dimensions fail closed', () => {
  const j = fixture();
  j.data.structures[0].attributes.observation[0].values[0].id = 'PERCENT';
  assert.throws(() => parseAbs(j, '2026-09-23'));
  const k = fixture();
  k.data.structures[0].dimensions.observation[0].id = 'CHANGED';
  assert.throws(() => parseAbs(k, '2026-09-23'));
});
test('only same-origin loopback JSON mutations are accepted', () => {
  const request = (origin: string, url = 'http://127.0.0.1:3002/api/research') =>
    new Request(url, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: '{}',
    });
  assert.doesNotThrow(() => requireLocalMutation(request('http://127.0.0.1:3002')));
  assert.throws(() => requireLocalMutation(request('https://evil.example')));
  assert.throws(() =>
    requireLocalMutation(request('http://public.example', 'http://public.example/api/research')),
  );
});
test('request size is bounded before parsing', async () => {
  const r = new Request('http://localhost', { method: 'POST', body: 'x'.repeat(50) });
  await assert.rejects(() => readSmallJson(r, 10));
});
test('Next normalized URL accepts only matching loopback Host and Origin', () => {
  const request = new Request('http://localhost:3002/api/research', {
    method: 'POST',
    headers: {
      Host: '127.0.0.1:3002',
      Origin: 'http://127.0.0.1:3002',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  assert.doesNotThrow(() => requireLocalMutation(request));
  const wrong = new Request(request, {
    headers: {
      Host: '127.0.0.1:3002',
      Origin: 'http://127.0.0.1:3000',
      'Content-Type': 'application/json',
    },
  });
  assert.throws(() => requireLocalMutation(wrong));
});
