#!/usr/bin/env node
/**
 * Waits for the SellSight API to be ready before running the test pipeline.
 * Polls /v3/api-docs (served by SpringDoc) every 2 seconds for up to 60 seconds.
 */

const http   = require('http');
const API    = process.env.API_URL ?? 'http://localhost:8080';
const PROBE  = `${API}/v3/api-docs`;
const MAX_MS = 60_000;
const POLL   = 2_000;

function probe() {
  return new Promise((resolve) => {
    http.get(PROBE, (res) => resolve(res.statusCode < 500))
        .on('error',  () => resolve(false));
  });
}

async function main() {
  console.log(`⏳  Waiting for API at ${PROBE}…`);
  const deadline = Date.now() + MAX_MS;

  while (Date.now() < deadline) {
    if (await probe()) {
      console.log('✅  API is ready');
      return;
    }
    await new Promise((r) => setTimeout(r, POLL));
    process.stdout.write('.');
  }

  console.error('\n❌  Timed out waiting for API');
  process.exit(1);
}

main();
