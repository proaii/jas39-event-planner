import 'dotenv/config';

const BASE = 'http://localhost:3000/api/events';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`, 
};

async function smoke() {
  try {
    console.log('1. Create Event');
    const createdRes = await fetch(BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Smoke Test Event',
        date: '2025-10-14',
        time: '10:00',
        location: 'Test location',
      }),
    });

    const created = await createdRes.json();
    console.log('→ Created:', created);

    const id = created.id;
    if (!id) throw new Error('No ID returned from create');

    console.log('\n2. Get Event');
    const getRes = await fetch(`${BASE}/${id}`, { headers });
    const fetched = await getRes.json();
    console.log('→ Got:', fetched);

    console.log('\n3. Update Event');
    const patchRes = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ title: 'Smoke Test Updated' }),
    });
    const updated = await patchRes.json();
    console.log('→ Updated:', updated);

    console.log('\n4. Delete Event');
    const delRes = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers });
    console.log('→ Deleted:', delRes.status);

    console.log('\nSmoke test completed successfully!');
  } catch (err) {
    console.error('Smoke test failed:', err);
  }
}

smoke();