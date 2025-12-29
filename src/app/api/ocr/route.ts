import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { parseReceiptText } from "@/lib/receiptParser";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // convert ke buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // file sementara
    const tempDir = os.tmpdir();
    const imagePath = path.join(tempDir, `struk-${Date.now()}.png`);
    const outputPath = path.join(tempDir, `result-${Date.now()}`);

    fs.writeFileSync(imagePath, buffer);

    // Promise wrapper supaya bisa await
    const text = await new Promise<string>((resolve, reject) => {
      exec(
        `tesseract "${imagePath}" "${outputPath}" -l ind`,
        (error) => {
          fs.unlinkSync(imagePath);

          if (error) {
            reject(error);
            return;
          }

          const resultText = fs.readFileSync(
            `${outputPath}.txt`,
            "utf8"
          );

          fs.unlinkSync(`${outputPath}.txt`);
          resolve(resultText);
        }
      );
    });

    const items = parseReceiptText(text);

    return NextResponse.json({
    rawText: text,
    items,
    });


  } catch (err: any) {
    console.error("OCR CLI Error:", err);
    return NextResponse.json(
      { error: "Gagal membaca struk" },
      { status: 500 }
    );
  }

  
}
