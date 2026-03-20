const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({ connectionString });
  await client.connect();

  // 1) Debug: list any drizzle-related tables
  const drizzleRes = await client.query(
    `
      select table_schema, table_name
      from information_schema.tables
      where table_type = 'BASE TABLE'
        and table_name like '%drizzle%'
      order by table_schema, table_name
    `
  );
  console.log('drizzle tables:', drizzleRes.rows.map((r) => `${r.table_schema}.${r.table_name}`));

  // 2) Debug: check whether our oil tables exist
  const oilRes = await client.query(
    `
      select table_schema, table_name
      from information_schema.tables
      where table_type = 'BASE TABLE'
        and (
          table_name like 'dim_%'
          or table_name like 'fact_%'
          or table_name like 'src_%'
        )
      order by table_schema, table_name
    `
  );
  console.log('oil tables:', oilRes.rows.map((r) => `${r.table_schema}.${r.table_name}`));

  // 3) If a migrations table exists, print applied migrations from it
  // Drizzle usually creates this table in a `drizzle` schema.
  // We already saw `drizzle.__drizzle_migrations` in the debug output.
  const applied = await client.query(
    `select * from drizzle.__drizzle_migrations order by 1 desc limit 50`
  );
  const migCols = await client.query(
    `
      select column_name
      from information_schema.columns
      where table_schema='drizzle'
        and table_name='__drizzle_migrations'
      order by ordinal_position
    `
  );
  console.log('drizzle.__drizzle_migrations columns:', migCols.rows.map((r) => r.column_name));
  console.log('drizzle.__drizzle_migrations sample:', applied.rows);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

