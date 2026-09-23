'use client';
import { useState } from 'react';
import { useStore } from './store';
import { defaultBuyBox, isBuyBox } from '@/lib/buy-box';
import { propertyTypes, stateCodes, type BuyBox } from '@/lib/types';
import { isUserState } from '@/lib/user-state';

export function BuyBoxForm({ profile = false }: { profile?: boolean }) {
  const { state, ready, update } = useStore();
  const [message, setMessage] = useState('');
  const pref = state.preferences,
    b = pref.buyBox ?? defaultBuyBox;
  return (
    <section className="panel" id="buy-box">
      <h2>{profile ? 'Profile & Buy Box' : 'Your Buy Box'}</h2>
      <p className="muted">
        Save the criteria for your property search. Saving does not start a scan or enable alerts.
      </p>
      <form
        key={JSON.stringify(pref)}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const number = (key: string) => Number(f.get(key));
          const optional = (key: string) => (String(f.get(key)).trim() === '' ? null : number(key));
          const buyBox = {
            propertyTypes: f.getAll('propertyTypes'),
            states: f.getAll('states'),
            suburbs: String(f.get('suburbs')).trim(),
            minBeds: number('minBeds'),
            maxBeds: optional('maxBeds'),
            minBaths: number('minBaths'),
            minCarSpaces: number('minCarSpaces'),
            minGarageSpaces: number('minGarageSpaces'),
            minLand: number('minLand'),
            maxLand: optional('maxLand'),
            excludeUnderOffer: f.has('excludeUnderOffer'),
          };
          const preferences = {
            name: profile ? String(f.get('name')).trim() : pref.name,
            minPrice: number('minPrice'),
            maxPrice: number('maxPrice'),
            minYield: number('minYield'),
            buyBox,
          };
          if (!isBuyBox(buyBox) || !preferences.name || !isUserState({ ...state, preferences })) {
            setMessage('Check your ranges: minimum must not exceed maximum.');
            return;
          }
          update((s) => ({ ...s, preferences: { ...preferences, buyBox } }));
          setMessage('Buy Box saved in this browser. No scan has been started.');
        }}
      >
        <fieldset disabled={!ready} className="buybox-fields">
          {profile && (
            <label>
              Display name
              <input name="name" required maxLength={40} defaultValue={pref.name} />
            </label>
          )}
          <fieldset>
            <legend>Property type · select none for any</legend>
            <div className="choice-grid">
              {propertyTypes.map((t) => (
                <label className="check" key={t}>
                  <input
                    type="checkbox"
                    name="propertyTypes"
                    value={t}
                    defaultChecked={b.propertyTypes.includes(t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>States · select none for Australia-wide</legend>
            <div className="choice-grid">
              {stateCodes.map((s) => (
                <label className="check" key={s}>
                  <input
                    type="checkbox"
                    name="states"
                    value={s}
                    defaultChecked={b.states.includes(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Suburbs or postcodes · comma separated
            <input
              name="suburbs"
              maxLength={500}
              defaultValue={b.suburbs}
              placeholder="Rockingham, Baldivis, 4301"
            />
          </label>
          <div className="form-grid">
            <label>
              Minimum price (AUD)
              <input
                name="minPrice"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={pref.minPrice}
              />
            </label>
            <label>
              Maximum price (AUD)
              <input
                name="maxPrice"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={pref.maxPrice}
              />
            </label>
            {(
              [
                ['minBeds', 'Minimum bedrooms', 30],
                ['maxBeds', 'Maximum bedrooms · blank for any', 30],
                ['minBaths', 'Minimum bathrooms', 30],
                ['minCarSpaces', 'Minimum parking spaces', 30],
                ['minGarageSpaces', 'Minimum enclosed garage spaces', 30],
                ['minLand', 'Minimum land area (m²)', undefined],
                ['maxLand', 'Maximum land area · blank for any (m²)', undefined],
              ] as const
            ).map(([key, label, max]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  type="number"
                  min="0"
                  max={max}
                  step="1"
                  required={!key.startsWith('max')}
                  defaultValue={(b[key as keyof BuyBox] as number) ?? ''}
                />
              </label>
            ))}
            <label>
              Minimum gross yield (%)
              <input
                name="minYield"
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                defaultValue={pref.minYield}
              />
            </label>
          </div>
          <label className="check">
            <input type="checkbox" name="excludeUnderOffer" defaultChecked={b.excludeUnderOffer} />
            Exclude under-offer properties
          </label>
          <p className="small muted">
            Parking includes open spaces and carports; it does not prove an enclosed garage. Unknown
            values cannot pass an active minimum. Yield requires a supported rent estimate.
          </p>
          <button className="primary">Save Buy Box</button>
        </fieldset>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}
