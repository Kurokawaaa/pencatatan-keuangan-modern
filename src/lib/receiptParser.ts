// lib/receiptParser.ts

export type ParsedItem = {
  nama: string;
  qty: number;
  angka: number[];
};

export function parseReceiptText(text: string): ParsedItem[] {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const items: ParsedItem[] = [];

  for (const line of lines) {
    if (
      line.includes("TOTAL") ||
      line.includes("CANCEL") ||
      line.includes("DISC")
    ) continue;

    if (!/[A-Z]/i.test(line)) continue;

    const qty = extractQty(line);
    const angka = extractNumbers(line);
    const nama = extractName(line);

    if (!nama) continue;

    items.push({ nama, qty, angka });
  }

  return items;
}

function extractQty(line: string): number {
  const match =
    line.match(/\b(\d+)\s*X\b/i) ||
    line.match(/\bX\s*(\d+)\b/i) ||
    line.match(/\b(\d+)\b$/);

  return match ? parseInt(match[1], 10) : 1;
}

function extractNumbers(line: string): number[] {
  const matches = line.match(/\d+[.,']?\d*/g);
  if (!matches) return [];

  return matches.map(n =>
    parseInt(n.replace(/[.,']/g, ""), 10)
  );
}

function extractName(line: string): string {
  return line
    .replace(/\d+[.,']?\d*/g, "")
    .replace(/\bX\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
