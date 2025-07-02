"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean; // 标记是否为流式消息
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // const [messages, setMessages] = useState<Message[]>([
  //   {
  //     role: "assistant",
  //     content: `Yakབོད་སྐད་དྲིས་ལན་AIཡིན་ནས་བོད་སྐད་དྲིས་ལན་ལས་རོགས་ཞིག`
  //   }
  // ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 添加用户消息
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    // 添加一个空的 assistant 消息用于流式填充
    setMessages((msgs) => [...msgs, { role: "assistant", content: "", streaming: true }]);

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    if (!response.body) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "assistant", content: "服务不可用-修改检查" },
      ]);
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // 处理 SSE 格式
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const event of events) {
        if (event.startsWith("event: token")) {
          const data = event.split("data: ")[1] || "";
          setMessages((msgs) => {
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant" && last.streaming) {
              // 流式追加内容
              return [
                ...msgs.slice(0, -1),
                { ...last, content: last.content + data.replace(/<NEWLINE>|\$NEWLINE\$/g, "\n") },
              ];
            }
            return msgs;
          });
        } else if (event.startsWith("event: finished")) {
          setMessages((msgs) => {
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant" && last.streaming) {
              // 标记流式结束
              return [
                ...msgs.slice(0, -1),
                { ...last, streaming: false },
              ];
            }
            return msgs;
          });
          setLoading(false);
        } else if (event.startsWith("event: error")) {
          setMessages((msgs) => [
            ...msgs.slice(0, -1),
            { role: "assistant", content: "服务不可用" },
          ]);
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
       {/* 欢迎艺术大字区域 */}
      <div className="w-full flex flex-col items-center mt-12 mb-6 select-none">
        <h1
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
          style={{ letterSpacing: "0.3em" }}
        >
          Yakབོད་སྐད་དྲིས་ལན་AI
        </h1>
        {/* 可选：副标题 */}
        {/* <div className="mt-2 text-lg text-gray-500 font-medium">
          智能问答，助力高效创作
        </div> */}
      </div>
      {/* 聊天消息区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 shadow ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900 border"
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
              {msg.streaming && (
                <span className="animate-pulse text-gray-400 ml-1">▍</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="flex items-center p-4 bg-white border-t"
      >
        <input
          className="flex-1 border rounded px-3 py-2 mr-2 focus:outline-none bg-gray-100 text-gray-900 focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的问题..."
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          type="submit"
          disabled={loading || !input}
        >
          发送
        </button>
      </form>
    </div>
  );
}