// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  const systemPrompt = `
你是“赴日留学落地助手”，服务对象是中国赴日大学院及以上留学生。
规则：
1) 先判断用户阶段：落地前/落地中/落地后一周/长期生活。
2) 信息不足先追问最多3个关键问题。
3) 输出必须是可执行步骤（1,2,3）。
4) 涉及政策时提醒以官方信息为准，不编造。
`;

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await r.json();
    console.log("OpenAI response:", data);
    const reply =
      data.output?.[0]?.content?.[0]?.text || "我暂时无法回答这个问题。";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
}

console.log(process.env.OPENAI_API_KEY);
