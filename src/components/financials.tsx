'use client';
import { useState } from 'react';
import type { Property } from '@/lib/types';
import { cashflow, grossYield, money, type FinanceInput } from '@/lib/finance';
export function Financials({ property }: { property: Property }) {
  const [values, setValues] = useState<FinanceInput>({
    price: property.price,
    weeklyRent: property.rent,
    depositPercent: 20,
    interestRate: 6.2,
    annualCosts: 8500,
    vacancyWeeks: 2,
  });
  let result: ReturnType<typeof cashflow> | undefined;
  try {
    result = cashflow(values);
  } catch {}
  const fields: { key: keyof FinanceInput; name: string; max?: number; step: number }[] = [
    { key: 'price', name: 'Purchase price (AUD)', step: 1000 },
    { key: 'weeklyRent', name: 'Weekly rent (AUD)', step: 10 },
    { key: 'depositPercent', name: 'Deposit (%)', max: 100, step: 1 },
    { key: 'interestRate', name: 'Annual interest (%)', step: 0.1 },
    { key: 'annualCosts', name: 'Annual operating costs (AUD)', step: 100 },
    { key: 'vacancyWeeks', name: 'Vacancy (weeks / year)', max: 52, step: 1 },
  ];
  return (
    <div className="two-col">
      <section className="panel">
        <h2>Cashflow assumptions</h2>
        <p className="muted">Editable scenario · changes are not saved</p>
        <div className="form-grid">
          {fields.map((f) => (
            <label key={f.key}>
              {f.name}
              <input
                type="number"
                min={f.key === 'price' ? 1 : 0}
                max={f.max}
                step={f.step}
                value={Number.isNaN(values[f.key]) ? '' : values[f.key]}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [f.key]: e.target.value === '' ? NaN : Number(e.target.value),
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>
      <section className="panel">
        <p className="eyebrow">ESTIMATED PRE-TAX CASHFLOW</p>
        {result ? (
          <>
            <div className={'big-number ' + (result.weekly < 0 ? 'negative' : 'positive')}>
              {money(result.weekly)}
              <small>/ week</small>
            </div>
            <p className="muted">{money(result.annual)} annually · interest-only</p>
            <dl className="metrics">
              <div>
                <dt>Deposit</dt>
                <dd>{money(result.deposit)}</dd>
              </div>
              <div>
                <dt>Loan amount</dt>
                <dd>{money(result.loan)}</dd>
              </div>
              <div>
                <dt>Rent after vacancy</dt>
                <dd>{money(result.income)}/yr</dd>
              </div>
              <div>
                <dt>Interest</dt>
                <dd>{money(result.interest)}/yr</dd>
              </div>
              <div>
                <dt>Gross rental yield</dt>
                <dd>{grossYield(values.price, values.weeklyRent).toFixed(2)}%</dd>
              </div>
            </dl>
          </>
        ) : (
          <p role="alert">
            Enter valid non-negative assumptions. Deposit must be 0–100%, vacancy 0–52 weeks, and
            price greater than zero.
          </p>
        )}
        <div className="notice small">
          Annual cashflow = rent × (52 − vacancy weeks) − loan × annual rate − operating costs.
          Excludes principal repayments, tax, depreciation, stamp duty, acquisition costs and
          capital growth. Operating costs should include insurance, rates, management and
          maintenance.
        </div>
      </section>
    </div>
  );
}
