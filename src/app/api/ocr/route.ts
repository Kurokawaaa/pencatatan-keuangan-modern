import { error } from "console";
import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export async function POST(req : Request) {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if(!file){
        return NextResponse.json(
            {error : "File tidak ditemukan"},
            {status : 404}
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try{
        const result = await Tesseract.recognize(
            buffer,
            "ind+eng",
            {
                logger: m => console.log(m)
            }
        );
        return NextResponse.json({
            text: result.data.text,
        });
    }catch{
        return NextResponse.json(
            {error: "gagal membaca struk!"},
            {status: 500},

        );
    }

}