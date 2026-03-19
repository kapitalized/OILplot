/**
 * Parse a markdown string for a quantities table (e.g. | Label | Value | Unit |).
 * Returns items with label, value (number), unit for use in ai_analyses / Quantities.
 */
export interface ParsedQuantityRow {
  label: string;
  value: number;
  unit: string;
}

export function parseMarkdownQuantitiesTable(markdown: string): ParsedQuantityRow[] {
  const lines = markdown.trim().split(/\r?\n/);
  const rows: ParsedQuantityRow[] = [];
  let pastSeparator = false;
  let skippedHeader = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    if (/^[-:|\s]+$/.test(cells.join(''))) {
      pastSeparator = true;
      continue;
    }
    const label = cells[0] ?? '';
    const valueStr = cells[1] ?? '0';
    const value = Number(valueStr.replace(/,/g, '')) || 0;
    const unit = (cells[2] ?? '').trim() || '—';
    const looksLikeHeader = /^(label|item|name|quantity|value|unit|area|#)$/i.test(label);
    if (looksLikeHeader && !skippedHeader) {
      skippedHeader = true;
      pastSeparator = true;
      continue;
    }
    if (!pastSeparator && /^\d+(\.\d*)?$/.test(valueStr)) pastSeparator = true;
    if (!pastSeparator) continue;
    if (label && !/^[-—]+$/.test(label)) rows.push({ label, value, unit });
  }
  return rows;
}
