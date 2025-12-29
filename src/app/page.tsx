"use client";

import { useState } from "react";

type Item = {
  nama: string;
  qty: number;
  harga: number;
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [rawText, setRawText] = useState("");
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

    const parsedItems = (data.items || []).map((item: any) => ({
      nama: item.nama,
      qty: item.qty,
      harga: item.angka?.length
        ? item.angka[item.angka.length - 1]
        : 0,
    }));

    setItems(parsedItems);
    setRawText(data.rawText || "");
    setLoading(false);
  };

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const totalBelanja = items.reduce(
    (sum, item) => sum + item.qty * item.harga,
    0
  );

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Scan Struk & Edit</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Membaca..." : "Scan Struk"}
      </button>

      {/* TABLE */}
      {items.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              marginTop: 30,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th align="left">Nama</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={item.nama}
                      onChange={(e) =>
                        updateItem(i, "nama", e.target.value)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>

                  <td align="center">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(i, "qty", Number(e.target.value))
                      }
                      style={{ width: 60, textAlign: "center" }}
                    />
                  </td>

                  <td align="right">
                    <input
                      type="number"
                      value={item.harga}
                      onChange={(e) =>
                        updateItem(i, "harga", Number(e.target.value))
                      }
                      style={{ width: 100, textAlign: "right" }}
                    />
                  </td>

                  <td align="right">
                    Rp {(item.qty * item.harga).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 20 }}>
            Total: Rp {totalBelanja.toLocaleString("id-ID")}
          </h2>
        </>
      )}

      {/* RAW OCR */}
      <details style={{ marginTop: 30 }}>
        <summary>Lihat teks OCR</summary>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 10,
            whiteSpace: "pre-wrap",
            marginTop: 10,
          }}
        >
          {rawText}
        </pre>
      </details>
    </div>
  );
}
