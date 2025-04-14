import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env.local にセット済み想定
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({ message: "テーマ（本命X）が必要です" });
  }

  const systemPrompt = `
あなたは漫才構成のアシスタントです。
ユーザーが入力した「テーマ（本命X）」を元に、以下の5つの情報をJSON形式で補完してください。

- 上位概念（好きな○○）
- 客席から受け取るもの（漫才の枕に使える小道具）
- 本命ではないもの（notX）
- 特徴ペア（Xfeat, notXfeat）を5組以上。Xfeatは「ネタとしていじりやすい」「意外性やギャップがある」特徴にすること。notXfeatはその逆。

特徴ペアの例（themeが"宮崎"の場合）
"features": [
  { "x": "局が2つしかない", "notx": "誰もが毎朝テレビを楽しみにしてる" },
  { "x": "宮城と間違えられがち", "notx": "一度聴いたら忘れられない特徴的な県名" },
  ...
]

出力形式：
{
  "category": "好きな〇〇",
  "item": "客席から受け取るもの",
  "notX": "本命ではないもの",
  "features": [
    { "x": "Xfeat1", "notx": "notXfeat1" },
    ...
  ]
}

`;

  const userPrompt = `本命（テーマ）は「${theme}」です。`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4o-mini 相当
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // const jsonText = completion.choices[0]?.message?.content?.trim() || "";
    // const result = JSON.parse(jsonText);

    let jsonText = completion.choices[0]?.message?.content?.trim() || "";
    // コードブロックを取り除く
    if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    const result = JSON.parse(jsonText);
    res.status(200).json(result);
  } catch (error) {
    console.error("AI補完エラー:", error);
    res.status(500).json({ message: "AI補完に失敗しました" });
  }
}
