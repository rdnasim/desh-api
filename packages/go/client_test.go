package desh

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_GetDistricts(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/districts" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true,"data":[{"id":"dhaka","division_id":"dhaka","name_en":"Dhaka","name_bn":"ঢাকা"}]}`))
	}))
	defer ts.Close()

	c := NewClient(WithBaseURL(ts.URL))
	districts, err := c.GetDistricts(context.Background(), "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(districts) != 1 {
		t.Fatalf("expected 1 district, got %d", len(districts))
	}
	if districts[0].NameEn != "Dhaka" {
		t.Errorf("expected Dhaka, got %s", districts[0].NameEn)
	}
}
