export interface FinanceInput {
  price: number;
  weeklyRent: number;
  depositPercent: number;
  interestRate: number;
  annualCosts: number;
  vacancyWeeks: number;
}
export const money = (n: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(n);
export const grossYield = (price: number, rent: number) =>
  price > 0 ? ((rent * 52) / price) * 100 : 0;
/** Interest-only, pre-tax annual model. Acquisition costs are excluded. */
export function cashflow(i: FinanceInput) {
  if (
    ![i.price, i.weeklyRent, i.depositPercent, i.interestRate, i.annualCosts, i.vacancyWeeks].every(
      Number.isFinite,
    ) ||
    i.price <= 0 ||
    i.weeklyRent < 0 ||
    i.depositPercent < 0 ||
    i.depositPercent > 100 ||
    i.interestRate < 0 ||
    i.annualCosts < 0 ||
    i.vacancyWeeks < 0 ||
    i.vacancyWeeks > 52
  )
    throw new Error('Invalid finance assumptions');
  const deposit = (i.price * i.depositPercent) / 100;
  const loan = i.price - deposit;
  const interest = (loan * i.interestRate) / 100;
  const income = i.weeklyRent * (52 - i.vacancyWeeks);
  return {
    deposit,
    loan,
    interest,
    income,
    annual: income - interest - i.annualCosts,
    weekly: (income - interest - i.annualCosts) / 52,
  };
}
