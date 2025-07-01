# OpenAI example (Next.js)

## How to use

Execute create-llm-ui with pnpm, npm, bun, or yarn to setup the example:

```bash
pnpx create-llm-ui example openai/nextjs llm-ui-openai-nextjs-example
```

```bash
npx create-llm-ui example openai/nextjs llm-ui-openai-nextjs-example
```

```bash
bunx create-llm-ui example openai/nextjs llm-ui-openai-nextjs-example
```

```bash
yarn create llm-ui example openai/nextjs llm-ui-openai-nextjs-example
```



## 技术说明与扩展

### 项目简介

本项目基于 Next.js 14，集成 DeepSeek AI，实现了一个支持 Markdown 各级标题的流式问答网页。用户可在前端输入任意问题，后端通过 DeepSeek AI 实时生成带有 Markdown 标题层级的答案，并以流式（SSE）方式推送到前端，前端实时渲染为美观的 Markdown 格式。

---

### 目录结构

```
llm-ui-openai-nextjs-example/
├── src/
│   └── app/
│       ├── api/
│       │   └── openai/
│       │       └── route.ts         # 后端流式 API，实际调用 DeepSeek
│       ├── markdown-qa/
│       │   └── page.tsx             # 前端流式问答页面
│       ├── constants.ts             # 公共常量（如 NEWLINE 占位符）
│       ├── example.tsx              # 示例页面
│       ├── layout.tsx               # 全局布局
│       └── globals.css              # 全局样式
├── package.json
├── README.md
└── ...
```

---

### 依赖说明

- `next`：React 服务端渲染框架
- `openai`：用于兼容 DeepSeek API 的 SDK
- `react-markdown`：前端 Markdown 渲染
- `remark-gfm`：支持 GitHub 风格 Markdown
- `@llm-ui/markdown`、`@llm-ui/react` 等：LLM UI 相关组件
- 详见 `package.json`

---

### 环境变量

请在项目根目录下新建 `.env` 文件，并配置你的 DeepSeek API 密钥：

```
DEEPSEEK_API_KEY=你的真实API密钥
```

---

### 后端 API 实现（流式 SSE）

`src/app/api/openai/route.ts`  
- 提供 POST 接口，接收前端用户输入的 prompt。
- 使用 OpenAI SDK 兼容 DeepSeek API，`baseURL` 指向 `https://api.deepseek.com/v1`。
- 以流式（Server-Sent Events）方式将 AI 生成内容逐步推送到前端。
- 用 `NEWLINE` 占位符解决换行符传输问题，前端再还原。

**核心代码片段：**
```ts
export const POST = async (request: Request) => {
  const { prompt } = await request.json();
  // ...省略
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "你是一个专业的 Markdown 文档助手，善于用不同层级的 Markdown 标题组织内容。" },
      { role: "user", content: prompt },
    ],
    stream: true,
  });
  // ...流式推送
};
```

---

### 前端页面实现

`src/app/markdown-qa/page.tsx`  
- 输入框：用户输入问题
- 按钮：提交问题
- 实时流式显示 AI 回复，自动渲染为 Markdown
- 使用 `react-markdown` 实现 Markdown 解析和渲染

**核心代码片段：**
```tsx
const response = await fetch("/api/openai", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: input }),
});
// ...流式读取并实时 setAnswer
<ReactMarkdown>{answer}</ReactMarkdown>
```

---

### 启动与访问

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

3. 访问流式问答页面

```
http://localhost:3000/markdown-qa
```

---

### 其他说明

- 若需更换 API 路由名，可将 `/api/openai` 改为 `/api/deepseek`，前后端保持一致即可。
- 若需自定义 Markdown 层级样式，可调整系统 prompt 或前端渲染样式。
- 若遇 404，请确认 `src/app/markdown-qa/page.tsx` 文件存在且重启开发服务器。

---

