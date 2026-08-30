import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

config();

const chatSvc = await import(new URL('./dist/services/chatService.js', import.meta.url));

const tests = [
  "What is the weather in Mumbai?",
  "weather in Mumbai",
  "What's the weather in Delhi?",
  "weather in New Delhi",
  "what is weather in Bangalore?",
  "Mumbai weather",
  "Mumbai ka mausam",
  "Delhi mein baarish hogi?",
  "What is the weather?",
  "What is the weather tomorrow?",
  "What is the weekly forecast for Mumbai?"
];

console.log("\n=== Testing processChatQuery ===\n");
for (const msg of tests) {
  const response = await chatSvc.processChatQuery(msg, 'new-delhi');
  console.log(`QUERY: "${msg}"`);
  console.log(`RESPONSE:\n${response.content}`);
  console.log("--------------------------------------------------\n");
}
