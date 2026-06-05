import pg from 'pg';

const ref = 'bzluypnxoxliodzdhnmp';
const pass = 'E1r2s3a4n5a6@!';

async function tryDirect() {
  try {
    const client = new pg.Client({
      host: 'db.bzluypnxoxliodzdhnmp.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: pass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    console.log(`✅ DIRECT CONNECT WORKS!`);
    await client.end();
  } catch (e) {
    console.log(`❌ DIRECT: ${e.message}`);
  }
}

async function tryPool() {
  try {
    const client = new pg.Client({
      host: 'aws-1-eu-central-1.pooler.supabase.com',
      port: 6543, // Transaction pooler
      database: 'postgres',
      user: `postgres.${ref}`,
      password: pass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    console.log(`✅ POOLER (6543) WORKS!`);
    await client.end();
  } catch (e) {
    console.log(`❌ POOLER (6543): ${e.message}`);
  }
}

async function trySessionPool() {
  try {
    const client = new pg.Client({
      host: 'aws-1-eu-central-1.pooler.supabase.com',
      port: 5432, // Session pooler
      database: 'postgres',
      user: `postgres.${ref}`,
      password: pass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    console.log(`✅ SESSION POOLER (5432) WORKS!`);
    await client.end();
  } catch (e) {
    console.log(`❌ SESSION POOLER (5432): ${e.message}`);
  }
}

console.log('Testing new password...');
await tryDirect();
await tryPool();
await trySessionPool();
