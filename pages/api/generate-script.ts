// pages/api/generate-script.ts
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end("Method not allowed");
    return;
  }

  const { theme, category, item, notX, features } = req.body;

  const formattedFeatures = features
    .map((f: any, i: number) => `Xfeat${i + 1}：「${f.x}」 / notXfeat${i + 1}：「${f.notx}」`)
    .join("\n");

    const prompt = `
    あなたは、お笑いコンビ「ミルクボーイ」の脚本作家です。
    
    以下のテンプレート情報をもとに、ミルクボーイの漫才構成に忠実な台本を会話形式で生成してください。
    
    ---
    【本命（テーマ）】：${theme}
    【上位概念（好きな○○）】：${category}
    【客席から受け取るアイテム】：${item}
    【本命ではないもの（notX）】：${notX}
    【特徴リスト（Xfeat / notXfeatペア）】：（最小5、最大13組）
    ${formattedFeatures}
    ---
    
    【出力形式】：会話のみ  
    例：
    駒場：どうもミルクボーイです、お願いしますー！  
    内海：お願いしますー！
    
    ---
    
    【構成ルール（厳守）】：
    
    1. 枕：
    - 「今、（item）をいただきましたけどもね」「こんなんなんぼあってもええですからね」から始まる
    - 「うちのおかんが好きな（category）があるらしいんやけど、その名前忘れてもうてん」という導入
    
    2. 展開：
    - 駒場が Xfeat を1つ紹介 → 内海が「（theme）やないかい！」と即断
    - しかし駒場が「おかんが言うには notXfeat って言うててん」と言い出す → 内海が「ほな（theme）ちゃうやないかい！」と否定
    
    ※以下の順序で展開を構成すること：
    
    - 特徴1〜2：テンション低めでテンポよく「肯定 → 否定」
    - 特徴3〜5：皮肉を交える。例：「名乗るには荷が重いで！」「それでええと思てんのか？」
    - 特徴6〜9：ツッコミのテンションが上がる。感情が入り始める。例：「どっちやねん！」「もう何でもアリやがな！」
    - 特徴10以降：ツッコミが迷走・暴走する。意味不明な例えや怒涛の否定など、感情のピークへ。例：「AIのAIって何やねん！」「矛盾の五重奏やがな！」
    
    3. クライマックス：
    - ツッコミのヒートアップがピークに達し、以下の流れを必ず含める：
    　- 駒場：わからへん
    　- 内海：わからへんことない！おかんの好きな（category）は（theme）
    　- 駒場：でもおかんが言うには（theme）ではないって言うねん
    　- 内海：ほな（theme）ちゃうやないか！おかんが（theme）ちゃう言うたら（theme）ちゃうがな！
    　- 駒場：そうやねん
    　- 内海：先言えよ！俺が（Xfeat1〜13どれか）言うてるときどう思てたん？
    　- 駒場：申し訳ないと思ってた
    　- 内海：ほんまにわかれへんがな、それどうなってんねん！
    
    4. オチ：
    - 最後に「おとんが言うには〜」というネタを入れる
    - 内海が「いや、絶対ちゃうやろ！」「もうええわ。どうもありがとうございました」で締める
    
    ---
    
    【口調ルール】：
    - 駒場：落ち着いたボケ担当。丁寧に特徴を挙げながら迷わせる
    - 内海：鋭いツッコミ担当。徐々にヒートアップし、後半は皮肉・誇張・暴走が混じる
    - 文字起こしでは必ず「駒場：」「内海：」の形式で記述
    
    ---
    
    【注意点】：
    - 漫才を通じて（theme）の特徴や魅力が自然に理解できるように
    - あくまで「ミルクボーイ風」であり、構成・言い回し・テンポに忠実であること
    - 出力は必ず会話形式のみとし、メタ情報や説明文は不要
    `;
    

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // GPT-4o-miniでも可
      messages: [{ role: "user", content: prompt }],
    });

    const script = completion.choices[0].message.content;
    res.status(200).json({ script });
  } catch (e: any) {
    console.error("生成エラー:", e);
    res.status(500).json({ script: "生成中にエラーが発生しました。" });
  }
}
