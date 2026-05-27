export class ApiHtmlError extends Error {
  constructor(url) {
    super(`Server returned HTML (e.g. Login page) instead of JSON for: ${url}.`);
    this.name = "ApiHtmlError";
  }
}

export class ApiRequestError extends Error {
  constructor(status, body, url) {
    super(`Request failed [${status}] for ${url}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

export async function safeFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Missing Auth Token");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) return null;

  const rawText = await response.text();
  
  if (response.status === 403) {
    console.warn(`[403 Forbidden] Access denied to: ${url}. Check backend role permissions.`);
    throw new ApiRequestError(403, "Forbidden", url);
  }

  if (!response.ok) {
    throw new ApiRequestError(response.status, rawText, url);
  }

  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    throw new ApiHtmlError(url);
  }
}