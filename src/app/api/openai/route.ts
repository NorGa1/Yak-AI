import OpenAI from "openai";
import { NEWLINE } from "../../constants";

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.deepseek.com/v1",
});

export const dynamic = "force-dynamic";

// 新增 POST 方法
export const POST = async (request: Request) => {
  const { prompt } = await request.json();
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        //
        { role: "system", content: "ཁྱོད་ནི་Yakབོད་སྐད་དྲིས་ལན་AIཡིན། ཆེད་ལས་ཀྱི་ཡིག་ཚགས་དང་ཤེས་བྱའི་དྲིས་ལན་ལས་རོགས་ཞིག" },
        // 系统角色设定（中文）
        { role: "system", content: "你是 Yak 藏语问答AI，一个专业的文档与知识问答助手。" },
        
        // 附加多语言角色设定（英文）
        { role: "system", content: "You are also a multilingual expert fluent in Tibetan and English." },
        
        // 用户实际提问
        { role: "user", content: prompt },
      ],
      stream: true,
    });

    (async () => {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          const safeContent = content.replace(/\n/g, NEWLINE);
          await writer.write(
            encoder.encode(`event: token\ndata: ${safeContent}\n\n`)
          );
        }
      }
      await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
      await writer.close();
    })();
  } catch (error) {
    await writer.write(
      encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "服务不可用" })}\n\n`)
    );
    await writer.close();
  }

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    },
  });
};
