import { useState } from "react";
import { useRouter } from "next/router";
import TemplateForm from "../components/TemplateForm";

export default function TemplatePage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    const { theme, category, item, notX, features } = data;

    if (!theme.trim()) {
      alert("テーマは必須です！");
      return;
    }

    const needCompletion =
      !category || !item || !notX || features.every((f: any) => !f.x && !f.notx);

    let completed = {};
    setLoading(true);

    if (needCompletion) {
      try {
        const res = await fetch("/api/complete-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        });

        completed = await res.json();
        console.log("🤖 AI補完結果:", completed);
      } catch (e) {
        alert("AIによる補完に失敗しました");
        setLoading(false);
        return;
      }
    }

    const merged = {
      theme,
      category: category || (completed as any).category,
      item: item || (completed as any).item,
      notX: notX || (completed as any).notX,
      features:
        features.some((f: any) => f.x || f.notx)
          ? features
          : (completed as any).features || [],
    };

    setTemplateData(merged);
    localStorage.setItem("milkuboy_template", JSON.stringify(merged));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold text-center text-gray-800">🧾 テンプレート設計シート</h1>
      <p className="text-center text-gray-500">
        テーマと特徴を入力してください（未入力項目はAI補完されます）
      </p>

      <p className="text-xs text-center text-gray-400 mt-6">
        ※本アプリはミルクボーイ様の漫才スタイルにインスパイアされていますが、公式とは関係ありません。
      </p>

      {!submitted ? (
        <>
          {loading && <p className="text-center text-blue-500">AIが補完中です...</p>}
          <TemplateForm onSubmit={handleSubmit} />
        </>
      ) : templateData === null ? (
        <p className="text-center text-blue-500">テンプレートを読み込み中です...</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-1">✅ 入力内容の確認・編集</h2>

          {/* テーマ・基本項目（縦並びに変更） */}
          <div className="space-y-4">
            {[
              ["テーマ", "theme"],
              ["上位概念", "category"],
              ["客席アイテム", "item"],
              ["本命ではないもの（notX）", "notX"],
            ].map(([label, key]) => (
              <label key={key} className="block">
                <span className="font-bold text-gray-700 block mb-1">{label}：</span>
                <input
                  type="text"
                  className="block w-full border border-gray-300 rounded px-4 py-3 text-lg"
                  value={templateData[key]}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>

          {/* 特徴リスト（テキストボックス大きめに） */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🧩 特徴リスト</h3>
            {templateData.features.map((f: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-4">
                <input
                  type="text"
                  className="flex-1 border border-blue-300 rounded px-4 py-3 text-base"
                  placeholder={`Xfeat${i + 1}`}
                  value={f.x}
                  onChange={(e) => {
                    const newFeatures = [...templateData.features];
                    newFeatures[i].x = e.target.value;
                    setTemplateData({ ...templateData, features: newFeatures });
                  }}
                />
                <input
                  type="text"
                  className="flex-1 border border-red-300 rounded px-4 py-3 text-base"
                  placeholder={`notXfeat${i + 1}`}
                  value={f.notx}
                  onChange={(e) => {
                    const newFeatures = [...templateData.features];
                    newFeatures[i].notx = e.target.value;
                    setTemplateData({ ...templateData, features: newFeatures });
                  }}
                />
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => {
                    const newFeatures = templateData.features.filter((_, idx) => idx !== i);
                    setTemplateData({ ...templateData, features: newFeatures });
                  }}
                >
                  削除
                </button>
              </div>
            ))}
            <button
              className="mt-2 text-sm text-blue-600 hover:underline"
              onClick={() =>
                setTemplateData({
                  ...templateData,
                  features: [...templateData.features, { x: "", notx: "" }],
                })
              }
            >
              + 特徴を追加
            </button>
          </div>


          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔁 戻って修正する
            </button>
            <button
              onClick={() => {
                localStorage.setItem("milkuboy_template", JSON.stringify(templateData));
                router.push("/script");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🎤 漫才を生成する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
