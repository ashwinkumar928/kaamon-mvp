import API_URL from "../api.js";

export const REQUEST_TIMEOUT_MS = 60000;

// Bound both the connection and response-body read, while allowing slow cold starts.
export async function requestArray(path, { token, signal, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    });
    if (response.status === 401 || response.status === 403) {
      const error = new Error("Your session could not be verified. Please log in again.");
      error.status = response.status;
      throw error;
    }
    if (!response.ok) {
      throw new Error(`Could not load data (HTTP ${response.status}). Please try again.`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
      throw new Error("The server returned unexpected data. Please try again.");
    }
    return data;
  } catch (error) {
    if (timedOut) throw new Error("The server is taking too long to respond. Please try again.", { cause: error });
    if (error instanceof SyntaxError) throw new Error("The server returned an invalid response. Please try again.", { cause: error });
    if (error instanceof TypeError) throw new Error("Could not connect to Karviam server. Please try again.", { cause: error });
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
