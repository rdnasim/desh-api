# Feature Specification: 028-form-widgets (Embeddable Form Web Components)

**Feature Branch**: `028-form-widgets`  
**Status**: Planned  

---

## 1. Overview

E-commerce websites, government portals, and SaaS signup forms in Bangladesh repeatedly rebuild the same form inputs: cascading Division → District → Upazila dropdowns, Bangladeshi phone number inputs with operator logo detection, and National ID format validators.

`@deshapi/widgets` provides zero-dependency, lightweight standard Web Components (Custom Elements) that can be embedded into any HTML page, React, Vue, Svelte, or PHP project with a single `<script>` tag.

---

## 2. Components

1. `<desh-address-selector>`: Cascading Division, District, Upazila, and Union selectors with optional auto-filling postcodes.
2. `<desh-phone-input>`: Phone input with automatic `+880` formatting, live operator identification badge (Grameenphone, Banglalink, Robi, Airtel, Teletalk), and instant validation.
3. `<desh-nid-input>`: National ID input enforcing 10 (smart), 13 (old), or 17 (birth-year prefixed) format rules.

---

## 3. Usage Example

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@deshapi/widgets"></script>

<form>
  <desh-phone-input name="phone" label="Mobile Number" required></desh-phone-input>
  <desh-address-selector name="address" lang="bn"></desh-address-selector>
</form>
```
