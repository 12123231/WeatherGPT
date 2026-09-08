import { processChatQuery, resetConversationState } from './dist/services/chatService.js';

async function runConversationalTests() {
  console.log('====================================================');
  console.log(' WeatherGPT Conversational Intelligence Verifications');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // TEST 1: Follow-up location context
  console.log('▶ TEST 1: Follow-up location context (Patna -> tomorrow -> day after tomorrow)');
  resetConversationState('test-1');
  const t1_1 = await processChatQuery('What is the weather in Patna?', 'new-delhi', 'test-1');
  console.log('  Q1: "What is the weather in Patna?"\n  A1: ' + t1_1.content);
  assert(t1_1.content.toLowerCase().includes('patna'), 'Q1 mentions Patna');

  const t1_2 = await processChatQuery('Now what about tomorrow?', 'new-delhi', 'test-1');
  console.log('  Q2: "Now what about tomorrow?"\n  A2: ' + t1_2.content);
  assert(t1_2.content.toLowerCase().includes('patna'), 'Q2 persists location Patna');
  assert(t1_2.content.toLowerCase().includes('tomorrow'), 'Q2 provides tomorrow forecast');

  const t1_3 = await processChatQuery('And the day after tomorrow?', 'new-delhi', 'test-1');
  console.log('  Q3: "And the day after tomorrow?"\n  A3: ' + t1_3.content);
  assert(t1_3.content.toLowerCase().includes('patna'), 'Q3 persists location Patna');
  assert(
    t1_3.content.toLowerCase().includes('day after tomorrow') || t1_3.content.toLowerCase().includes('the day after'),
    'Q3 answers day after tomorrow'
  );
  console.log('');

  // TEST 2: Preserve intent when location changes
  console.log('▶ TEST 2: Preserve intent when location changes (3-day forecast Patna -> Chandigarh instead)');
  resetConversationState('test-2');
  const t2_1 = await processChatQuery('What is the 3-day forecast for Patna?', 'new-delhi', 'test-2');
  console.log('  Q1: "What is the 3-day forecast for Patna?"\n  A1:\n' + t2_1.content);
  assert(t2_1.content.toLowerCase().includes('patna'), 'Q1 is for Patna');
  assert(t2_1.content.includes('•') || t2_1.content.toLowerCase().includes('3-day'), 'Q1 is 3-day forecast');

  const t2_2 = await processChatQuery('What about Chandigarh instead?', 'new-delhi', 'test-2');
  console.log('  Q2: "What about Chandigarh instead?"\n  A2:\n' + t2_2.content);
  assert(t2_2.content.toLowerCase().includes('chandigarh'), 'Q2 is for Chandigarh');
  assert(
    t2_2.content.includes('•') || t2_2.content.toLowerCase().includes('3-day') || t2_2.content.toLowerCase().includes('forecast'),
    'Q2 preserves 3-day forecast intent for Chandigarh'
  );
  console.log('');

  // TEST 3: Multi-day rain intent in Hinglish
  console.log('▶ TEST 3: Multi-day rain intent in Hinglish');
  resetConversationState('test-3');
  const t3 = await processChatQuery('Patna mein agle 3 din baarish hogi kya?', 'new-delhi', 'test-3');
  console.log('  Q: "Patna mein agle 3 din baarish hogi kya?"\n  A:\n' + t3.content);
  assert(t3.content.toLowerCase().includes('patna'), 'Q evaluates Patna');
  assert(
    (t3.content.includes('Today:') || t3.content.includes('आज:')) &&
    (t3.content.includes('Tomorrow:') || t3.content.includes('कल:')),
    'Q evaluates all days with probabilities'
  );
  assert(t3.content.toLowerCase().includes('baarish') || t3.content.toLowerCase().includes('rain'), 'Q answers rain possibility');
  console.log('');

  // TEST 4: Multi-day rain intent in Hindi
  console.log('▶ TEST 4: Multi-day rain intent in Hindi (Devanagari)');
  resetConversationState('test-4');
  const t4 = await processChatQuery('दिल्ली में अगले तीन दिनों में बारिश होगी क्या?', 'new-delhi', 'test-4');
  console.log('  Q: "दिल्ली में अगले तीन दिनों में बारिश होगी क्या?"\n  A:\n' + t4.content);
  assert(t4.content.includes('दिल्ली') || t4.content.includes('Delhi'), 'Q evaluates Delhi');
  assert(t4.content.includes('आज:') && t4.content.includes('कल:'), 'Q evaluates all 3 days in Hindi');
  assert(t4.content.includes('बारिश') || t4.content.includes('वर्षा'), 'Q provides Hindi rain evaluation');
  console.log('');

  // TEST 5: Forecast comparison - hottest day
  console.log('▶ TEST 5: Forecast comparison - hottest day in Delhi');
  resetConversationState('test-5');
  const t5 = await processChatQuery('Which day will be the hottest in Delhi?', 'new-delhi', 'test-5');
  console.log('  Q: "Which day will be the hottest in Delhi?"\n  A:\n' + t5.content);
  assert(t5.content.toLowerCase().includes('hottest'), 'Q mentions hottest day');
  assert(t5.content.includes('°C'), 'Q includes temperature comparison values');
  console.log('');

  // TEST 6: Forecast comparison - highest chance of rain in Indore
  console.log('▶ TEST 6: Forecast comparison - highest chance of rain in Indore');
  resetConversationState('test-6');
  const t6 = await processChatQuery('Which day will have the highest chance of rain in Indore?', 'new-delhi', 'test-6');
  console.log('  Q: "Which day will have the highest chance of rain in Indore?"\n  A:\n' + t6.content);
  assert(t6.content.toLowerCase().includes('indore'), 'Q is for Indore');
  assert(t6.content.toLowerCase().includes('highest chance of rain') || t6.content.toLowerCase().includes('highest'), 'Q identifies highest chance');
  assert(t6.content.includes('%'), 'Q lists rain probabilities');
  console.log('');

  // TEST 7: Chandigarh 3-day forecast -> Pune instead
  console.log('▶ TEST 7: Chandigarh 3-day forecast -> Pune instead');
  resetConversationState('test-7');
  const t7_1 = await processChatQuery('Chandigarh ka 3-day forecast batao', 'new-delhi', 'test-7');
  console.log('  Q1: "Chandigarh ka 3-day forecast batao"\n  A1:\n' + t7_1.content);
  assert(t7_1.content.toLowerCase().includes('chandigarh'), 'Q1 is for Chandigarh');

  const t7_2 = await processChatQuery('Pune instead', 'new-delhi', 'test-7');
  console.log('  Q2: "Pune instead"\n  A2:\n' + t7_2.content);
  assert(t7_2.content.toLowerCase().includes('pune'), 'Q2 is for Pune');
  assert(
    t7_2.content.includes('•') || t7_2.content.toLowerCase().includes('3-day') || t7_2.content.toLowerCase().includes('forecast'),
    'Q2 preserves 3-day forecast for Pune'
  );
  console.log('');

  // TEST 8: Mumbai 3 days -> Tomorrow (कल?)
  console.log('▶ TEST 8: Mumbai 3-day forecast in Hindi -> Tomorrow (कल?)');
  resetConversationState('test-8');
  const t8_1 = await processChatQuery('मुंबई का अगले 3 दिनों का मौसम बताओ', 'new-delhi', 'test-8');
  console.log('  Q1: "मुंबई का अगले 3 दिनों का मौसम बताओ"\n  A1:\n' + t8_1.content);
  assert(t8_1.content.includes('मुंबई') || t8_1.content.toLowerCase().includes('mumbai'), 'Q1 is for Mumbai');

  const t8_2 = await processChatQuery('कल?', 'new-delhi', 'test-8');
  console.log('  Q2: "कल?"\n  A2:\n' + t8_2.content);
  assert(t8_2.content.includes('मुंबई') || t8_2.content.toLowerCase().includes('mumbai'), 'Q2 persists Mumbai location');
  assert(t8_2.content.includes('कल'), 'Q2 answers for tomorrow in Hindi');
  console.log('');

  console.log('====================================================');
  console.log(`Results: ${passed}/${total} assertions passed`);
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runConversationalTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
