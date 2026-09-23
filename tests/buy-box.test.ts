import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultBuyBox, isBuyBox, matchesBuyBox } from '../src/lib/buy-box';
import { initialState, isUserState } from '../src/lib/user-state';
import { properties, suburbs } from '../src/lib/mock';
import type { BuyBox, Preferences } from '../src/lib/types';
const property = { ...properties[0], baths: 2, carSpaces: 2, garageSpaces: 1 };
const suburb = suburbs.find((s) => s.id === property.suburbId)!;
const pref = (patch: Partial<BuyBox> = {}): Preferences => ({
  ...initialState.preferences,
  buyBox: { ...defaultBuyBox, ...patch },
});
test('old workspace backups remain valid and new criteria survive JSON round trip', () => {
  assert.equal(isUserState(initialState), true);
  const saved = JSON.parse(
    JSON.stringify({
      ...initialState,
      preferences: pref({ propertyTypes: ['House'], minBaths: 2 }),
    }),
  );
  assert.equal(isUserState(saved), true);
  assert.deepEqual(saved.preferences.buyBox.propertyTypes, ['House']);
  assert.equal(saved.preferences.buyBox.minBaths, 2);
});
test('all active filters are combined, ranges are inclusive, locations are case insensitive', () => {
  assert.equal(
    matchesBuyBox(
      property,
      suburb,
      pref({
        propertyTypes: ['House'],
        states: ['NT'],
        suburbs: 'MUIRHEAD, 4301',
        minBeds: 4,
        maxBeds: 4,
        minBaths: 2,
        minCarSpaces: 2,
        minGarageSpaces: 1,
        minLand: 600,
        maxLand: 600,
      }),
    ),
    true,
  );
  for (const patch of [
    { propertyTypes: ['Apartment / unit'] },
    { states: ['QLD'] },
    { suburbs: '9999' },
    { minBeds: 5 },
    { maxBeds: 3 },
    { minBaths: 3 },
    { minCarSpaces: 3 },
    { minGarageSpaces: 2 },
    { minLand: 601 },
    { maxLand: 599 },
  ] as Partial<BuyBox>[])
    assert.equal(matchesBuyBox(property, suburb, pref(patch)), false, JSON.stringify(patch));
});
test('unknown amenities do not pass active filters and car spaces do not prove a garage', () => {
  assert.equal(matchesBuyBox(properties[0], suburb, pref()), true);
  for (const patch of [{ minBaths: 1 }, { minCarSpaces: 1 }, { minGarageSpaces: 1 }])
    assert.equal(matchesBuyBox(properties[0], suburb, pref(patch)), false);
  assert.equal(
    matchesBuyBox({ ...property, garageSpaces: undefined }, suburb, pref({ minGarageSpaces: 1 })),
    false,
  );
});
test('status and yield gates cannot be bypassed by the new fields', () => {
  assert.equal(matchesBuyBox({ ...property, status: 'Under offer' }, suburb, pref()), false);
  assert.equal(
    matchesBuyBox(
      { ...property, status: 'Under offer' },
      suburb,
      pref({ excludeUnderOffer: false }),
    ),
    true,
  );
  assert.equal(matchesBuyBox({ ...property, rent: 0 }, suburb, pref()), false);
  assert.equal(matchesBuyBox({ ...property, price: 1000000 }, suburb, pref()), false);
});
test('malformed saved criteria fail validation rather than silently widening a search', () => {
  for (const patch of [
    { minBaths: -1 },
    { minBeds: 1.5 },
    { minBeds: 4, maxBeds: 2 },
    { minLand: 600, maxLand: 200 },
    { propertyTypes: ['unknown'] },
    { states: ['XX'] },
    { minCarSpaces: NaN },
    { excludeUnderOffer: 'false' },
  ]) {
    const buyBox = { ...defaultBuyBox, ...patch };
    assert.equal(isBuyBox(buyBox), false);
    assert.equal(
      isUserState({ ...initialState, preferences: { ...initialState.preferences, buyBox } }),
      false,
    );
  }
});
