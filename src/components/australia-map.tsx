'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Dataset } from '@/lib/types';
import { money } from '@/lib/finance';
export function AustraliaMap({ data }: { data: Dataset }) {
  const [selected, setSelected] = useState(data.suburbs[0].id),
    [zoom, setZoom] = useState(1);
  const suburb = data.suburbs.find((s) => s.id === selected) ?? data.suburbs[0];
  const list = data.properties.filter((p) => p.suburbId === suburb.id);
  const w = 4600 / zoom,
    h = 4000 / zoom,
    cx = zoom === 1 ? 2300 : suburb.x,
    cy = zoom === 1 ? 2000 : suburb.y;
  return (
    <section className="panel map-panel">
      <div className="section-head">
        <div className="inline">
          <h2>Opportunity map</h2>
          <span className="muted small">Select a suburb to explore</span>
        </div>
        <span className="tag neutral">Sample locations</span>
      </div>
      <div className="map-layout">
        <div className="map">
          <svg
            viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`}
            aria-label="Australia sample property locations"
            role="group"
          >
            <image href="/australia.svg" width="4600" height="4000" />
            {data.suburbs.map((s) => (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${s.name}`}
                onClick={() => setSelected(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(s.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.id === selected ? 145 / zoom : 125 / zoom}
                  fill={s.id === selected ? '#9a6a12' : '#0e5e5b'}
                  stroke="white"
                  strokeWidth={14 / zoom}
                />
                <text
                  x={s.x}
                  y={s.y + 36 / zoom}
                  textAnchor="middle"
                  fill="white"
                  fontSize={110 / zoom}
                >
                  {data.properties.filter((p) => p.suburbId === s.id).length}
                </text>
              </g>
            ))}
          </svg>
          <div className="map-caption">
            Australia / {zoom === 1 ? 'All sample regions' : suburb.name}
          </div>
          <div className="zoom">
            <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(4, z + 1))}>
              +
            </button>
            <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, z - 1))}>
              −
            </button>
            <button aria-label="Reset map" onClick={() => setZoom(1)}>
              AU
            </button>
          </div>
          <div className="map-picks" aria-label="Select map location">
            {data.suburbs.map((s) => (
              <button aria-pressed={s.id === selected} key={s.id} onClick={() => setSelected(s.id)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <div className="map-detail">
          <p className="eyebrow">IN VIEW · {list.length} HOMES</p>
          <h2>{suburb.name}</h2>
          <p className="muted">
            {suburb.state} {suburb.postcode}
          </p>
          {list.map((p) => (
            <Link className="map-row" href={'/discover/property/' + p.id} key={p.id}>
              <span>
                <b>{p.address}</b>
                <small>
                  {p.beds} bed · {p.status}
                </small>
              </span>
              <span>{money(p.price)}</span>
            </Link>
          ))}
          <Link className="button primary" href={'/discover/suburb/' + suburb.id}>
            Explore suburb ↗
          </Link>
          <p className="small muted">
            Original UX map artwork. Markers are illustrative and not parcel boundaries.
          </p>
        </div>
      </div>
    </section>
  );
}
