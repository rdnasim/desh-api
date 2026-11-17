# `@deshapi/cli` (`desh`)

Fast, zero-dependency command-line interface for [Desh API](https://deshapi.riadul.com) — The open developer API for Bangladesh.

## Installation

```bash
npm install -g @deshapi/cli
```

Or run directly with npx:

```bash
npx @deshapi/cli postcode 1205
```

## Quick Reference

```bash
# Postal & Upazila Lookups
desh postcode 1205

# Number to Bangla Words
desh words 1250000 --taka

# Land Measurements
desh land 5 katha --to sqft

# Format Validators
desh validate nid 1990123456789
desh validate plate "ঢাকা মেট্রো-গ ১১-২২৩৩"
desh validate phone 01711223344

# Prayer Times
desh prayer today --district dhaka

# Daily Gold & Fuel Prices
desh gold
desh fuel

# Scripting & Pipe Integration
desh postcode 1205 --json | jq .data.upazila
```

## Configuration

Set `DESH_API_KEY` in your environment to automatically authenticate with your developer tier.

## License

MIT
