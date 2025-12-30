import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { preprocessHarga } from "@/lib/preprocess";
import { parseReceipt } from "@/lib/receiptParser";

function runTesseract(imagePath: string): Promise<string> {
  const out = imagePath.replace(".png", "");

  return new Promise((resolve, reject) => {
    exec(`tesseract "${imagePath}" "${out}" -l ind`, err => {
      if (err) return reject(err);
      const text = fs.readFileSync(out + ".txt", "utf8");
      fs.unlinkSync(out + ".txt");
      resolve(text);
    });
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "File kosong" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const temp = os.tmpdir();

    // ===== OCR NAMA (FULL IMAGE) =====
    const imgNama = path.join(temp, `nama-${Date.now()}.png`);
    fs.writeFileSync(imgNama, buffer);
    const textNama = await runTesseract(imgNama);
    fs.unlinkSync(imgNama);

    // ===== OCR HARGA (KANAN SAJA) =====
    const hargaBuffer = await preprocessHarga(buffer);
    const imgHarga = path.join(temp, `harga-${Date.now()}.png`);
    fs.writeFileSync(imgHarga, hargaBuffer);
    const textHarga = await runTesseract(imgHarga);
    fs.unlinkSync(imgHarga);

    // ===== PARSING =====
    const items = parseReceipt(textNama, textHarga);

    return NextResponse.json({ items });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "OCR gagal" },
      { status: 500 }
    );
  }
}
