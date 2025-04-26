import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

export default function ScriptPage() {
  const router = useRouter();
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);  // ⭐ 再生中フラグを追加

  const [templateData, setTemplateData] = useState<any>(null);
  const shouldStop = useRef(false);

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

  const playScript = () => {
    if (!script) return;

    shouldStop.current = false;
    setIsPlaying(true);  // ⭐ 再生開始時にON

    let voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        actuallyPlayScript(voices);
      };
    } else {
      actuallyPlayScript(voices);
    }
  };

  const actuallyPlayScript = (voices: SpeechSynthesisVoice[]) => {
    const maleVoice =
      voices.find((v) => (v.name.includes("男性") || v.name.includes("Hiroshi")) && v.lang.startsWith("ja")) ||
      voices.find((v) => v.lang.startsWith("ja")) ||
      voices[0];

    console.log("使用する男性ボイス:", maleVoice?.name);

    const lines = script
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentIndex = 0;

    const speakNextLine = () => {
      if (shouldStop.current) {
        console.log("🛑 停止指示受けたので中断します");
        setIsPlaying(false); // ⭐ 停止時にOFF
        return;
      }

      if (currentIndex >= lines.length) {
        console.log("✅ 全部読み終わりました！");
        setIsPlaying(false); // ⭐ 最後まで読んだらOFF
        return;
      }

      let line = lines[currentIndex];

      if (line.startsWith("駒場：")) {
        line = line.replace(/^駒場：/, "").trim();
      } else if (line.startsWith("内海：")) {
        line = line.replace(/^内海：/, "").trim();
      }

      if (!line) {
        currentIndex++;
        setTimeout(speakNextLine, 100);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(line);
      utterance.voice = maleVoice;
      utterance.lang = "ja-JP";

      const nameLower = maleVoice.name.toLowerCase();
      utterance.rate = nameLower.includes("男性") || nameLower.includes("male") ? 1.2 : 2.0;

      utterance.onend = () => {
        currentIndex++;
        speakNextLine();
      };

      utterance.onerror = (e) => {
        console.error("❌ 読み上げエラー", e);
        currentIndex++;
        speakNextLine();
      };

      speechSynthesis.speak(utterance);
    };

    speechSynthesis.cancel();
    setTimeout(() => {
      speakNextLine();
    }, 300);
  };

  const pauseSpeech = () => speechSynthesis.pause();
  const resumeSpeech = () => speechSynthesis.resume();
  const cancelSpeech = () => {
    console.log("🛑 停止ボタン押されました");
    shouldStop.current = true;
    speechSynthesis.cancel();
    setIsPlaying(false);  // ⭐ 停止時に再生中OFF
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold text-center text-gray-800">🎭 ミルクボーイ風 漫才台本</h1>

      <div className="text-center space-x-2">
        <button
          onClick={playScript}
          disabled={isPlaying}
          className={`px-4 py-2 rounded ${isPlaying ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"} text-white`}
        >
          🎧 台本を読み上げる
        </button>
        <button
          onClick={pauseSpeech}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          ⏸️ 一時停止
        </button>
        <button
          onClick={resumeSpeech}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ▶️ 再開
        </button>
        <button
          onClick={cancelSpeech}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ⏹️ 停止
        </button>
      </div>

      <div className="text-center">
        <button onClick={() => router.push("/")} className="mt-6 bg-gray-500 text-white px-4 py-2 rounded">
          ← トップページへ戻る
        </button>
      </div>

      {loading ? (
        <p className="text-center text-blue-500">AIが台本を生成中です...</p>
      ) : (
        <div className="space-y-4 font-mono text-sm">
          {renderScript()}
        </div>
      )}
    </div>
  );
}
