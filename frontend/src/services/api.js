/**
 * RazorPulse API Service
 * Handles communication between Frontend (Vercel / Local) and Backend (Render / Local)
 */

// Resolves Vite (import.meta.env) or Next.js / Node (process.env) environment variables cleanly
const getBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "https://razorpulse-agent.onrender.com";
};

export const API_BASE_URL = getBaseUrl().replace(/\/+$/, "");

/**
 * Generic JSON request wrapper with detailed HTTP error logging
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage = `HTTP ${response.status} (${response.statusText}) while calling ${endpoint}: ${errorBody || "No response body"}`;
      console.error(`[API Error] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error(`[API Connection Failed] Could not reach backend at ${url}. Check CORS and deployment status.`);
      throw new Error(`Connection to backend failed (${url}). Please ensure the server is online and CORS is configured.`);
    }
    throw error;
  }
}

/**
 * Root Health Check (GET /)
 */
export async function checkRoot() {
  return request("/");
}

/**
 * Service Health Check (GET /health)
 */
export async function checkHealth() {
  return request("/health");
}

/**
 * Fetch Recent Analysis Sessions (GET /sessions)
 */
export async function fetchSessions() {
  return request("/sessions");
}

/**
 * Fetch Single Audit Trail (GET /audit/:sessionId)
 */
export async function fetchAuditLog(sessionId) {
  return request(`/audit/${encodeURIComponent(sessionId)}`);
}

/**
 * Stream Merchant Analysis (POST /analyze)
 */
export async function analyzeMerchantStream(merchantInput) {
  const url = `${API_BASE_URL}/analyze`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ merchant_input: merchantInput }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`Analysis request failed: HTTP ${response.status} ${response.statusText} - ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return {
    async *events() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const chunk of parts) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;
          const raw = line.replace(/^data:\s*/, "");
          if (!raw) continue;
          try {
            yield JSON.parse(raw);
          } catch (err) {
            console.warn("[API SSE Parse Warning]", err, raw);
          }
        }
      }
    },
  };
}
