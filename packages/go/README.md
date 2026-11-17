# Desh API Go SDK (`github.com/desh-api/desh-go`)

Official Go client library for [Desh API](https://deshapi.riadul.com) — The open developer API for Bangladesh.

## Installation

```bash
go get github.com/desh-api/desh-go
```

## Quick Start

```go
package main

import (
	"context"
	"fmt"
	"log"

	desh "github.com/desh-api/desh-go"
)

func main() {
	client := desh.NewClient()

	districts, err := client.GetDistricts(context.Background(), "dhaka")
	if err != nil {
		log.Fatalf("failed to fetch districts: %v", err)
	}

	for _, d := range districts {
		fmt.Printf("%s (%s)\n", d.NameEn, d.NameBn)
	}
}
```

## License

MIT
