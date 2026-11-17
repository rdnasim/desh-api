# `@deshapi/widgets`

Zero-dependency standard Web Components (Custom Elements) for Bangladesh web applications:

- `<desh-address-selector>`: Cascading Division, District, and Upazila dropdowns with English and Bangla support.
- `<desh-phone-input>`: Phone input with automatic `+880` formatting, live operator prefix detection (Grameenphone, Banglalink, Robi, Airtel, Teletalk), and validation badge.
- `<desh-nid-input>`: National ID input enforcing 10 (smart), 13 (old), or 17 (extended) digit formats.

## Quick Start (CDN)

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@deshapi/widgets/dist/index.js"></script>

<form>
  <desh-phone-input name="phone"></desh-phone-input>
  <desh-nid-input name="nid"></desh-nid-input>
  <desh-address-selector lang="bn"></desh-address-selector>
</form>
```

## Installation (npm)

```bash
npm install @deshapi/widgets
```

```ts
import '@deshapi/widgets';
```

## License

MIT
