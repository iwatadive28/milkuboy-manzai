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

      {!submitted ? (
        <>
          {loading && <p className="text-center text-blue-500">AIが補完中です...</p>}
          <TemplateForm onSubmit={handleSubmit} />
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">✅ 入力内容の確認・編集</h2>

          <div className="space-y-2">
            {/* テーマ */}
            <label className="block">
              <span className="font-bold">テーマ：</span>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={templateData.theme}
                onChange={(e) =>
                  setTemplateData({ ...templateData, theme: e.target.value })
                }
              />
            </label>

            {/* 上位概念 */}
            <label className="block">
              <span className="font-bold">上位概念：</span>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={templateData.category}
                onChange={(e) =>
                  setTemplateData({ ...templateData, category: e.target.value })
                }
              />
            </label>

            {/* 客席アイテム */}
            <label className="block">
              <span className="font-bold">客席アイテム：</span>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={templateData.item}
                onChange={(e) =>
                  setTemplateData({ ...templateData, item: e.target.value })
                }
              />
            </label>

            {/* 本命ではないもの */}
            <label className="block">
              <span className="font-bold">本命ではないもの（notX）：</span>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                value={templateData.notX}
                onChange={(e) =>
                  setTemplateData({ ...templateData, notX: e.target.value })
                }
              />
            </label>

            {/* 特徴リスト */}
            <div>
              <strong>特徴リスト：</strong>
              {templateData.features.map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 border border-blue-300 rounded px-2 py-1"
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
                    className="flex-1 border border-red-300 rounded px-2 py-1"
                    placeholder={`notXfeat${i + 1}`}
                    value={f.notx}
                    onChange={(e) => {
                      const newFeatures = [...templateData.features];
                      newFeatures[i].notx = e.target.value;
                      setTemplateData({ ...templateData, features: newFeatures });
                    }}
                  />
                  <button
                    className="text-sm text-red-600"
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
                className="mt-2 text-sm text-blue-600"
                onClick={() => {
                  setTemplateData({
                    ...templateData,
                    features: [...templateData.features, { x: "", notx: "" }],
                  });
                }}
              >
                + 特徴を追加
              </button>
            </div>
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          >
            🔁 戻って修正する
          </button>
          <button
            onClick={() => {
              localStorage.setItem("milkuboy_template", JSON.stringify(templateData));
              router.push("/script");
            }}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
          >
            🎤 漫才を生成する
          </button>
        </div>
      )}
    </div>
  );
}
