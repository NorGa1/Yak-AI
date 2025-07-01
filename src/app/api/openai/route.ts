// import OpenAI from "openai";
// import { MARKDOWN_PROMPT, NEWLINE } from "../../constants";

// const openai = new OpenAI();

// // should be declared (!)
// export const dynamic = "force-dynamic";

// export const GET = async (request: Request) => {
//   let responseStream = new TransformStream();
//   const writer = responseStream.writable.getWriter();
//   const encoder = new TextEncoder();

//   const completion = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       { role: "system", content: "You are a helpful assistant." },
//       {
//         role: "user",
//         content: MARKDOWN_PROMPT,
//       },
//     ],
//     stream: true,
//   });

//   (async () => {
//     for await (const chunk of completion) {
//       const content = chunk.choices[0].delta.content;
//       if (content !== undefined && content !== null) {
//         // avoid newlines getting messed up
//         const contentWithNewlines = content.replace(/\n/g, NEWLINE);
//         await writer.write(
//           encoder.encode(`event: token\ndata: ${contentWithNewlines}\n\n`),
//         );
//       }
//     }

//     await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
//     await writer.close();
//   })();
//   return new Response(responseStream.readable, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache, no-transform",
//     },
//   });
// };



// import OpenAI from "openai";
// import { MARKDOWN_PROMPT, NEWLINE } from "../../constants";

// // 从环境变量获取 DeepSeek API 密钥
// const apiKey = process.env.DEEPSEEK_API_KEY;
// if (!apiKey) {
//   throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
// }

// const openai = new OpenAI({
//   apiKey: apiKey,
//   baseURL: "https://api.deepseek.com/v1",  // DeepSeek 专用 API 端点
// });

// // 声明为动态路由
// export const dynamic = "force-dynamic";

// export const GET = async (request: Request) => {
//   const responseStream = new TransformStream();
//   const writer = responseStream.writable.getWriter();
//   const encoder = new TextEncoder();

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "deepseek-chat",  // DeepSeek 官方模型标识
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: MARKDOWN_PROMPT },
//       ],
//       stream: true,
//     });

//     (async () => {
//       for await (const chunk of completion) {
//         const content = chunk.choices[0]?.delta?.content;
//         if (content) {
//           // 处理换行符
//           const safeContent = content.replace(/\n/g, NEWLINE);
//           await writer.write(
//             encoder.encode(`event: token\ndata: ${safeContent}\n\n`)
//           );
//         }
//       }
      
//       // 添加结束标记
//       await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
//       await writer.close();
//     })();
//   } catch (error) {
//     console.error("DeepSeek API 错误:", error);
//     // 发送错误事件到前端
//     await writer.write(
//       encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "服务不可用" })}\n\n`)
//     );
//     await writer.close();
//   }

//   return new Response(responseStream.readable, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache, no-transform",
//       "Connection": "keep-alive"
//     },
//   });
// };

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