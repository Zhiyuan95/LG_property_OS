'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel empty">
      <h1>Could not load this view</h1>
      <p>Your browser research data has not been changed.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
