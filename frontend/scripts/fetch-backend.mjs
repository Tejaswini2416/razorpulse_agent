const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "https://razorpulse-agent.onrender.com").replace(/\/+$/, "");

async function fetchEndpoint(path) {
  const url = `${BACKEND_URL}${path}`;
  const start = Date.now();
  console.log(`➡️  GET ${url}...`);
  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      console.log(`   ✅ Success (${res.status} ${res.statusText}) in ${duration}ms:`, JSON.stringify(data));
    } else {
      console.error(`   ⚠️  HTTP Status ${res.status} ${res.statusText} in ${duration}ms`);
    }
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`   ❌ Failed in ${duration}ms:`, err?.message || err);
  }
}

async function run() {
  console.log(`📡 Connecting to Backend: ${BACKEND_URL}`);
  await fetchEndpoint("/");
  await fetchEndpoint("/health");
}

run();
