export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://razorpulse-agent.onrender.com").replace(/\/+$/, "");

export type StatusEvent = {
  event: string;
  step?: number;
  message: string;
  status: "running" | "success" | "warning" | "failed";
  payload?: Record<string, unknown>;
};

export type SessionItem = {
  session_id: string;
  merchant_input: string;
  status: string;
  created_at: string;
};

export type AuditLogEntry = {
  session_id: string;
  merchant_input: string;
  status: string;
  trace: Array<{ event?: string; payload?: Record<string, unknown>; error?: string }>;
  scraped_summary: Record<string, unknown>;
  analysis?: Record<string, unknown> | null;
};

export async function checkRoot(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error(`Root health check failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchRecentSessions(): Promise<SessionItem[]> {
  const response = await fetch(`${API_BASE_URL}/sessions`);
  if (!response.ok) {
    throw new Error("Unable to fetch sessions");
  }
  return response.json();
}

export async function fetchAuditEntry(sessionId: string): Promise<AuditLogEntry> {
  const response = await fetch(`${API_BASE_URL}/audit/${encodeURIComponent(sessionId)}`);
  if (!response.ok) {
    throw new Error("Unable to fetch audit entry");
  }
  return response.json();
}

export async function analyzeMerchant(merchantInput: string) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant_input: merchantInput }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Unable to start analysis: ${response.statusText || response.status}`);
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
            yield JSON.parse(raw) as StatusEvent;
          } catch {
            // ignore malformed event payloads
          }
        }
      }
    },
  };
}

