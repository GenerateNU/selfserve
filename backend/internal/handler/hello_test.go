package handler

import (
	"io"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandler_GetHello(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	h := NewHelloHandler()
	app.Get("/hello", h.GetHello)

	req := httptest.NewRequest("GET", "/hello", nil)
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, 200, resp.StatusCode)

	body, _ := io.ReadAll(resp.Body)
	assert.Equal(t, "Yogurt. Gurt: Yo!", string(body))
}

func TestHandler_GetHelloName(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	h := NewHelloHandler()
	app.Get("/hello/:name", h.GetHelloName)

	tests := []struct {
		name     string
		url      string
		expected string
	}{
		{"simple name", "/hello/Alice", "Yo, Alice!"},
		{"another name", "/hello/Bob", "Yo, Bob!"},
		{"with numbers", "/hello/User123", "Yo, User123!"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest("GET", tt.url, nil)
			resp, err := app.Test(req)
			require.NoError(t, err)

			assert.Equal(t, 200, resp.StatusCode)

			body, _ := io.ReadAll(resp.Body)
			assert.Equal(t, tt.expected, string(body))
		})
	}
}

func TestHandler_GetHelloName_EdgeCases(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	h := NewHelloHandler()
	app.Get("/hello/:name", h.GetHelloName)

	tests := []struct {
		name         string
		nameValue    string
		expectedBody string
	}{
		{"special characters", "!@#$%", "Yo, %21@%23$%25!"},
		{"sql injection pattern", "'; DROP TABLE users; --", "Yo, %27%3B%20DROP%20TABLE%20users%3B%20--!"},
		{"xss pattern", "<script>alert('xss')</script>", "Yo, %3Cscript%3Ealert%28%27xss%27%29%3C%2Fscript%3E!"},
		{"very long name", strings.Repeat("a", 1000), "Yo, " + strings.Repeat("a", 1000) + "!"},
		{"unicode characters", "测试用户", "Yo, %E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7!"},
		{"emoji", "👋🌍", "Yo, %F0%9F%91%8B%F0%9F%8C%8D!"},
		{"spaces", "John Doe", "Yo, John%20Doe!"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			urlPath := "/hello/" + url.PathEscape(tt.nameValue)

			req := httptest.NewRequest("GET", urlPath, nil)
			resp, err := app.Test(req)
			require.NoError(t, err)

			assert.Equal(t, 200, resp.StatusCode)

			body, _ := io.ReadAll(resp.Body)
			assert.Equal(t, tt.expectedBody, string(body))
		})
	}
}

func TestHandler_GetHelloName_InvalidCases(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	h := NewHelloHandler()
	app.Get("/hello/:name", h.GetHelloName)

	tests := []struct {
		name           string
		method         string
		url            string
		expectedStatus int
	}{
		{"missing name parameter", "GET", "/hello/", 404},
		{"wrong route", "GET", "/goodbye/Alice", 404},
		{"wrong method POST", "POST", "/hello/Alice", 405},
		{"wrong method PUT", "PUT", "/hello/Alice", 405},
		{"wrong method DELETE", "DELETE", "/hello/Alice", 405},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest(tt.method, tt.url, nil)
			resp, err := app.Test(req)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}
