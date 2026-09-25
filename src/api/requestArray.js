import API_URL from "../api.js";

export const REQUEST_TIMEOUT_MS = 60000;

export const JOBS_CACHE_MAX_AGE_MS = 60000;
const JOBS_CACHE_KEY = "karviamJobsCache";
let jobsRequest = null;

const isObjectArray = (data) => Array.isArray(data) &&
  data.every((item) => item && typeof item === "object" && !Array.isArray(item));

export function readJobsCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(JOBS_CACHE_KEY));
    const age = Date.now() - cached?.timestamp;
    if (isObjectArray(cached?.jobs) && Number.isFinite(cached.timestamp) &&
        age >= 0 && age < JOBS_CACHE_MAX_AGE_MS) return cached.jobs;
  } catch { /* Storage may be disabled or contain invalid JSON. */ }
  return null;
}

// Always revalidate; cache freshness only controls the initial render.
// Keep the shared request alive across unmounts and StrictMode effect replay.
export function requestJobs() {
  if (!jobsRequest) {
    jobsRequest = requestArray("/api/jobs", { cache: "no-store" })
      .then((jobs) => {
        try {
          localStorage.setItem(JOBS_CACHE_KEY, JSON.stringify({ jobs, timestamp: Date.now() }));
        } catch { /* A storage failure must not hide successful API data. */ }
        return jobs;
      })
      .finally(() => { jobsRequest = null; });
  }
  return jobsRequest;
}

// Bound both the connection and response-body read, while allowing slow cold starts.
export async function requestArray(path, { token, signal, cache, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
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
      ...(cache ? { cache } : {}),
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
