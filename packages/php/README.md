# Desh API PHP SDK (`deshapi/sdk`)

Official PHP client library for [Desh API](https://deshapi.riadul.com) — The open developer API for Bangladesh.

## Installation

```bash
composer require deshapi/sdk
```

## Quick Start

```php
use DeshApi\Client;

$client = new Client();

// Fetch all 64 districts or filter by division
$districts = $client->getDistricts('dhaka');

// Convert digits to Bangla words
$words = $client->numToWords(125000);

// Validate National ID (NID)
$nid = $client->validateNid('19901234567890123');
```

## License

MIT
