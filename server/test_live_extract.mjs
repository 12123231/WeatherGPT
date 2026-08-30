// Live test against the actual compiled chatService.js using the real Weather API key
// Run from: server/ directory with: node --env-file=.env test_live_extract.mjs

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config(); // load .env

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import of compiled module
const chatSvc = await import(new URL('./dist/services/chatService.js', import.meta.url));

const FALLBACK = 'new-delhi';

const tests = [
  { msg: 'What is the weather in Mumbai?',    expected: 'Mumbai' },
  { msg: 'weather in Mumbai',                  expected: 'Mumbai' },
  { msg: "What's the weather in Delhi?",       expected: 'Delhi' },
  { msg: 'weather in New Delhi',               expected: 'New Delhi' },
  { msg: 'what is weather in Bangalore?',      expected: 'Bengaluru' },
  { msg: 'Mumbai weather',                     expected: 'Mumbai' },
  { msg: 'Mumbai ka mausam',                   expected: 'Mumbai' },
  { msg: 'Delhi mein baarish hogi?',           expected: 'Delhi' },
  { msg: 'What is the weather?',               expected: FALLBACK },
  { msg: 'What is the weather tomorrow?',      expected: FALLBACK },
  { msg: 'What is the weekly forecast for Mumbai?', expected: 'Mumbai' },
];

let passed = 0, failed = 0;
console.log('\n=== Live extractLocationFromMessage test ===\n');
for (const tc of tests) {
  let result;
  try {
    result = await chatSvc.extractLocationFromMessage(tc.msg, FALLBACK);
  } catch (e) {
    result = `ERROR: ${e.message}`;
  }
  const ok = result === tc.expected;
  if (ok) passed++; else failed++;
  const mark = ok ? '✓' : '✗';
  console.log(`${mark} "${tc.msg}"`);
  if (!ok) console.log(`    Expected: "${tc.expected}"   Got: "${result}"`);
}
console.log(`\n${passed}/${passed + failed} passed\n`);
