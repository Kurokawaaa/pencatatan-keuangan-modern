export interface Item {
  nama: string;
  qty: number;
  harga: number;
  total: number;
}

/**
 * Ambil harga format: 13,500 | 26.800 | 11000
 */
function extractHarga(text: string): number[] {
  const matches = text.match(/\d{1,3}(?:[.,]\d{3})+/g);
  if (!matches) return [];

  return matches.map(n =>
    parseInt(n.replace(/[.,]/g, ""), 10)
  );
}

/**
 * Ambil nama + qty dari OCR kiri
 */
function parseNama(text: string): string[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l =>
      l.length > 3 &&
      !l.match(/^\d+[.,]?\d*$/) &&      // bukan angka saja
      !l.match(/TOTAL|SUBTOTAL|CASH/i)
    )
    .map(line =>
      line
        .replace(/\b\d+[.,]?\d*\b/g, "")   // hapus angka
        .replace(/\b(ML|GR|G|KG|L|X)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    );
}


export function parseReceipt(
  textNama: string,
  textHarga: string
) {
  const namaList = parseNama(textNama);
  const hargaList = extractHarga(textHarga);

  const items = [];

  for (let i = 0; i < namaList.length; i++) {
    const harga = hargaList[i] ?? 0;

    items.push({
      nama: namaList[i],
      qty: 1,
      harga,
      total: harga,
    });
  }

  return items;
}


