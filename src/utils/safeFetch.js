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

export class MissingTokenError extends Error {
  constructor(url) {
    super(`Blocked request to ${url}: No authentication token found in localStorage.`);
    this.name = "MissingTokenError";
  }
}

/**
 * Drop-in fetch() replacement that:
 * 1. Auto-attaches the Bearer token from localStorage
 * 2. Prevents request execution if token is missing (avoids Spring header crashes)
 * 3. Reads the response as text before JSON.parse so that Spring Security
 * HTML redirects are caught and converted to a typed ApiHtmlError instead
 * 4. Throws ApiRequestError for non-2xx responses (silences custom logs on expected 403s)
 */
export async function safeFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  // ── Token Protection Layer ───────────────────────────────────────────────
  if (!token) {
    console.warn(`[Pre-fetch Blocked] Missing token for protected route: ${url}`);
    throw new MissingTokenError(url);
  }

  // Construct request headers dynamically
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/json",
    ...options.headers,
  };

  // If payload is an object, auto-stringify it and set Content-Type
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 204 No Content — nothing to parse
  if (response.status === 204) return null;

  const rawText = await response.text();
  const trimmed = rawText.trim();

  // ── HTML intercept ────────────────────────────────────────────────────────
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    console.error(
      `[HTML Response] Error from ${url} (status ${response.status}):\n`,
      trimmed.substring(0, 400)
    );
    throw new ApiHtmlError(url);
  }

  // ── Non-2xx Responses ─────────────────────────────────────────────────────
  if (!response.ok) {
    // Only log standard red API errors if it's NOT a 403 role rejection
    if (response.status !== 403) {
      console.error(`[API Error] Status [${response.status}] from ${url}:`, rawText);
    }
    throw new ApiRequestError(response.status, rawText, url);
  }

  // ── Safe JSON parse ───────────────────────────────────────────────────────
  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.error(`[Invalid JSON] Content from ${url}:`, rawText);
    throw new Error(`Invalid JSON from ${url}: ${e.message}`);
  }
}