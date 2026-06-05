import fs from 'fs';
import pg from 'pg';

let sql = fs.readFileSync('supabase/migrations/__combined_all_migrations.sql', 'utf8');
if (sql.charCodeAt(0) === 0xFEFF) sql = sql.slice(1);

const client = new pg.Client({
  connectionString: 'postgresql://postgres.bzluypnxoxliodzdhnmp:E1r2s3a4n5a6%40%21@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  // Split statements roughly by semicolon and run them one by one to find the exact statement that fails
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.query(statements[i] + ';');
    } catch (e) {
      console.log(`❌ Error in statement ${i}: ${e.message}`);
      console.log(`Statement snippet: ${statements[i].substring(0, 150)}...`);
      break;
    }
  }
  await client.end();
}

run();
