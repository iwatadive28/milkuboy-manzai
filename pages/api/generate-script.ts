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

    - 客席から受け取るもの（テーマと関係ない、もらってもうれしくないもの。なんぼあってもいいですからね～のボケにつながる）
    - 本命ではないもの（notX、全く関係ないもの）
    - 特徴ペア（Xfeat, notXfeat）を5組以上。Xfeatは「ネタとしていじりやすい」「意外性やギャップがある」特徴にすること。notXfeatは(theme)の特徴の反対。

    ---
    
    【出力形式】：会話のみ  
    例：
    駒場：どうもミルクボーイです、お願いしますー！  
    内海：お願いしますー！
    
    ---
    
    【構成ルール（厳守）】：
    
    1. 枕：
    - 内海「今、（item）をいただきましたけどもね、こんなんなんぼあってもええですからね」から始まる
    - 駒場「うちのおかんが好きな（category）があるらしいんやけど、その名前忘れてもうてん」という導入
    - 内海「わからへんの？ほな俺がな、オカンの好きな（category）一緒に考えてあげるから、どんな特徴を言うてたか教えてみてくれる？」

    2. 展開：
    - 駒場が Xfeat を1つ紹介 → 内海が「（theme）やないかい！○○言うたら完全に（theme）やないかい」と即断
    - しかし駒場が「おかんが言うには notXfeat って言うててん」と言い出す → 内海が「ほな（theme）ちゃうやないかい！」と否定
    - 即断、否定した後、その判断をした理由を（theme）を皮肉にいじりながら説明する。
    
    ※以下の順序で展開を構成すること：
    - 与えられた特徴量の数まで展開する。
    - 序盤：冷静、あっさり
    - 中盤：皮肉・呆れ気味
    - 終盤：語気が強くなる、例え話が登場
    - 最後の特徴量：論理が破綻、暴走、逆ギレ、無茶ぶりが混ざる

    3. クライマックス：
    - ツッコミのヒートアップがピークに達し、以下の流れを必ず含める：
    　- 駒場：わからへん
    　- 内海：わからへんことない！おかんの好きな（category）は（theme）
    　- 駒場：でもおかんが言うには（theme）ではないって言うねん
    　- 内海：ほな（theme）ちゃうやないか！おかんが（theme）ちゃう言うたら（theme）ちゃうがな！
    　- 駒場：そうやねん
    　- 内海：先言えよ！俺が（Xfeat1〜13どれかで判断した理由）言うてるときどう思てたん？
    　- 駒場：申し訳ないと思ってた
    　- 内海：ほんまにわかれへんがな、それどうなってんねん！
    
    4. オチ：
    - 最後に「おとんが言うには（notX）」というネタを入れる
    - 内海が「いや、絶対ちゃうやろ！」「もうええわ。どうもありがとうございました」で締める
    
    ---
    
    【口調ルール】：
    - 駒場：落ち着いたボケ担当。丁寧に特徴を挙げながら迷わせる
    - 内海：鋭いツッコミ担当。徐々にヒートアップし、後半は皮肉・誇張・暴走が混じる
    - 文字起こしでは必ず「駒場：」「内海：」の形式で記述
    
    ---
    【皮肉・誇張表現ガイド】：
    - 特徴3〜5の否定では、社会的・文化的なギャップや「大げさな例え」を活用すること。
    - 例：「宮崎から偉大なミュージシャンが出てこないのは、HEYx3が1ヶ月遅れてたかららしい」
    - 例：「それがまかり通るなら、（theme）と名乗るには法改正が必要やで」
    ---
    【会話テンションと構造詳細】
    - 駒場は一貫して穏やか。特徴を順に挙げる。
    - 内海は段階的にテンションが上がる。
        - 序盤：テンポ重視
        - 中盤：皮肉・誇張が入る
        - 終盤：混乱・例え話・やや暴走
        - 最後の特徴：論理破綻、矛盾、逆ギレなども許容
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
