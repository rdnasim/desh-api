# Privacy

Desh API is built so that it never needs to know who you are or what you looked up.

## Validators check formats only

The NID, phone, TIN, BIN, vehicle plate and postcode endpoints check whether a value is
**well-formed**. They never look up, confirm or enrich a real person, account or vehicle, and they
do not call any other service.

## Finance calculators

The income tax, VAT, EMI, DPS and gratuity calculators take only numbers (income, amounts, rates,
years of service), never a name, TIN or other identifier, and nothing is looked up. Because the
answer depends only on those numbers, responses may be kept in Cloudflare's cache and your browser
cache, keyed by the request URL, so the amounts in the URL are stored there for a while (up to a
week) along with the answer. They are not linked to you, and our logs record only the route
pattern (for example `/v1/finance/income-tax`).

## Mock data

`/v1/mock/*` returns made-up people. Names are combined at random from lists of common names, and
phone numbers and NIDs are random digits in the right format, so one may happen to belong to a real
person: never call, text or look up generated numbers. Emails use `example.com`, which cannot
receive mail. Religion is used only to pair names believably and is never returned.

## What we do not store

- We have no database of requests. Nothing you send is saved.
- Validator and phone responses are sent with `Cache-Control: no-store`, so they are not kept by
  our CDN or your browser cache.
- Bijoy conversion responses do not echo your text back.

## What we log

One line per request, containing only:

- the HTTP method,
- the route **pattern** (for example `/v1/validate/nid/:number`, never the number itself),
- the status code,
- how long it took.

We do not store full URLs, query strings, request bodies or response bodies. Cloudflare's automatic
per-request logs, which would include full URLs, are turned off. An automated test checks that
values sent to the validators never appear in our log output, and this was confirmed on the live
service on 14 November 2026.

One exception to be aware of: while the project maintainer is actively watching Cloudflare's
real-time log stream (for debugging), that stream shows the URL of each request as it happens. It is
not stored. Request bodies are never shown, which is another reason to send identifiers with `POST`.

## Keep values out of URLs

URLs can end up in browser history, proxies and analytics tools you use. For NIDs, phone numbers
and other identifiers, prefer the `POST` endpoints (`POST /v1/phone/validate`,
`POST /v1/validate/{type}`), which take the value in the request body.

## Rate limiting

To stop abuse, requests are counted per IP address for 60 seconds by Cloudflare's rate limiter. The
count is not stored by us.

## Infrastructure

The API runs on Cloudflare Workers. Cloudflare processes network traffic (including IP addresses)
to deliver the service under its own privacy policy.

Questions or concerns: open an issue on GitHub.
