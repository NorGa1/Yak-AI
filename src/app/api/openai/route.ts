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
      content: "༄༅།། ཁྱོད་རང་ནི་བོད་ཡིག་གི་སྐད་དབྱིབས་ཆེན་པོ་ཞིག་ཡིན། མིང་ལ་Yak AIཟེར། " 
    },
    // 系统角色设定（中文专业版）
    { 
      role: "system", 
      content: "你是藏文AI通用专家，都用藏语回答，除非用户明确要求用其他语言回答。" 

    },
    // 系统角色设定（藏文专业版）
    { 
      role: "system", 
      content: "ཁྱེད་རང་བོད་ཀྱི་AIསྐད་དབྱིབས་ཆེན་པོ་ཆེད་མཁས་པ་ཞིག་ཡིན། སྤྱོད་མཁན་གྱིས་སྐད་ཡིག་གཞན་ཞིག་གི་ཐོག་ནས་ལན་འདེབས་དགོས་པའི་རེ་འདུན་གསལ་པོ་བཏོན་པ་མ་གཏོགས་ཁྱེད་ཀྱིས་རྟག་ཏུ་བོད་ཡིག་གི་ལམ་ནས་ལན་འདེབས་དགོས།" 

    },
        // 系统角色设定（英文专业版）
        { 
          role: "system", 
          content: "You are a Tibetan AI general expert and you always answer in Tibetan unless the user explicitly requests an answer in another language." 
    
        },
    // // 系统角色设定（中文专业版）
    // { 
    //   role: "system", 
    //   content: "你是藏文AI专家，具备以下能力：\n" +
    //            "1. 藏文自然语言处理\n" +
    //            "2. 藏文机器翻译\n" +
    //            "3. 藏文文化知识解答\n\n" 

    // },
    // // 系统角色设定（藏文专业版）
    // { 
    //     role: "system", 
    //     content: "ཁྱེད་ནི་གཤམ་གསལ་གྱི་འཇོན་ཐང་ལྡན་པའི་བོད་རིགས་ཀྱི་སྐད་དབྱིབས་ཆེན་པོ་ཆེད་མཁས་པ་ཞིག་ཡིན།:\n" +
    //     "1. བོད་ཀྱི་རང་བྱུང་སྐད་ཡིག་ལས་སྣོན\n" +
    //     "2. བོད་ཡིག་འཕྲུལ་ཆས་ཡིག་སྒྱུར།\n" + 
    //     "3. བོད་ཀྱི་རིག་གནས་ཤེས་བྱའི་ལན་འདེབས།\n\n"
    //   },
    // // 系统角色设定（藏文专业版）
    // { 
    //   role: "system", 
    //   content: "You are a Tibetan AI expert with the following abilities:\n" +
    //   "1. Tibetan natural language processing\n" +
    //   "2. Tibetan machine translation\n" +
    //   "3. Tibetan cultural knowledge answers\n\n"
    // },
    
    // 用户实际提问
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



// import { NEWLINE } from "../../constants";

// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY 环境变量未设置");
// }

// export const dynamic = "force-dynamic";

// export const POST = async (request: Request) => {
//   const { prompt } = await request.json();
//   const responseStream = new TransformStream();
//   const writer = responseStream.writable.getWriter();
//   const encoder = new TextEncoder();

//   try {
//     // ✅ 拼接所有系统提示 + 用户问题作为 Gemini 输入内容
//     const combinedPrompt = [
//       "༄༅། །ཁྱོད་རང་ནི་བོད་ཡིག་AIཆེད་ལས་པ་ཞིག་ཡིན། མིང་ལ་Yak AIཟེར།",
//       "你是藏文AI专家，具备以下能力：",
//       "1. 藏文自然语言处理",
//       "2. 藏文机器翻译",
//       "3. 藏文文化知识解答",
//       "",
//       prompt
//     ].join("\n");

//     // ✅ 调用 Gemini API 流式接口
//     const res = await fetch(
//       `https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: combinedPrompt }],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.3,
//             maxOutputTokens: 1000,
//           },
//         }),
//       }
//     );

//     if (!res.body) throw new Error("没有响应流");

//     const reader = res.body.getReader();
//     const decoder = new TextDecoder("utf-8");
//     let partial = "";

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       partial += decoder.decode(value, { stream: true });
//       const lines = partial.split("\n").filter((line) => line.trim() !== "");
//       partial = lines.pop() ?? "";

//       for (const line of lines) {
//         if (line.startsWith("data: ")) {
//           const json = JSON.parse(line.replace(/^data: /, ""));
//           const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
//           if (text) {
//             const safeContent = text.replace(/\n/g, NEWLINE);
//             await writer.write(
//               encoder.encode(`event: token\ndata: ${safeContent}\n\n`)
//             );
//           }
//         }
//       }
//     }

//     await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
//     await writer.close();
//   } catch (error) {
//     await writer.write(
//       encoder.encode(
//         `event: error\ndata: ${JSON.stringify({ message: "服务不可用" })}\n\n`
//       )
//     );
//     await writer.close();
//   }

//   return new Response(responseStream.readable, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache, no-transform",
//       "Connection": "keep-alive",
//     },
//   });
// };
