import { generateMockHourlyForecast } from './src/data/mockForecast';
import {
  resolveLocationTimezone,
  formatEpochToLocalHour,
  getBaseEpochForLocalHour,
  getMsUntilNextHour,
} from './src/utils/timezone';
import type { CurrentWeather, HourlyForecast } from './src/types/weather';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error('❌ FAIL: ' + msg);
    process.exit(1);
  }
  console.log('✅ PASS: ' + msg);
}

console.log('\n==================================================');
console.log('RUNNING COMPREHENSIVE HOURLY FORECAST TESTS');
console.log('==================================================\n');

// ----------------------------------------------------
// TEST 1: Source Data Integrity & Invariant
// ----------------------------------------------------
console.log('--- Test 1: Invariant & Timestamp Continuity (next - current === 3600s) ---');
{
  const mockData = generateMockHourlyForecast('new-delhi');
  assert(mockData.length >= 24, `Mock forecast must provide at least 24 hours, got ${mockData.length}`);

  for (let i = 0; i < mockData.length - 1; i++) {
    const cur = mockData[i];
    const nxt = mockData[i + 1];
    assert(typeof cur.time_epoch === 'number', `Entry ${i} must have numeric time_epoch`);
    assert(typeof nxt.time_epoch === 'number', `Entry ${i + 1} must have numeric time_epoch`);
    const diff = nxt.time_epoch! - cur.time_epoch!;
    assert(diff === 3600, `Entry ${i} -> ${i + 1} epoch difference must be exactly 3600s, got ${diff}`);
    const expectedNextHour = (cur.hour! + 1) % 24;
    assert(nxt.hour === expectedNextHour, `Entry ${i} (${cur.hour}) -> ${i + 1} (${nxt.hour}) hour sequence must be consecutive`);
  }
}

// ----------------------------------------------------
// TEST 2: Exactly 8 Consecutive Hourly Points (Rolling Window Slicing)
// ----------------------------------------------------
console.log('\n--- Test 2: Exactly 8 Consecutive Hourly Points ---');
{
  const dataset = generateMockHourlyForecast('mumbai');
  const slice8 = dataset.slice(0, 8);
  assert(slice8.length === 8, `Rolling window must contain exactly 8 cards, got ${slice8.length}`);

  for (let i = 0; i < 7; i++) {
    const cur = slice8[i];
    const nxt = slice8[i + 1];
    assert(nxt.time_epoch! - cur.time_epoch! === 3600, `Adjacent slot ${i}->${i+1} must be exactly 3600s apart`);
    assert(nxt.hour === (cur.hour! + 1) % 24, `Adjacent slot ${i}->${i+1} must advance by 1 hour`);
  }
}

// ----------------------------------------------------
// TEST 3: Midnight Crossing & Date Transition
// ----------------------------------------------------
console.log('\n--- Test 3: Midnight Crossing & Date Transition ---');
{
  // Epoch for 2026-09-23 22:00:00 IST (10 PM)
  // Let's create an 8-hour sequence spanning 10 PM -> 5 AM next day
  const timezone = 'Asia/Kolkata';
  const startEpoch = 1727110800; // A 10 PM IST timestamp

  const sequence: Array<{ time_epoch: number; hour: number; displayTime: string; dateStr: string }> = [];
  for (let offset = 0; offset < 8; offset++) {
    const epoch = startEpoch + offset * 3600;
    const info = formatEpochToLocalHour(epoch, timezone);
    sequence.push({ time_epoch: epoch, ...info });
  }

  assert(sequence.length === 8, 'Midnight sequence must have 8 slots');
  assert(sequence[0].displayTime === '10 PM', `Slot 0 should be 10 PM, got ${sequence[0].displayTime}`);
  assert(sequence[1].displayTime === '11 PM', `Slot 1 should be 11 PM, got ${sequence[1].displayTime}`);
  assert(sequence[2].displayTime === '12 AM', `Slot 2 should be 12 AM, got ${sequence[2].displayTime}`);
  assert(sequence[3].displayTime === '1 AM', `Slot 3 should be 1 AM, got ${sequence[3].displayTime}`);
  assert(sequence[4].displayTime === '2 AM', `Slot 4 should be 2 AM, got ${sequence[4].displayTime}`);
  assert(sequence[5].displayTime === '3 AM', `Slot 5 should be 3 AM, got ${sequence[5].displayTime}`);
  assert(sequence[6].displayTime === '4 AM', `Slot 6 should be 4 AM, got ${sequence[6].displayTime}`);
  assert(sequence[7].displayTime === '5 AM', `Slot 7 should be 5 AM, got ${sequence[7].displayTime}`);

  // Invariant 1: Time continuity
  for (let i = 0; i < 7; i++) {
    assert(sequence[i + 1].time_epoch - sequence[i].time_epoch === 3600, `Midnight epoch step ${i} must be 3600s`);
    assert(sequence[i + 1].hour === (sequence[i].hour + 1) % 24, `Midnight hour step ${i} must be +1`);
  }

  // Invariant 2: Date rollover at 12 AM
  assert(sequence[0].dateStr === sequence[1].dateStr, '10 PM and 11 PM must share the same date');
  assert(sequence[2].dateStr !== sequence[1].dateStr, '12 AM must roll over to the next day');
  assert(sequence[2].dateStr === sequence[7].dateStr, '12 AM through 5 AM must share the next day date');
}

// ----------------------------------------------------
// TEST 4: All 6 Specific Time-of-Day Edge Cases
// ----------------------------------------------------
console.log('\n--- Test 4: All 6 Required Time-of-Day Edge Cases ---');
const edgeCases = [
  { name: '1. Daytime (10 AM)', startHour: 10, expectedLabels: ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'] },
  { name: '2. Afternoon (3 PM)', startHour: 15, expectedLabels: ['3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'] },
  { name: '3. Evening (6 PM)', startHour: 18, expectedLabels: ['6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM', '1 AM'] },
  { name: '4. Late Night (10 PM)', startHour: 22, expectedLabels: ['10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM'] },
  { name: '5. Near Midnight (11 PM)', startHour: 23, expectedLabels: ['11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM'] },
  { name: '6. Just After Midnight (12 AM)', startHour: 0, expectedLabels: ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM'] },
];

for (const ec of edgeCases) {
  // Derive a base epoch where local hour in UTC is ec.startHour
  const baseEpoch = 1727049600 + ec.startHour * 3600; // using UTC reference
  const labels: string[] = [];
  const epochs: number[] = [];
  const hours: number[] = [];

  for (let i = 0; i < 8; i++) {
    const ep = baseEpoch + i * 3600;
    const info = formatEpochToLocalHour(ep, 'UTC');
    labels.push(info.displayTime);
    epochs.push(ep);
    hours.push(info.hour);
  }

  assert(labels.length === 8, `${ec.name} must produce exactly 8 labels`);
  for (let i = 0; i < 8; i++) {
    assert(labels[i] === ec.expectedLabels[i], `${ec.name} slot ${i} expected "${ec.expectedLabels[i]}", got "${labels[i]}"`);
  }
  for (let i = 0; i < 7; i++) {
    assert(epochs[i + 1] - epochs[i] === 3600, `${ec.name} epochs must increment by 3600s`);
    assert(hours[i + 1] === (hours[i] + 1) % 24, `${ec.name} hours must increment by +1 % 24`);
  }
  console.log(`  Passed edge case: ${ec.name} -> ${labels.join(' → ')}`);
}

// ----------------------------------------------------
// TEST 5: Location Timezone Alignment (Tokyo vs NY vs Delhi)
// ----------------------------------------------------
console.log('\n--- Test 5: Location Timezone Alignment ---');
{
  const testEpoch = 1727067600; // fixed UTC timestamp

  const del = formatEpochToLocalHour(testEpoch, 'Asia/Kolkata');
  const tyo = formatEpochToLocalHour(testEpoch, 'Asia/Tokyo');
  const nyc = formatEpochToLocalHour(testEpoch, 'America/New_York');

  assert(del.displayTime === '10 AM', `Delhi should be 10 AM, got ${del.displayTime}`);
  assert(tyo.displayTime === '2 PM', `Tokyo should be 2 PM (+9), got ${tyo.displayTime}`);
  assert(nyc.displayTime === '1 AM', `New York should be 1 AM (-4 EDT), got ${nyc.displayTime}`);

  // Location timezone resolution
  assert(resolveLocationTimezone('Tokyo') === 'Asia/Tokyo', 'resolveLocationTimezone should resolve Tokyo');
  assert(resolveLocationTimezone('New York') === 'America/New_York', 'resolveLocationTimezone should resolve New York');
  assert(resolveLocationTimezone('Delhi') === 'Asia/Kolkata', 'resolveLocationTimezone should resolve Delhi');
}

// ----------------------------------------------------
// TEST 6: Auto Rolling Window from Cache (Hour Advancement without API Call)
// ----------------------------------------------------
console.log('\n--- Test 6: Rolling Window Advancement from Cache ---');
{
  const cachedForecast = generateMockHourlyForecast('new-delhi');
  assert(cachedForecast.length >= 16, 'Cache must have sufficient hours');

  // Window at hour 0
  const window0 = cachedForecast.slice(0, 8);
  assert(window0.length === 8, 'Window at hour 0 must have 8 slots');

  // Window at hour 1 (rolled forward by 1 hour)
  const window1 = cachedForecast.slice(1, 9);
  assert(window1.length === 8, 'Window at hour 1 must have 8 slots');

  // Old hour 0 dropped, new hour 8 added
  assert(window1[0].time_epoch === window0[1].time_epoch, 'Slot 0 in window 1 should be slot 1 of window 0');
  assert(window1[7].time_epoch === window0[7].time_epoch! + 3600, 'Slot 7 in window 1 should be 1 hour ahead of window 0 slot 7');

  console.log(`  Window 0 start: ${window0[0].time} (${window0[0].time_epoch})`);
  console.log(`  Window 1 start: ${window1[0].time} (${window1[0].time_epoch})`);
}

// ----------------------------------------------------
// TEST 7: Local Hour Boundary Calculation Precision
// ----------------------------------------------------
console.log('\n--- Test 7: Local Hour Boundary Timer Precision ---');
{
  const msRemaining = getMsUntilNextHour('Asia/Kolkata');
  assert(msRemaining > 0 && msRemaining <= 3600000, `msRemaining must be between 0 and 3600000, got ${msRemaining}`);
  console.log(`  Next hour rollover in: ${(msRemaining / 60000).toFixed(2)} minutes`);
}

console.log('\n==================================================');
console.log('🎉 ALL HOURLY FORECAST VERIFICATION TESTS PASSED!');
console.log('==================================================\n');
