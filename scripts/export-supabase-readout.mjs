import './load-env.mjs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

async function readTable(table) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: supabaseAnonKey,
      authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${table}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

const [posts, comments, reactions] = await Promise.all([
  readTable('posts'),
  readTable('comments'),
  readTable('reactions'),
]);

console.log(JSON.stringify({posts, comments, reactions}, null, 2));
