


## 技术说明与扩展

### 项目简介

Yakབོད་སྐད་དྲིས་ལན་AIཡིན་ནས་བོད་སྐད་དྲིས་ལན་ལས་རོགས་ཞིག  


### 目录结构

```
llm-ui-openai-nextjs-example/
├── src/
│   └── app/
│       ├── api/
│       │   └── openai/
│       │       └── route.ts         # 后端流式 API
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
- 以流式（Server-Sent Events）方式将 AI 生成内容逐步推送到前端。
- 用 `NEWLINE` 占位符解决换行符传输问题，前端再还原。

**核心代码片段：**
```ts
export const POST = async (request: Request) => {
  const { prompt } = await request.json();
  // ...
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "ཁྱོད་ནི་Yakབོད་སྐད་དྲིས་ལན་AIཡིན། ཆེད་ལས་ཀྱི་ཡིག་ཚགས་དང་ཤེས་བྱའི་དྲིས་ལན་ལས་རོགས་ཞིག" },
      { role: "user", content: prompt },
    ],
    stream: true,
  });
  // ...
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


