const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://razorpulse-agent.onrender.com").replace(/\/+$/, "");

async function fetchBackend() {
  console.log(`📡 Fetching backend status from: ${BACKEND_URL}`);
  const startTime = Date.now();
  try {
    const healthUrl = `${BACKEND_URL}/health`;
    console.log(`➡️  GET ${healthUrl}...`);
    const res = await fetch(healthUrl);
    const duration = Date.now() - startTime;
    
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Success (${res.status} ${res.statusText}) in ${duration}ms`);
      console.log(`📦 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.error(`⚠️  Backend returned status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Response text:`, text);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Fetch failed after ${duration}ms:`, error?.message || error);
  }
}

fetchBackend();
