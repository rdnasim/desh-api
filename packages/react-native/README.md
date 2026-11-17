# `@deshapi/react-native`

Official React Native components and React hooks for [Desh API](https://deshapi.riadul.com) — The open developer API for Bangladesh.

## Installation

```bash
npm install @deshapi/react-native @deshapi/client
```

## Quick Start

### 1. Form Inputs with Live Operator Badges & Validation

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { DeshPhoneInput, DeshNidInput } from '@deshapi/react-native';

export function CheckoutForm() {
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {/* Live +880 formatting and GP / Robi / BL / Teletalk operator badge */}
      <DeshPhoneInput
        value={phone}
        onChangeText={setPhone}
        onValidChange={(valid) => console.log('Phone valid:', valid)}
      />

      {/* Instant smart (10), old (13), and 17-digit format indicator */}
      <DeshNidInput
        value={nid}
        onChangeText={setNid}
        onValidChange={(valid, type) => console.log('NID type:', type)}
      />
    </View>
  );
}
```

### 2. React Hook for Desh API

```tsx
import { useEffect, useState } from 'react';
import { useDeshApi } from '@deshapi/react-native';

export function DistrictList() {
  const { request, loading, error } = useDeshApi();
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    request('/v1/districts?division=dhaka').then((data) => {
      if (data) setDistricts(data);
    });
  }, [request]);

  return ...;
}
```

## License

MIT
