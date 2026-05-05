-- Drop mistaken single-column UNIQUEs on fact_prices (blocks multiple dates per oil type).
-- Replaced by fact_prices_series_dedupe_idx in migrate-fact-prices-time-series.mjs
-- (composite: oil_type_id, market, date, source).

ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_oil_type_id_key;
ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_market_location_key;
ALTER TABLE fact_prices DROP CONSTRAINT IF EXISTS fact_prices_price_date_key;

CREATE UNIQUE INDEX IF NOT EXISTS fact_prices_series_dedupe_idx
ON fact_prices (
  oil_type_id,
  COALESCE(market_location, ''),
  price_date,
  COALESCE(source, '')
);
