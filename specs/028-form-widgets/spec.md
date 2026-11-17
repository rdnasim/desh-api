# Feature Specification: 028-form-widgets (Embeddable Form Web Components)

**Feature Branch**: `028-form-widgets`  
**Status**: Built  

---

## 1. Overview

E-commerce websites, government portals, and SaaS signup forms in Bangladesh repeatedly rebuild the same form inputs: cascading Division → District → Upazila dropdowns, Bangladeshi phone number inputs with operator logo detection, and National ID format validators.

`@deshapi/widgets` provides zero-dependency, lightweight standard Web Components (Custom Elements) that can be embedded into any HTML page, React, Vue, Svelte, or PHP project with a single `<script>` tag.

---

## 2. Components & Packages

1. **Web Components (`@deshapi/widgets`)**:
   - `<desh-address-selector>`: Cascading Division, District, Upazila, and Union selectors with optional auto-filling postcodes.
   - `<desh-phone-input>`: Phone input with automatic `+880` formatting, live operator identification badge (Grameenphone, Banglalink, Robi, Airtel, Teletalk), and instant validation.
   - `<desh-nid-input>`: National ID input enforcing 10 (smart), 13 (old), or 17 (birth-year prefixed) format rules.

2. **Flutter / Dart SDK & Widgets (`desh_api` on pub.dev)**:
   - `DeshPhoneField`: Native Flutter `TextField` with automatic `+880` badge and real-time operator detection chip.
   - `DeshNidField`: Form-validated Flutter `TextFormField` enforcing 10/13/17 digit formats.
   - `DeshApiClient`: Strongly-typed Dart HTTP client for queries.

3. **React Native Library (`@deshapi/react-native`)**:
   - `DeshPhoneInput`: React Native component with live operator badges.
   - `DeshNidInput`: React Native component with instant format validation.
   - `useDeshApi`: Reusable React hook with loading, error states, and automatic base URL/API key injection.

---

## 3. Usage Example

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@deshapi/widgets"></script>

<form>
  <desh-phone-input name="phone" label="Mobile Number" required></desh-phone-input>
  <desh-address-selector name="address" lang="bn"></desh-address-selector>
</form>
```
