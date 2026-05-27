// src/utils/safeFetch.js

export class ApiHtmlError extends Error {
  constructor(url) {
    super(
      `Server returned HTML instead of JSON for: ${url}. ` +
      `Token is likely expired or Spring Security is blocking the route.`
    );
    this.name = "ApiHtmlError";
  }
}

export class ApiRequestError extends Error {
  constructor(status, body, url) {
    super(`Request failed [${status}] for ${url}: ${body}`);
    this.name   = "ApiRequestError";
    this.status = status;
    this.body   = body;
  }
}

/**
 * Drop-in fetch() replacement that:
 *  1. Auto-attaches the Bearer token from localStorage
 *  2. Reads the response as text before JSON.parse so that Spring Security
 *     HTML redirects are caught and converted to a typed ApiHtmlError instead
 *     of crashing with "Unexpected token '<'"
 *  3. Throws ApiRequestError for non-2xx responses
 *  4. Logs the first 400 chars of any unexpected HTML for easy diagnosis
 */
export async function safeFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        "application/json",
      ...options.headers,
    },
  });

  // 204 No Content — nothing to parse
  if (response.status === 204) return null;

  const rawText = await response.text();
  const trimmed = rawText.trim();

  // ── HTML intercept ────────────────────────────────────────────────────────
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    // Log a snippet so you can see the Spring error message in the console
    console.error(
      `🚨 HTML response from ${url} (status ${response.status}):\n`,
      trimmed.substring(0, 400)
    );
    throw new ApiHtmlError(url);
  }

  // ── Non-2xx ───────────────────────────────────────────────────────────────
  if (!response.ok) {
    console.error(`❌ API error [${response.status}] from ${url}:`, rawText);
    throw new ApiRequestError(response.status, rawText, url);
  }

  // ── Safe JSON parse ───────────────────────────────────────────────────────
  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.error(`⚠️  Invalid JSON from ${url}:`, rawText);
    throw new Error(`Invalid JSON from ${url}: ${e.message}`);
  }
}