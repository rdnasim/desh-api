package desh

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// DefaultBaseURL is the public production URL of Desh API.
const DefaultBaseURL = "https://deshapi.riadul.com"

// Client is the Desh API client.
type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

// Option configures the Client.
type Option func(*Client)

// WithAPIKey sets the API key for authenticated requests.
func WithAPIKey(key string) Option {
	return func(c *Client) {
		c.APIKey = key
	}
}

// WithBaseURL overrides the default base URL.
func WithBaseURL(url string) Option {
	return func(c *Client) {
		c.BaseURL = strings.TrimRight(url, "/")
	}
}

// WithHTTPClient overrides the default HTTP client.
func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *Client) {
		c.HTTPClient = httpClient
	}
}

// NewClient returns an initialized Desh API client.
func NewClient(opts ...Option) *Client {
	c := &Client{
		BaseURL: DefaultBaseURL,
		HTTPClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

// APIResponse represents the canonical Desh API response envelope.
type APIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Meta    json.RawMessage `json:"meta,omitempty"`
	Error   *APIError       `json:"error,omitempty"`
}

// APIError represents an error returned by Desh API.
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *APIError) Error() string {
	return fmt.Sprintf("desh-api [%s]: %s", e.Code, e.Message)
}

// Do executes an HTTP request and decodes the response data envelope into target.
func (c *Client) Do(ctx context.Context, method, path string, query url.Values, body any, target any) error {
	fullURL := fmt.Sprintf("%s/%s", c.BaseURL, strings.TrimLeft(path, "/"))
	if len(query) > 0 {
		fullURL += "?" + query.Encode()
	}

	var bodyReader io.Reader
	if body != nil {
		buf, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal request body: %w", err)
		}
		bodyReader = bytes.NewReader(buf)
	}

	req, err := http.NewRequestWithContext(ctx, method, fullURL, bodyReader)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if c.APIKey != "" {
		req.Header.Set("X-API-Key", c.APIKey)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response body: %w", err)
	}

	var envelope APIResponse
	if err := json.Unmarshal(respBytes, &envelope); err != nil {
		return fmt.Errorf("unmarshal envelope (status %d): %w", resp.StatusCode, err)
	}

	if !envelope.Success {
		if envelope.Error != nil {
			return envelope.Error
		}
		return fmt.Errorf("request failed with status %d", resp.StatusCode)
	}

	if target != nil && len(envelope.Data) > 0 {
		if err := json.Unmarshal(envelope.Data, target); err != nil {
			return fmt.Errorf("unmarshal data into target: %w", err)
		}
	}

	return nil
}

// District represents a district in Bangladesh.
type District struct {
	ID         string `json:"id"`
	DivisionID string `json:"division_id"`
	NameEn     string `json:"name_en"`
	NameBn     string `json:"name_bn"`
}

// GetDistricts fetches all 64 districts or filters by division.
func (c *Client) GetDistricts(ctx context.Context, division string) ([]District, error) {
	q := url.Values{}
	if division != "" {
		q.Set("division", division)
	}
	var res []District
	if err := c.Do(ctx, http.MethodGet, "/v1/districts", q, nil, &res); err != nil {
		return nil, err
	}
	return res, nil
}
