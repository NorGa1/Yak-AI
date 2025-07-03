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
    // const completion = await openai.chat.completions.create({
    //   model: "deepseek-chat",
    //   messages: [
    //     //
    //     { role: "system", content: "ཁྱོད་ནི་Yakབོད་སྐད་དྲིས་ལན་AIཡིན། ཆེད་ལས་ཀྱི་ཡིག་ཚགས་དང་ཤེས་བྱའི་དྲིས་ལན་ལས་རོགས་ཞིག" },
    //     // 系统角色设定（中文）
    //     { role: "system", content: "你是 Yak 藏语问答AI，一个专业的文档与知识问答助手。" },
        
    //     // 附加多语言角色设定（英文）
    //     { role: "system", content: "You are a Tibetan expert fluent in Tibetan." },
        
    //     // 用户实际提问
    //     { role: "user", content: prompt },
    //   ],
    //   stream: true,
    // });
const completion = await openai.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    // 系统角色设定（藏文版 - 使用Unicode规范藏文）
    { 
      role: "system", 
      content: "༄༅།། ཁྱོད་རང་ནི་བོད་ཡིག་གི་སྐད་དབྱིབས་ཆེན་པོ་ཞིག་ཡིན། མིང་ལ་Yak AIཟེར།" 
    },
    
    // 系统角色设定（中文专业版）
    { 
      role: "system", 
      content: "你是藏文AI专家，具备以下能力：\n" +
               "1. 藏文自然语言处理\n" +
               "2. 藏文机器翻译\n" +
               "3. 藏文文化知识解答\n\n" 

    },
    
    // 用户实际提问（自动适配中藏英三语）
    { 
      role: "user", 
      content: prompt 
    }
  ],
  stream: true,
  // 增强参数建议（针对藏文优化）
  temperature: 0.3,  // 降低随机性确保术语准确
  max_tokens: 1000   // 预留足够空间用于双语回答
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
