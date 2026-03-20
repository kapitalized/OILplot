const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const sqlPath = path.join(process.cwd(), 'drizzle', '0017_oil_only_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString });
  await client.connect();
  await client.query(sql);
  await client.end();

  console.log('Applied drizzle/0017_oil_only_schema.sql successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

