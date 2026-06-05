import fs from 'fs';
import pg from 'pg';

let sql = fs.readFileSync('supabase/migrations/__combined_all_migrations.sql', 'utf8');
if (sql.charCodeAt(0) === 0xFEFF) {
  sql = sql.slice(1);
}

const fixOperatorsSql = `
CREATE OR REPLACE FUNCTION public.text_eq_uuid(text, uuid) RETURNS boolean AS $$
SELECT $1 = $2::text;
$$ LANGUAGE sql IMMUTABLE;

DO $$ BEGIN
  CREATE OPERATOR = (LEFTARG = text, RIGHTARG = uuid, PROCEDURE = public.text_eq_uuid, COMMUTATOR = =, HASHES, MERGES);
EXCEPTION WHEN duplicate_function THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.uuid_eq_text(uuid, text) RETURNS boolean AS $$
SELECT $1::text = $2;
$$ LANGUAGE sql IMMUTABLE;

DO $$ BEGIN
  CREATE OPERATOR = (LEFTARG = uuid, RIGHTARG = text, PROCEDURE = public.uuid_eq_text, COMMUTATOR = =, HASHES, MERGES);
EXCEPTION WHEN duplicate_function THEN NULL; END $$;
`;

sql = fixOperatorsSql + sql;

const client = new pg.Client({
  connectionString: 'postgresql://postgres.bzluypnxoxliodzdhnmp:E1r2s3a4n5a6%40%21@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function run() {
  console.log('Connecting to Supabase...');
  await client.connect();
  console.log('Connected. Running RLS & Trigger migrations (104 KB)...');
  try {
    await client.query(sql);
    console.log('✅ All SQL migrations executed successfully!');
  } catch (err) {
    console.error('❌ Error executing SQL:', err.message);
  } finally {
    await client.end();
  }
}

run();
