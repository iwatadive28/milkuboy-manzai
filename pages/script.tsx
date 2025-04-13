import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ScriptPage() {
  const router = useRouter();
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const [templateData, setTemplateData] = useState<any>(null);

  // テンプレートデータは query か localStorage に保存して受け取る
  useEffect(() => {
    const stored = localStorage.getItem("milkuboy_template");
    if (stored) {
      const parsed = JSON.parse(stored);
      setTemplateData(parsed);
    } else {
      alert("テンプレートが見つかりません。最初からやり直してください。");
      router.push("/template");
    }
  }, [router]);

  useEffect(() => {
    if (templateData) {
      generateScript(templateData);
    }
  }, [templateData]);

  const generateScript = async (template: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      const data = await res.json();
      setScript(data.script || "台本の生成に失敗しました。");
    } catch (e) {
      setScript("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const renderScript = () => {
    return script.split("\n").map((line, idx) => {
      const isBoke = line.startsWith("駒場：");
      const isTsukkomi = line.startsWith("内海：");

      let color = "text-gray-800";
      if (isBoke) color = "text-red-600 font-semibold";
      if (isTsukkomi) color = "text-blue-600 font-semibold";

      return (
        <p key={idx} className={`whitespace-pre-wrap ${color}`}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold text-center text-gray-800">🎭 ミルクボーイ風 漫才台本</h1>

      {loading ? (
        <p className="text-center text-blue-500">AIが台本を生成中です...</p>
      ) : (
        <div className="space-y-4 font-mono text-sm">
          {renderScript()}
        </div>
      )}

      <div className="text-center">
        <button onClick={() => router.push("/")} className="mt-6 bg-gray-500 text-white px-4 py-2 rounded">
          ← トップページへ戻る
        </button>
      </div>
    </div>
  );
}
