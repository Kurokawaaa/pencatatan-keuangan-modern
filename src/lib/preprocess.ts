import sharp from "sharp";

export async function preprocessHarga(buffer: Buffer) {
  const img = sharp(buffer);
  const meta = await img.metadata();

  if (!meta.width || !meta.height) {
    throw new Error("Invalid image");
  }

  return img
    // ambil 40% kanan (kolom harga)
    .extract({
      left: Math.floor(meta.width * 0.6),
      top: 0,
      width: Math.floor(meta.width * 0.4),
      height: meta.height,
    })
    // perbesar supaya angka kecil kebaca
    .resize({
      width: Math.floor(meta.width * 0.4 * 2),
    })
    .grayscale()
    .threshold(170)
    .toBuffer();
}
