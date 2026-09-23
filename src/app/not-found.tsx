import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="panel empty spacious">
      <h1>Page not found</h1>
      <p>This property or suburb is not part of the sample dataset.</p>
      <Link className="button primary" href="/discover">
        Back to Discover
      </Link>
    </div>
  );
}
