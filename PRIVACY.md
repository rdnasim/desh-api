# Privacy

Desh API is built so that it never needs to know who you are or what you looked up.

## Validators check formats only

The NID, phone, TIN, BIN, vehicle plate and postcode endpoints check whether a value is
**well-formed**. They never look up, confirm or enrich a real person, account or vehicle, and they
do not call any other service.

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

We do not log full URLs, query strings, request bodies or response bodies. Cloudflare's automatic
per-request logs, which would include full URLs, are turned off. An automated test checks that
values sent to the validators never appear in our log output.

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
