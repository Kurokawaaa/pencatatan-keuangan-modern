"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    const res = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setText(data.text);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>OCR Struk Belanja</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Membaca..." : "Scan Struk"}
      </button>

      <pre
        style={{
          marginTop: 20,
          background: "#f5f5f5",
          padding: 10,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </pre>
    </div>
  );
}
