import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cashflow, grossYield } from '../src/lib/finance';
import { initialState, isUserState } from '../src/lib/user-state';
test('interest-only cashflow deducts vacancy, interest and costs once', () => {
  const r = cashflow({
    price: 720000,
    weeklyRent: 720,
    depositPercent: 20,
    interestRate: 6.2,
    annualCosts: 8500,
    vacancyWeeks: 2,
  });
  assert.equal(r.loan, 576000);
  assert.equal(r.income, 36000);
  assert.equal(r.interest, 35712);
  assert.equal(r.annual, -8212);
  assert.ok(Math.abs(r.weekly + 157.923076923) < 1e-6);
  assert.equal(grossYield(720000, 720), 5.2);
});
test('all cash purchase and zero interest scenarios', () => {
  assert.equal(
    cashflow({
      price: 500000,
      weeklyRent: 500,
      depositPercent: 100,
      interestRate: 6,
      annualCosts: 6000,
      vacancyWeeks: 0,
    }).annual,
    20000,
  );
});
test('reject invalid assumptions', () => {
  for (const patch of [
    { price: 0 },
    { depositPercent: 101 },
    { vacancyWeeks: 53 },
    { annualCosts: -1 },
    { weeklyRent: NaN },
  ])
    assert.throws(() =>
      cashflow({
        price: 500000,
        weeklyRent: 500,
        depositPercent: 20,
        interestRate: 6,
        annualCosts: 6000,
        vacancyWeeks: 2,
        ...patch,
      }),
    );
});
test('backup validation rejects malformed or future state without trusting it', () => {
  assert.equal(isUserState(initialState), true);
  assert.equal(isUserState({ ...initialState, version: 2 }), false);
  assert.equal(isUserState({ ...initialState, stages: { smith: 'invalid' } }), false);
  assert.equal(isUserState({ ...initialState, events: [{ id: 'x' }] }), false);
  assert.equal(
    isUserState({
      ...initialState,
      preferences: { ...initialState.preferences, minPrice: 900000, maxPrice: 1 },
    }),
    false,
  );
});
