/**
 * Landing page served at `/` to browsers (requests that accept text/html).
 * Self-contained: no external fonts, scripts or images.
 */
export const LANDING_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Desh API — Bangladesh reference data and Bangla language tools</title>
<meta name="description" content="A free, open API for Bangladesh: divisions to unions, postcodes, bank branches and routing numbers, universities, official holidays, taka in words, Bangla dates, Bijoy to Unicode, phone validation, income tax, zakat, gold and market prices, and mobile financial services (MFS) charges. English and Bangla names, and the source of every fact.">
<meta name="theme-color" content="#E4002B">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23fff'/%3E%3Ccircle cx='14' cy='16' r='9' fill='%23E4002B'/%3E%3C/svg%3E">
<script>
try {
  var saved = localStorage.getItem('desh-theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
} catch (e) {}
</script>
<style>
:root {
  --bg: #FFFFFF;
  --bg-alt: #F7F7F8;
  --ink: #111111;
  --ink-2: #555555;
  --rule: #111111;
  --hair: #D9D9DC;
  --red: #E4002B;
  --code-bg: #F7F7F8;
  --sans: "Helvetica Neue", Helvetica, Arial, "Bangla Sangam MN", "Noto Sans Bengali", "Nirmala UI", sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, "Bangla Sangam MN", "Kohinoor Bangla", "Noto Sans Bengali", "Nirmala UI", monospace;
}
/* Theme: follows the device unless the visitor picks Light or Dark (stored as data-theme). */
:root { color-scheme: light; }
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #111111;
  --bg-alt: #191919;
  --ink: #F7F7F8;
  --ink-2: #A8A8AD;
  --rule: #F7F7F8;
  --hair: #2E2E31;
  --code-bg: #191919;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #111111;
    --bg-alt: #191919;
    --ink: #F7F7F8;
    --ink-2: #A8A8AD;
    --rule: #F7F7F8;
    --hair: #2E2E31;
    --code-bg: #191919;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 17px;
  line-height: 1.5;
}
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { color: var(--red); }
:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
code, pre, .mono { font-family: var(--mono); font-size: 14px; }
.wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 24px; }
.rule { border-top: 2px solid var(--rule); }
.hair { border-top: 1px solid var(--hair); }

/* Header */
header.top { border-bottom: 2px solid var(--rule); }
header.top .wrap { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.mark { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 20px; letter-spacing: -0.01em; text-decoration: none; white-space: nowrap; }
.disc { width: 18px; height: 18px; border-radius: 50%; background: var(--red); display: inline-block; }
nav.links { display: flex; gap: 28px; font-size: 15px; }
nav.links a { text-decoration: none; }
nav.links a:hover { text-decoration: underline; }
.top-right { display: flex; align-items: center; gap: 28px; }
.theme { display: flex; border: 1px solid var(--rule); }
.theme button {
  font: inherit; font-size: 13px; padding: 5px 10px; border: 0; background: var(--bg); color: var(--ink);
  cursor: pointer; border-radius: 0;
}
.theme button + button { border-left: 1px solid var(--rule); }
.theme button[aria-pressed="true"] { background: var(--ink); color: var(--bg); }

/* Hero */
.hero { padding: 72px 0 0; }
.hero h1 {
  grid-column: 1 / span 9;
  margin: 0;
  font-size: clamp(40px, 6.2vw, 84px);
  line-height: 1.02;
  letter-spacing: -0.035em;
  font-weight: 700;
}
.hero .bn { grid-column: 1 / span 8; margin: 28px 0 0; font-size: 21px; color: var(--ink-2); }
.hero .lede { grid-column: 1 / span 7; margin: 20px 0 0; font-size: 19px; }
.hero .disc-big {
  grid-column: 11 / span 2; grid-row: 1 / span 2; align-self: start; justify-self: end;
  width: clamp(80px, 11vw, 150px); aspect-ratio: 1; border-radius: 50%; background: var(--red);
}
.base { grid-column: 1 / span 7; margin-top: 36px; display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.base .url {
  display: flex; align-items: center; gap: 12px; border: 1px solid var(--rule);
  padding: 0 14px; height: 48px; font-family: var(--mono); font-size: 15px; flex: 1 1 280px;
}
.btn {
  display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 20px;
  border: 1px solid var(--rule); background: var(--bg); color: var(--ink); font: inherit; font-size: 15px;
  font-weight: 600; text-decoration: none; cursor: pointer; border-radius: 0;
}
.btn:hover { background: var(--ink); color: var(--bg); }
.btn.primary { background: var(--red); border-color: var(--red); color: #FFFFFF; }
.btn.primary:hover { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.copy {
  margin-left: auto; border: 0; background: none; color: var(--ink-2); font: inherit; font-size: 13px;
  font-family: var(--sans); cursor: pointer; padding: 4px 0;
}
.copy:hover { color: var(--red); }

/* Numerals */
.counts { margin-top: 72px; }
.counts + section.wrap { padding-top: 72px; }
.counts .grid { row-gap: 0; }
.count { grid-column: span 2; border-top: 2px solid var(--rule); padding: 14px 0 28px; }
.count:first-child { grid-column: span 2; }
.count .n {
  display: block; font-size: clamp(36px, 4.6vw, 64px); font-weight: 700; letter-spacing: -0.045em;
  line-height: 1; font-variant-numeric: tabular-nums;
}
.count .l { display: block; margin-top: 10px; font-size: 14px; color: var(--ink-2); }
.count.note { grid-column: span 2; border-top: 2px solid var(--red); }
.count.note .l { color: var(--ink); font-size: 14px; margin-top: 0; }

/* Sections */
section.wrap { padding-top: 104px; }
.sec-head { grid-column: 1 / span 3; }
.sec-head .no { font-size: 15px; font-weight: 700; color: var(--red); font-variant-numeric: tabular-nums; }
.sec-head h2 { margin: 6px 0 0; font-size: 30px; line-height: 1.1; letter-spacing: -0.02em; }
.sec-body { grid-column: 4 / span 9; }
.sec-body > p:first-child { margin-top: 0; }
.muted { color: var(--ink-2); }

/* Playground */
.play { border: 2px solid var(--rule); }
.play-bar { display: flex; flex-wrap: wrap; gap: 0; border-bottom: 1px solid var(--hair); }
.play-bar select, .play-bar input {
  font: inherit; color: var(--ink); background: var(--bg); border: 0; border-right: 1px solid var(--hair);
  height: 52px; padding: 0 14px; border-radius: 0;
}
.play-bar select#method { width: 92px; font-weight: 600; }
.play-bar input#path { flex: 1 1 320px; font-family: var(--mono); font-size: 14px; border-right: 0; }
.play-bar .btn { height: 52px; border: 0; border-left: 1px solid var(--hair); }
.presets { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px; border-bottom: 1px solid var(--hair); }
.presets button {
  font: inherit; font-size: 13px; padding: 6px 10px; border: 1px solid var(--hair); background: var(--bg);
  color: var(--ink); cursor: pointer; border-radius: 0;
}
.presets button:hover, .presets button[aria-pressed="true"] { border-color: var(--red); color: var(--red); }
textarea#body[hidden] { display: none; }
textarea#body {
  display: block; width: 100%; min-height: 76px; border: 0; border-bottom: 1px solid var(--hair);
  padding: 14px; font-family: var(--mono); font-size: 14px; background: var(--bg-alt); color: var(--ink); resize: vertical;
}
.play-out-head { display: flex; gap: 18px; align-items: center; padding: 10px 14px; font-size: 13px; color: var(--ink-2); border-bottom: 1px solid var(--hair); }
.play-out-head .status { font-weight: 700; color: var(--ink); }
.play-out-head .status.err { color: var(--red); }
pre .bn, code .bn { font-family: var(--sans); }
pre.out { margin: 0; padding: 16px; max-height: 420px; overflow: auto; background: var(--code-bg); white-space: pre-wrap; word-break: break-word; }

/* Modules */
.mods { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 2px solid var(--rule); }
.mod { padding: 22px 22px 26px 0; border-bottom: 1px solid var(--hair); }
.mod:nth-child(3n+2), .mod:nth-child(3n) { padding-left: 22px; border-left: 1px solid var(--hair); }
.mod:last-child:nth-child(3n+1) { grid-column: 1 / -1; }
.mod:last-child:nth-child(3n+2) { grid-column: span 2; }
.mod .k { font-size: 13px; font-weight: 700; color: var(--red); font-variant-numeric: tabular-nums; }
.mod h3 { margin: 4px 0 8px; font-size: 21px; letter-spacing: -0.01em; }
.mod p { margin: 0 0 14px; font-size: 15px; color: var(--ink-2); }
.mod a { font-family: var(--mono); font-size: 13px; word-break: break-all; }

/* Code blocks */
.code { border: 1px solid var(--hair); margin: 0 0 16px; }
.code-head { display: flex; align-items: center; padding: 8px 14px; border-bottom: 1px solid var(--hair); font-size: 13px; color: var(--ink-2); }
.code pre { margin: 0; padding: 14px; overflow-x: auto; background: var(--code-bg); }

/* Tables */
table { width: 100%; border-collapse: collapse; font-size: 15px; }
th, td { text-align: left; vertical-align: top; padding: 12px 16px 12px 0; border-bottom: 1px solid var(--hair); }
th { font-weight: 700; border-bottom: 2px solid var(--rule); font-size: 13px; }
td code { font-size: 13px; }

/* Principles */
.principles { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 2px solid var(--rule); }
.principle { padding: 20px 24px 24px 0; border-bottom: 1px solid var(--hair); }
.principle:nth-child(2n) { padding-left: 24px; border-left: 1px solid var(--hair); }
.principle h3 { margin: 0 0 6px; font-size: 19px; }
.principle p { margin: 0; font-size: 15px; color: var(--ink-2); }

footer { margin-top: 120px; border-top: 2px solid var(--rule); padding: 28px 0 56px; font-size: 14px; }
footer .grid > div { grid-column: span 4; }
footer p { margin: 0 0 6px; }

@media (max-width: 900px) {
  .wrap { padding: 0 20px; }
  .grid { display: block; }
  .counts .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; }
  .hero { padding-top: 40px; }
  .hero h1 { font-size: clamp(34px, 9vw, 56px); }
  .counts { margin-top: 48px; }
  section.wrap { padding-top: 64px; }
  .play-bar select#method { flex: 1 1 auto; }
  .play-bar .btn { flex: 0 0 auto; }
  .play-bar input#path { order: 3; flex: 1 1 100%; border-top: 1px solid var(--hair); }
  .base .btn { flex: 1 1 auto; }
  .mod a { overflow-wrap: anywhere; }
  pre { white-space: pre-wrap; word-break: break-word; }
  .hero h1, .hero .bn, .hero .lede, .base { grid-column: 1 / -1; }
  .hero .disc-big { display: none; }
  .count, .count:first-child, .count.note { grid-column: auto; }
  .sec-head, .sec-body { grid-column: 1 / -1; }
  .sec-head { margin-bottom: 24px; }
  .mods { grid-template-columns: 1fr; }
  .mod, .mod:nth-child(3n+2), .mod:nth-child(3n) { padding: 20px 0; border-left: 0; }
  .principles { grid-template-columns: 1fr; }
  .principle, .principle:nth-child(2n) { padding: 18px 0; border-left: 0; }
  footer .grid > div { grid-column: 1 / -1; margin-bottom: 16px; }
  nav.links { gap: 12px; font-size: 14px; }
  nav.links .opt { display: none; }
  .top-right { gap: 12px; }
  .mark { font-size: 18px; gap: 8px; }
  .theme button { padding: 4px 8px; font-size: 12px; }
}
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="mark" href="/"><span class="disc" aria-hidden="true"></span>Desh API</a>
    <div class="top-right">
      <nav class="links" aria-label="Main">
        <a href="#try" class="opt">Try it</a>
        <a href="#modules" class="opt">Modules</a>
        <a href="/docs">Docs</a>
        <a href="https://github.com/rdnasim/desh-api" class="opt">GitHub</a>
      </nav>
      <div class="theme" role="group" aria-label="Colour theme">
        <button type="button" data-theme-set="auto" aria-pressed="true">Auto</button>
        <button type="button" data-theme-set="light" aria-pressed="false">Light</button>
        <button type="button" data-theme-set="dark" aria-pressed="false">Dark</button>
      </div>
    </div>
  </div>
</header>

<main>
<div class="wrap hero">
  <div class="grid">
    <h1>Bangladesh reference data, Bangla tools and calculators, as a free API.</h1>
    <div class="disc-big" aria-hidden="true"></div>
    <p class="bn" lang="bn">বাংলাদেশের তথ্য, বাংলা ভাষার টুলস ও ক্যালকুলেটর — ফ্রি, ওপেন সোর্স API।</p>
    <p class="lede">Divisions to unions and postcodes, bank branches and routing numbers, universities, official holidays, taka in words, Bangla dates, Bijoy to Unicode, phone validation, income tax, zakat, today's gold and market prices, and mobile financial services (bKash, Nagad, Rocket, Upay, TAP). English and Bangla names, and the source of every fact in every response. No sign-up, no API key.</p>
    <div class="base">
      <div class="url"><span id="base-url">https://deshapi.riadul.com</span><button class="copy" type="button" data-copy-from="base-url">Copy</button></div>
      <a class="btn primary" href="/docs">Open the docs</a>
      <a class="btn" href="https://github.com/rdnasim/desh-api">View on GitHub</a>
    </div>
  </div>
</div>

<div class="wrap counts" aria-label="What the data covers">
  <div class="grid">
    <div class="count"><span class="n">16</span><span class="l">modules</span></div>
    <div class="count"><span class="n">4,540</span><span class="l">unions</span></div>
    <div class="count"><span class="n">1,349</span><span class="l">post offices</span></div>
    <div class="count"><span class="n">11,533</span><span class="l">bank branches</span></div>
    <div class="count"><span class="n">181</span><span class="l">universities</span></div>
    <div class="count note"><span class="l">From BBS geocodes, Bangladesh Bank and the University Grants Commission; every response names its source.</span></div>
  </div>
</div>

<section id="try" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">01</div><h2>Try it</h2></div>
    <div class="sec-body">
      <p class="muted">Pick an example or type any path. Requests go to the live API.</p>
      <div class="play">
        <form class="play-bar" id="play-form">
          <select id="method" aria-label="HTTP method"><option>GET</option><option>POST</option></select>
          <input id="path" aria-label="Path" value="/v1/districts/cumilla" spellcheck="false" autocomplete="off">
          <button class="btn primary" type="submit">Send</button>
        </form>
        <div class="presets" id="presets" aria-label="Examples"></div>
        <textarea id="body" aria-label="Request body" spellcheck="false" hidden></textarea>
        <div class="play-out-head"><span class="status" id="status">Ready</span><span id="timing"></span><button class="copy" type="button" id="copy-curl">Copy as curl</button></div>
        <pre class="out" id="out" aria-live="polite">Press Send to see the response.</pre>
      </div>
    </div>
  </div>
</section>

<section id="modules" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">02</div><h2>Modules</h2></div>
    <div class="sec-body">
      <div class="mods">
        <div class="mod"><div class="k">01</div><h3>Geo</h3><p>Divisions, districts, upazilas, unions and post offices. Search in English or Bangla, including old spellings, and find the nearest area to a GPS point.</p><a href="/v1/upazilas?district=cumilla">/v1/upazilas?district=cumilla</a></div>
        <div class="mod"><div class="k">02</div><h3>Bangla toolkit</h3><p>Numbers and taka in words, Latin and Bangla digits, lakh/crore formatting, Bangla calendar dates, ordinals, slugs and Avro Phonetic transliteration.</p><a href="/v1/bangla/taka-in-words?amount=1250.50">/v1/bangla/taka-in-words?amount=1250.50</a></div>
        <div class="mod"><div class="k">03</div><h3>Holidays</h3><p>Official public holidays from the government notification, "is this a holiday?" checks and working-day counts.</p><a href="/v1/holidays/dates?year=2027&amp;closed=true">/v1/holidays/dates?year=2027&amp;closed=true</a></div>
        <div class="mod"><div class="k">04</div><h3>Phone</h3><p>Validate and normalise mobile numbers in any common format, with the original operator. Up to 100 at once.</p><a href="/docs#tag/phone">POST /v1/phone/validate</a></div>
        <div class="mod"><div class="k">05</div><h3>Convert</h3><p>Bijoy (SutonnyMJ) text to Unicode and back, up to 100 KB per request.</p><a href="/docs#tag/convert">POST /v1/convert/bijoy-to-unicode</a></div>
        <div class="mod"><div class="k">06</div><h3>Land</h3><p>Convert katha, bigha, decimal, chotak, acre, square feet, square metres and gaj.</p><a href="/v1/land/convert?value=5&amp;from=katha&amp;to=sqft">/v1/land/convert?value=5&amp;from=katha&amp;to=sqft</a></div>
        <div class="mod"><div class="k">07</div><h3>Validate</h3><p>Format checks for NID, vehicle plates, e-TIN, VAT BIN, postcodes and bank routing numbers. Nothing is looked up or stored.</p><a href="/docs#tag/validate">POST /v1/validate/{type}</a></div>
        <div class="mod"><div class="k">08</div><h3>Hotlines</h3><p>National hotline numbers, each checked against an official government page, with the date it was checked.</p><a href="/v1/hotlines?category=emergency">/v1/hotlines?category=emergency</a></div>
        <div class="mod"><div class="k">09</div><h3>Fun</h3><p>Traditional proverbs and riddles, quiz questions, GI-registered foods by district, and Bangladesh history by date.</p><a href="/v1/fun/proverb/random">/v1/fun/proverb/random</a></div>
        <div class="mod"><div class="k">10</div><h3>Finance</h3><p>Income tax under the Finance Act 2026 for every taxpayer category, with the salary exemption, investment rebate, minimum tax and a slab-by-slab breakdown. Also VAT, loan EMI with a repayment schedule, DPS maturity and statutory gratuity.</p><a href="/v1/finance/income-tax?income=1200000&amp;employment_income=1200000">/v1/finance/income-tax?income=1200000&amp;employment_income=1200000</a></div>
        <div class="mod"><div class="k">11</div><h3>Mock data</h3><p>Synthetic Bangladeshi people and addresses for testing: bilingual names, phones and NIDs that pass the validators, example.com emails, and real upazilas and postcodes. Repeatable with a seed.</p><a href="/v1/mock/people?count=3&amp;seed=demo">/v1/mock/people?count=3&amp;seed=demo</a></div>
        <div class="mod"><div class="k">12</div><h3>Banks</h3><p>All 61 banks and 11,533 branches from Bangladesh Bank, by district and upazila. Look up a branch by routing number, or check a routing number's check digit.</p><a href="/v1/routing/010130065">/v1/routing/010130065</a></div>
        <div class="mod"><div class="k">13</div><h3>Education</h3><p>All 181 universities listed by the University Grants Commission: public, private, international and cross-border, with founding year, website and campus.</p><a href="/v1/universities?category=public">/v1/universities?category=public</a></div>
        <div class="mod"><div class="k">14</div><h3>Gold &amp; zakat</h3><p>Today's gold and silver prices from the Bangladesh Jewellers Association, per gram and per vori, and a zakat calculator with the nisab worked out from those prices.</p><a href="/v1/gold/prices">/v1/gold/prices</a></div>
        <div class="mod"><div class="k">15</div><h3>Market prices</h3><p>Today's retail prices of rice, oil, pulses, spices, fish, meat and more in Dhaka from the Trading Corporation of Bangladesh, with week, month and year comparisons; and government fuel prices.</p><a href="/v1/market/prices?category=edible-oil">/v1/market/prices?category=edible-oil</a></div>
        <div class="mod"><div class="k">16</div><h3>MFS</h3><p>Bangladesh Bank-licensed Mobile Financial Services (bKash, Nagad, Rocket, Upay, TAP): official tariff schedules, USSD codes, cash-out and send-money fee calculations, and provider cost comparison.</p><a href="/v1/mfs/compare?amount=5000&amp;action=cash-out&amp;channel=app">/v1/mfs/compare?amount=5000</a></div>
        <div class="mod"><div class="k">17</div><h3>Prayer &amp; Ramadan</h3><p>Daily 5 prayer times, Sehri cutoff, and 30-day Ramadan timetable for all 64 districts using Islamic Foundation Bangladesh conventions.</p><a href="/v1/prayer/times?district=dhaka">/v1/prayer/times</a></div>
      </div>
    </div>
  </div>
</section>

<section id="start" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">03</div><h2>Quick start</h2></div>
    <div class="sec-body">
      <div class="code"><div class="code-head">Terminal<button class="copy" type="button" data-copy-from="ex-curl">Copy</button></div>
<pre id="ex-curl">curl 'https://deshapi.riadul.com/v1/bangla/taka-in-words?amount=1250.50'</pre></div>
      <div class="code"><div class="code-head">JavaScript<button class="copy" type="button" data-copy-from="ex-js">Copy</button></div>
<pre id="ex-js">const res = await fetch('https://deshapi.riadul.com/v1/districts?division=dhaka');
const { data, meta } = await res.json();
console.log(data.map((d) =&gt; d.name_bn), meta.source);</pre></div>
      <div class="code"><div class="code-head">Send identifiers in the body, not the URL<button class="copy" type="button" data-copy-from="ex-post">Copy</button></div>
<pre id="ex-post">curl -X POST https://deshapi.riadul.com/v1/phone/validate \\
  -H 'content-type: application/json' \\
  -d '{"number":"+8801712345678"}'</pre></div>
    </div>
  </div>
</section>

<section id="format" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">04</div><h2>Responses</h2></div>
    <div class="sec-body">
      <p>Every response has the same shape. <code>meta.source</code> says where the data came from.</p>
      <div class="code"><div class="code-head">Success</div>
<pre>{
  "success": true,
  "data": { "input": 1250, "words": "<span class="bn" lang="bn">এক হাজার দুইশত পঞ্চাশ</span>" },
  "meta": { "source": "desh-api Bangla toolkit", "last_updated": "2026-11-14", "version": "v1" }
}</pre></div>
      <table>
        <thead><tr><th>Status</th><th>code</th><th>When</th></tr></thead>
        <tbody>
          <tr><td>400</td><td><code>invalid_parameter</code></td><td>A parameter is missing, malformed or out of range</td></tr>
          <tr><td>404</td><td><code>not_found</code></td><td>Unknown slug, postcode, route, a year with no official holiday list, or a tax year with no Finance Act rates</td></tr>
          <tr><td>413</td><td><code>payload_too_large</code></td><td>Body over the limit (Bijoy: 100 KB; bulk phone: 100 numbers)</td></tr>
          <tr><td>429</td><td><code>rate_limited</code></td><td>More than 120 requests per minute from one IP</td></tr>
          <tr><td>503</td><td><code>upstream_unavailable</code></td><td>A live source (gold prices from BAJUS, market prices from TCB) could not be read and no list from the last 7 days is saved</td></tr>
        </tbody>
      </table>
      <p class="muted">Numbers can be sent in Latin or Bangla digits (1250 or ১২৫০). CORS is open, so you can call the API from a browser.</p>
    </div>
  </div>
</section>

<section id="principles" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">05</div><h2>Principles</h2></div>
    <div class="sec-body">
      <div class="principles">
        <div class="principle"><h3>Every fact has a source</h3><p>Each response names its source and last update. Facts that reliable sources disagree on are left out rather than guessed.</p></div>
        <div class="principle"><h3>English and Bangla</h3><p>Places, categories and messages come with <code>name_en</code> and <code>name_bn</code>, in Unicode. Where the official source is English-only (bank branches, most universities), we say so rather than invent a spelling.</p></div>
        <div class="principle"><h3>Format checks only</h3><p>Validators check that an NID, phone or plate is well-formed. Nothing is looked up, stored or logged. <a href="https://github.com/rdnasim/desh-api/blob/main/PRIVACY.md">Privacy</a></p></div>
        <div class="principle"><h3>Free and open</h3><p>No key or sign-up. Code is MIT, data is CC BY 4.0, and corrections are a pull request away.</p></div>
      </div>
    </div>
  </div>
</section>

<section id="sources" class="wrap">
  <div class="grid">
    <div class="sec-head"><div class="no">06</div><h2>Data sources</h2></div>
    <div class="sec-body">
      <table>
        <thead><tr><th>Data</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>Administrative areas, postcodes</td><td>Bangladesh Bureau of Statistics geocodes (via UN OCHA) and GeoNames, compiled by <a href="https://github.com/nuhil/bangladesh-geocode">nuhil/bangladesh-geocode</a></td></tr>
          <tr><td>Holidays</td><td><a href="https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740">Ministry of Public Administration, 2027 holiday notification</a></td></tr>
          <tr><td>Income tax</td><td><a href="http://bdlaws.minlaw.gov.bd/act-details-1725.html">Finance Act 2026 (Act No. 96 of 2026)</a> and the Income Tax Act 2023 as amended</td></tr>
          <tr><td>VAT, gratuity</td><td>VAT and Supplementary Duty Act 2012 (s. 15); Bangladesh Labour Act 2006 (s. 2(10))</td></tr>
          <tr><td>Banks and branches</td><td><a href="https://www.bb.org.bd/econdata/bs/geo_bank.pdf">Bangladesh Bank branch list</a> (as on 31 August 2026); routing numbers matched from <a href="https://www.bddata.org/all-banks/">bddata.org</a></td></tr>
          <tr><td>Universities</td><td><a href="https://www.ugc.gov.bd/universities">University Grants Commission</a></td></tr>
          <tr><td>Gold and silver prices</td><td><a href="https://www.bajus.org/gold-price">Bangladesh Jewellers Association (BAJUS)</a>, read live</td></tr>
          <tr><td>Market prices</td><td><a href="https://tcb.gov.bd/pages/daily-rmps">Trading Corporation of Bangladesh daily retail prices</a>, read live</td></tr>
          <tr><td>Fuel prices</td><td>Energy and Mineral Resources Division monthly notices (via <a href="https://bpc.gov.bd/">BPC</a>)</td></tr>
          <tr><td>MFS tariffs &amp; limits</td><td>Official schedules from <a href="https://www.bkash.com/en/charges">bKash</a>, <a href="https://nagad.com.bd/services/charges/">Nagad</a>, <a href="https://www.dutchbanglabank.com/rocket/rocket.html">Rocket</a>, <a href="https://www.upaybd.com/charges">Upay</a>, and <a href="https://www.tapnpay.com.bd/">TAP</a></td></tr>
          <tr><td>Prayer times &amp; Ramadan</td><td><a href="https://islamicfoundation.gov.bd">Islamic Foundation Bangladesh</a>, Ministry of Religious Affairs</td></tr>
          <tr><td>Hotlines</td><td><a href="https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89">Bangladesh National Portal</a>, <a href="https://dghs.gov.bd/">DGHS</a></td></tr>
          <tr><td>GI foods</td><td><a href="https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf">Department of Patents, Designs and Trademarks</a></td></tr>
          <tr><td>Bijoy mapping</td><td>Derived from <a href="https://github.com/BinduLogic/bn-ansi-to-unicode">bn-ansi-to-unicode</a> (MIT)</td></tr>
        </tbody>
      </table>
      <p class="muted">Full list with licences: <a href="https://github.com/rdnasim/desh-api/blob/main/DATA_SOURCES.md">DATA_SOURCES.md</a>. Found a mistake? <a href="https://github.com/rdnasim/desh-api/issues/new/choose">Report it with a source.</a></p>
    </div>
  </div>
</section>
</main>

<footer>
  <div class="wrap grid">
    <div><p><strong>Desh API</strong></p><p class="muted">Free, open API for Bangladesh.</p></div>
    <div><p><a href="/docs">Docs</a> · <a href="/openapi.json">OpenAPI</a> · <a href="https://github.com/rdnasim/desh-api">GitHub</a></p><p><a href="https://github.com/rdnasim/desh-api/blob/main/CONTRIBUTING.md">Contributing</a> · <a href="https://github.com/rdnasim/desh-api/blob/main/PRIVACY.md">Privacy</a></p></div>
    <div><p class="muted">Code MIT · Data CC BY 4.0</p></div>
  </div>
</footer>

<script>
(function () {
  var root = document.documentElement;
  var themeButtons = document.querySelectorAll('[data-theme-set]');
  function showTheme() {
    var current = root.getAttribute('data-theme') || 'auto';
    themeButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-set') === current)); });
  }
  themeButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      var choice = b.getAttribute('data-theme-set');
      if (choice === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', choice);
      try { if (choice === 'auto') localStorage.removeItem('desh-theme'); else localStorage.setItem('desh-theme', choice); } catch (e) {}
      showTheme();
    });
  });
  showTheme();
})();

(function () {
  var origin = location.origin;
  document.getElementById('base-url').textContent = origin;
  ['ex-curl', 'ex-js', 'ex-post'].forEach(function (id) {
    var el = document.getElementById(id);
    el.textContent = el.textContent.split('https://deshapi.riadul.com').join(origin);
  });

  var presets = [
    { label: 'District', method: 'GET', path: '/v1/districts/cumilla' },
    { label: 'Search', method: 'GET', path: '/v1/search?q=comilla' },
    { label: 'Postcode', method: 'GET', path: '/v1/postcodes/1205' },
    { label: 'Taka in words', method: 'GET', path: '/v1/bangla/taka-in-words?amount=1250.50' },
    { label: 'Bangla date', method: 'GET', path: '/v1/bangla/date' },
    { label: 'Transliterate', method: 'GET', path: '/v1/bangla/transliterate?text=ami%20bhalo%20achi' },
    { label: 'Holiday check', method: 'GET', path: '/v1/is-holiday?date=2027-12-16' },
    { label: 'Working days', method: 'GET', path: '/v1/working-days?from=2027-12-01&to=2027-12-31' },
    { label: 'Income tax', method: 'GET', path: '/v1/finance/income-tax?income=1200000&employment_income=1200000' },
    { label: 'Loan EMI', method: 'GET', path: '/v1/finance/emi?principal=1000000&rate=9&months=60' },
    { label: 'Mock people', method: 'GET', path: '/v1/mock/people?count=3&seed=demo' },
    { label: 'Routing number', method: 'GET', path: '/v1/routing/010130065' },
    { label: 'Universities', method: 'GET', path: '/v1/universities?category=public' },
    { label: 'Gold price', method: 'GET', path: '/v1/gold/prices' },
    { label: 'Zakat', method: 'GET', path: '/v1/zakat?wealth=1000000' },
    { label: 'Market prices', method: 'GET', path: '/v1/market/prices?category=edible-oil' },
    { label: 'Fuel prices', method: 'GET', path: '/v1/fuel/prices' },
    { label: 'MFS comparison', method: 'GET', path: '/v1/mfs/compare?amount=5000&action=cash-out&channel=app' },
    { label: 'MFS USSD codes', method: 'GET', path: '/v1/mfs/ussd' },
    { label: 'Prayer times', method: 'GET', path: '/v1/prayer/times?district=dhaka' },
    { label: 'Ramadan calendar', method: 'GET', path: '/v1/prayer/ramadan?district=dhaka' },
    { label: 'Land units', method: 'GET', path: '/v1/land/convert?value=5&from=katha&to=sqft' },
    { label: 'Phone', method: 'POST', path: '/v1/phone/validate', body: '{"number":"+8801712345678"}' },
    { label: 'Bijoy to Unicode', method: 'POST', path: '/v1/convert/bijoy-to-unicode', body: '{"text":"Avgvi \\u2020mvbvi evsjv"}' },
    { label: 'Hotlines', method: 'GET', path: '/v1/hotlines?category=emergency' },
    { label: 'Proverb', method: 'GET', path: '/v1/fun/proverb/random' }
  ];

  var form = document.getElementById('play-form');
  var method = document.getElementById('method');
  var path = document.getElementById('path');
  var body = document.getElementById('body');
  var out = document.getElementById('out');
  var status = document.getElementById('status');
  var timing = document.getElementById('timing');
  var box = document.getElementById('presets');

  // Monospace fonts have no Bangla, which breaks combining vowel signs; set Bangla runs in the text font.
  function render(text) {
    var esc = text.replace(/[&<>]/g, function (ch) { return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'; });
    out.innerHTML = esc.replace(/[\\u0980-\\u09FF\\u200C\\u200D]+/g, function (m) { return '<span class="bn" lang="bn">' + m + '</span>'; });
  }

  function syncBody() { body.hidden = method.value !== 'POST'; }
  method.addEventListener('change', syncBody);

  presets.forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      method.value = p.method;
      path.value = p.path;
      body.value = p.body ? JSON.stringify(JSON.parse(p.body)) : '';
      syncBody();
      send();
    });
    box.appendChild(b);
  });

  function send() {
    var p = path.value.trim();
    if (p.charAt(0) !== '/') p = '/' + p;
    var init = { method: method.value, headers: {} };
    if (method.value === 'POST') { init.headers['content-type'] = 'application/json'; init.body = body.value; }
    status.textContent = 'Sending…';
    status.className = 'status';
    timing.textContent = '';
    var t0 = performance.now();
    fetch(origin + p, init).then(function (res) {
      var ms = Math.round(performance.now() - t0);
      return res.text().then(function (text) {
        status.textContent = res.status + ' ' + (res.ok ? 'OK' : res.statusText || 'Error');
        status.className = 'status' + (res.ok ? '' : ' err');
        timing.textContent = ms + ' ms';
        var pretty;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { pretty = text; }
        render(pretty);
      });
    }).catch(function (err) {
      status.textContent = 'Network error';
      status.className = 'status err';
      out.textContent = String(err);
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); send(); });

  function curlFor() {
    var p = path.value.trim();
    if (p.charAt(0) !== '/') p = '/' + p;
    if (method.value === 'POST') {
      return "curl -X POST '" + origin + p + "' -H 'content-type: application/json' -d '" + body.value + "'";
    }
    return "curl '" + origin + p + "'";
  }

  function copy(text, btn) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      var old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1200);
    });
  }
  document.getElementById('copy-curl').addEventListener('click', function (e) { copy(curlFor(), e.currentTarget); });
  document.querySelectorAll('[data-copy-from]').forEach(function (btn) {
    btn.addEventListener('click', function () { copy(document.getElementById(btn.getAttribute('data-copy-from')).textContent, btn); });
  });
})();
</script>
</body>
</html>
`;
