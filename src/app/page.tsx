"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function scan() {
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/ocr", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Struk</h2>

      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />
      <button onClick={scan} disabled={loading}>
        {loading ? "Scanning..." : "Scan"}
      </button>

      <table border={1} cellPadding={8} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.nama}</td>
              <td>{i.qty}</td>
              <td>Rp {i.harga.toLocaleString()}</td>
              <td>Rp {i.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
