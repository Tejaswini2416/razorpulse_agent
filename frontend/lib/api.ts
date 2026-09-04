export interface ScraperStatus {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  data?: Record<string, unknown>;
}

export interface ProductRecommendation {
  product_name: string;
  rationale: string;
  estimated_conversion_lift_percent: number;
  annual_saved_revenue_inr: number;
  confidence_score: number;
}

export interface MerchantAnalysis {
  business_name: string;
  detected_category: string;
  cart_type: string;
  estimated_aov: number;
  risk_score: number;
  kyc_prefill_data: {
    gstin_clue?: string;
    registered_name?: string;
    compliance_checklist: string[];
  };
  recommended_products: ProductRecommendation[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const analyzeMerchantStream = (
  url: string,
  onStatus: (status: ScraperStatus) => void,
  onComplete: (data: Record<string, unknown>) => void,
  onError: (error: string) => void
) => {
  const eventSource = new EventSource(`${API_BASE_URL}/analyze/stream?url=${encodeURIComponent(url)}`);

  eventSource.addEventListener('status', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as ScraperStatus;
      onStatus(data);
    } catch (e) {
      console.error("Failed to parse status event", e);
    }
  });

  eventSource.addEventListener('complete', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      onComplete(data);
    } catch (e) {
      console.error("Failed to parse complete event", e);
    } finally {
      eventSource.close();
    }
  });

  eventSource.addEventListener('error', (event: any) => {
    // If the stream was already closed or finished, don't trigger pipeline failure
    if (eventSource.readyState === EventSource.CLOSED) {
      return;
    }
    try {
      const errData = event.data ? JSON.parse(event.data) as { error?: string } : null;
      if (errData?.error) {
        onError(errData.error);
        eventSource.close();
        return;
      }
    } catch {
      // Not a custom JSON error
    }
    // Only fire if connection is genuinely broken and not completed
    if (eventSource.readyState !== EventSource.CONNECTING) {
      onError("Connection error during live analysis");
      eventSource.close();
    }
  });

  return () => {
    eventSource.close();
  };
};

export const fetchResults = async (url: string): Promise<MerchantAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/results/${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }
  return response.json();
};

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  step: string;
  status: string;
  details: string;
  is_failure_recovery: boolean;
}

export const fetchAuditTrail = async (url: string): Promise<AuditLogEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/audit/${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit trail');
  }
  return response.json();
};
