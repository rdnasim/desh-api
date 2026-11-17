# `desh_api` (Flutter & Dart SDK)

Official Flutter & Dart client library and pre-built form widgets for [Desh API](https://deshapi.riadul.com) — The open developer API for Bangladesh.

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  desh_api: ^0.1.0
```

## Quick Start

### 1. API Client

```dart
import 'package:desh_api/desh_api.dart';

final client = DeshApiClient();

// Fetch districts
final districts = await client.getDistricts(division: 'dhaka');

// Convert digits to Bangla words
final words = await client.numToWords(1250000, taka: true);
```

### 2. Pre-built Flutter Form Widgets

```dart
import 'package:flutter/material.dart';
import 'package:desh_api/desh_api.dart';

// Automatic +880 formatting with real-time mobile operator detection (GP, BL, Robi, Teletalk)
const phoneWidget = DeshPhoneField();

// Format-enforced National ID (10/13/17 digits)
const nidWidget = DeshNidField();
```

## License

MIT
