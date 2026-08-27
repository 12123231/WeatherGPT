async function testMultilingual() {
  const base = 'http://localhost:5000/api/chat';

  const testCases = [
    {
      id: 'TEST 1 (Hindi Devanagari Query)',
      message: 'आज दिल्ली में बारिश होगी क्या?',
      location: 'New Delhi',
      expected: 'Hindi (Devanagari script)',
    },
    {
      id: 'TEST 2 (English Query)',
      message: 'Will it rain today?',
      location: 'New Delhi',
      expected: 'English',
    },
    {
      id: 'TEST 3 (Hinglish Query)',
      message: 'Aaj Delhi mein baarish hogi kya?',
      location: 'New Delhi',
      expected: 'Hinglish (Latin script)',
    },
    {
      id: 'TEST 4 (Explicit Hindi Request)',
      message: 'हिंदी में बताओ कि आज मौसम कैसा रहेगा',
      location: 'New Delhi',
      expected: 'Hindi (Devanagari script)',
    },
  ];

  console.log('=== WeatherGPT Multilingual API Verification ===\n');

  for (const tc of testCases) {
    console.log(`-----------------------------------------------`);
    console.log(`▶ ${tc.id}`);
    console.log(`Input Query: "${tc.message}"`);
    console.log(`Location   : "${tc.location}"`);
    console.log(`Expected   : ${tc.expected}`);

    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: tc.message, location: tc.location }),
    });

    const json = await res.json();
    console.log(`\nResponse:\n${json.data?.content || JSON.stringify(json)}`);
    console.log(`-----------------------------------------------\n`);
  }
}

testMultilingual().catch(console.error);
