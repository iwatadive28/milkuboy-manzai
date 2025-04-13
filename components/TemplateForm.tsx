import { useState } from "react";

export default function TemplateForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [notX, setNotX] = useState("");
  const [features, setFeatures] = useState([{ x: "", notx: "" }]);

  const handleFeatureChange = (index: number, field: "x" | "notx", value: string) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const addFeatureRow = () => {
    if (features.length < 13) {
      setFeatures([...features, { x: "", notx: "" }]);
    }
  };

  const removeFeatureRow = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!theme.trim()) return alert("テーマ（本命X）は必須です！");
    onSubmit({ theme, category, item, notX, features });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-bold">テーマ（本命X）※必須</label>
        <input className="border px-3 py-1 rounded w-full" value={theme} onChange={(e) => setTheme(e.target.value)} />
      </div>
      <div>
        <label className="block font-bold">上位概念（好きな○○）</label>
        <input className="border px-3 py-1 rounded w-full" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="block font-bold">客席から受け取るもの</label>
        <input className="border px-3 py-1 rounded w-full" value={item} onChange={(e) => setItem(e.target.value)} />
      </div>
      <div>
        <label className="block font-bold">本命ではないもの（notX）</label>
        <input className="border px-3 py-1 rounded w-full" value={notX} onChange={(e) => setNotX(e.target.value)} />
      </div>

      <div>
        <label className="block font-bold">特徴リスト（最大13個）</label>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="border px-2 py-1 flex-1"
                placeholder={`Xfeat${i + 1}`}
                value={f.x}
                onChange={(e) => handleFeatureChange(i, "x", e.target.value)}
              />
              <input
                className="border px-2 py-1 flex-1"
                placeholder={`notXfeat${i + 1}`}
                value={f.notx}
                onChange={(e) => handleFeatureChange(i, "notx", e.target.value)}
              />
              {features.length > 1 && (
                <button className="text-red-500" onClick={() => removeFeatureRow(i)}>✕</button>
              )}
            </div>
          ))}
          {features.length < 13 && (
            <button className="text-blue-600 underline mt-1" onClick={addFeatureRow}>＋特徴を追加</button>
          )}
        </div>
      </div>

      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        確認して次へ
      </button>
    </div>
  );
}
