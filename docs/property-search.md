# Property search: current capability and remaining work

## What is real

Only the ABS regional statistics are fetched from an external data API. They are aggregate observations, not property advertisements, suburb valuations or proof that a house is for sale. Preserve the source's Beta/test/preliminary metadata.

All property addresses, prices, rents, scores, sale statuses and market timeline examples still come from `src/lib/mock.ts`. They are fictional. In particular, 12 Smith St is a demonstration record, not a verified listing. There is no scheduled scan, real price monitoring or notification service.

## Corrections

- Discover now defaults to Property search & Buy Box. The regional statistics and fictional demo listings have explicit separate tabs.
- The global search no longer silently routes address searches into mock records.
- A persistent banner explains the data boundary. Overview's fictional opportunities and activity are collapsed behind an explicit demo disclosure.
- Buy Box is editable in Discover or Settings. It supports property types, states, comma-separated suburb names/postcodes, price range, bedroom range, minimum bathrooms, parking spaces, enclosed garage spaces, land area range, minimum gross yield and excluding under-offer properties.
- Saved criteria use the existing browser workspace. Old backups still load; new criteria are optional in the v1 schema. Saving is not a scan. Separate ports have separate browser storage.
- Demo filtering uses the same matching function. Unknown values cannot satisfy an active constraint. No bathroom or parking values were invented for the old fixtures. Car spaces do not establish enclosed garages. The original fixture properties were already presented as houses; their type is now explicit.
- No source connection means an unavailable search, **not** zero matching homes and never a fallback to demo results.
- External Domain and realestate.com.au links open their public search pages only. They do not transfer filters or import results.

## Work required for a real scan

The app needs a provider account with permission to retrieve current listings. Domain documents `POST /v1/listings/residential/_search` and requires `api_listings_read` or `api_listings_write` access: https://developer.domain.com.au/docs/latest/apis/pkg_agents_listings/references/listings_detailedresidentialsearch/

Once access is available, implement a server-only provider adapter and map supported Buy Box fields. Retain listing ID, original URL, source, retrieval time and provider status. Preserve unknowns. Explicitly report unsupported filters (especially rent/yield and enclosed garages), pagination coverage and provider errors. Never label a partial or failed query a completed Australia-wide scan.

Manual scan should execute that adapter and display only returned real listings. Automatic scans additionally need a durable saved-search store, scheduler, snapshots/change detection, run history and notification preferences. Neither is implemented in this correction. An OpenAI key alone does not supply these capabilities.

## Verification

Run `npm test` and `npm run build`. `tests/buy-box.test.ts` covers saved-state compatibility, combined filtering, inclusive ranges, unknown values, parking/garage distinction, status/yield rules and invalid backups.
