#!/usr/bin/env node
// Simple Blackbox API key tester.
// Usage:
//   BLACKBOX_API_KEY=your_key node scripts/test-blackbox-key.mjs

const endpoint = 'https://cloud.blackbox.ai/api/mcp';

async function main() {
  const key = process.env.BLACKBOX_API_KEY || process.env.BLACKBOX_KEY || process.env.BLACKBOX_API_TOKEN;
  if (!key) {
    console.error('Missing BLACKBOX_API_KEY environment variable.');
    process.exit(2);
  }

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json'
      }
    });

    console.log('HTTP', res.status, res.statusText);
    const text = await res.text();
    try {
      console.log('Body:', JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      console.log('Body:', text);
    }
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exit(1);
  }
}

main();
