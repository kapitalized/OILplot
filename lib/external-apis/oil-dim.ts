/**
 * Shared dim_oil_types resolution for price adapters (Yahoo, EIA, etc.).
 */
import { eq } from 'drizzle-orm';
import { db, sql } from '@/lib/db';
import { dim_oil_types } from '@/lib/db/schema';

export type OilTypeRef = {
  oilTypeCode: string;
  oilTypeName?: string;
};

export async function getOrCreateOilTypeId(market: OilTypeRef): Promise<number> {
  const existing = await db
    .select({ id: dim_oil_types.id })
    .from(dim_oil_types)
    .where(eq(dim_oil_types.code, market.oilTypeCode))
    .limit(1);

  const existingId = existing[0]?.id;
  if (existingId != null) return existingId;

  const name = market.oilTypeName ?? market.oilTypeCode;
  try {
    const inserted = (await sql`
      INSERT INTO dim_oil_types (code, name)
      VALUES (${market.oilTypeCode}, ${name})
      ON CONFLICT (code)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `) as Array<{ id: number }>;

    const insertedId = inserted[0]?.id;
    if (insertedId != null) return insertedId;
  } catch {
    /* race or constraint */
  }

  const reloaded = await db
    .select({ id: dim_oil_types.id })
    .from(dim_oil_types)
    .where(eq(dim_oil_types.code, market.oilTypeCode))
    .limit(1);

  const reloadedId = reloaded[0]?.id;
  if (reloadedId == null) throw new Error(`Failed to resolve dim_oil_types for code=${market.oilTypeCode}`);
  return reloadedId;
}
