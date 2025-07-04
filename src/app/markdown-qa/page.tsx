"use client";
import React, { useState, useRef, useEffect } from "react"; // 导入 React 库
import ReactMarkdown from "react-markdown"; // 导入 react-markdown 库
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // 导入 react-syntax-highlighter 库
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // 导入 vscDarkPlus 样式
import { FiSend, FiMenu } from "react-icons/fi";

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean; // 标记是否为流式消息  
};

// 可选：Logo SVG
function YakAILogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg text-white select-none">བོད</span>
      <span className="text-2xl font-extrabold tracking-widest text-white select-none">YAKAI</span>
    </div>
  );
}

const MENU = [
  { label: "New chat", icon: "📝" },
  { label: "Search chats", icon: "🔍" },
  { label: "Library", icon: "📚" },
];

const SESSIONS = [
  { id: 1, name: "会话一" },
  { id: 2, name: "会话二" },
  { id: 3, name: "会话三" },
];

// 侧边栏组件
function Sidebar({ onNewChat, currentId, onSelect, show, onClose }: {
  onNewChat: () => void;
  currentId: number;
  onSelect: (id: number) => void;
  show: boolean;
  onClose: () => void;
}) {
  return (
    <aside className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-gray-900 text-gray-100 flex flex-col z-30 transition-transform duration-300 md:translate-x-0 ${show ? "translate-x-0" : "-translate-x-full"} md:static md:block`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold" onClick={onNewChat}>新建聊天</button>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={onClose}><FiMenu size={22} /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SESSIONS.map((s) => (
          <div
            key={s.id}
            className={`px-4 py-3 cursor-pointer hover:bg-gray-800 ${currentId === s.id ? "bg-gray-800 font-bold" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            {s.name}
          </div>
        ))}
      </div>
    </aside>
  );
}

// 聊天主区域
function ChatArea({ messages, messagesEndRef }: { messages: Message[]; messagesEndRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div className="flex-1 overflow-y-auto px-2 py-4 md:px-8 md:py-8 bg-gray-100" style={{ marginTop: 56, marginLeft: 256 }}>
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 select-none">
          <span className="text-3xl mb-2">💬</span>
          <span>开始新的对话吧~</span>
        </div>
      )}
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-lg font-bold select-none">
              {msg.role === "user" ? <span>U</span> : <span>🤖</span>}
            </div>
            <div className={`max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] px-4 py-3 rounded-2xl text-base whitespace-pre-wrap break-words shadow border ${msg.role === "user" ? "bg-zinc-700 text-white/90 border-zinc-600" : "bg-zinc-600 text-white border-zinc-500"}`}>
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: any) {
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
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

// 输入区表单结构（底部和欢迎页都统一）
function ChatInput({
  input, setInput, onSend, loading, textareaRef, handleKeyDown, placeholder = "Ask anything"
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={onSend}
      className="max-w-2xl mx-auto w-full flex items-center gap-2 px-4 relative"
      style={{ boxShadow: 'none' }}
    >
      {/* 工具按钮内嵌左侧 */}
      <span className="absolute left-6 bottom-2 z-10">
        <button type="button" className="p-1 rounded bg-zinc-700 text-white/70 hover:bg-zinc-600 transition text-sm" title="Tools" style={{width:28, height:28}}>
          <span role="img" aria-label="tools">🛠️</span>
        </button>
      </span>
      <textarea
        ref={textareaRef}
        className="flex-1 min-h-[84px] max-h-40 bg-zinc-700 rounded-xl pl-4 pr-10 py-2 text-white/90 placeholder-white/40 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base shadow"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        autoFocus
        style={{overflow: 'auto'}}
        disabled={loading}
      />
      {/* 发送按钮内嵌右侧 */}
      <span className="absolute right-6 bottom-2 z-10">
        <button
          type="submit"
          className="p-1 rounded-full bg-zinc-600 hover:bg-zinc-500 text-white transition disabled:opacity-50 text-sm flex items-center justify-center"
          style={{width:20, height:20}}
          disabled={loading || !input.trim()}
          title="发送"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </span>
    </form>
  );
}

export default function YakAIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firstInput, setFirstInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 自动高度 textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // 发送消息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setFirstInput(false);
    setMessages((msgs) => [
      ...msgs,
      { role: "user", content: input },
      { role: "assistant", content: "", streaming: true }
    ]);
    setInput("");
    setLoading(true);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    if (!response.body) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "assistant", content: "服务不可用" },
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
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const event of events) {
        if (event.startsWith("event: token")) {
          const data = event.split("data: ")[1] || "";
          setMessages((msgs) => {
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant" && last.streaming) {
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
            { role: "assistant", content: "服务不可用sbs" },
          ]);
          setLoading(false);
        }
      }
    }
  };

  // 回车发送，Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  // 移动端侧边栏切换
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="flex h-full w-full bg-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed z-30 top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:block`}>
        <div className="flex flex-col gap-6 px-6 pt-8 pb-4">
          <YakAILogo />
        </div>
        <nav className="flex flex-col gap-1 px-4">
          {MENU.map((item) => (
            <button key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-zinc-800 transition text-base font-medium">
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto mt-6 px-4">
          <div className="text-xs text-zinc-400 mb-2">历史会话</div>
          <div className="flex flex-col gap-1">
            {SESSIONS.map((s) => (
              <div key={s.id} className="px-3 py-2 rounded-lg text-white/80 hover:bg-zinc-800 cursor-pointer select-none transition">
                {s.name}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full px-4 pb-6 bg-zinc-900">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition text-base">
            <span>⚙️</span> 设置
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition text-base mt-2">
            <span>🚪</span> 退出
          </button>
        </div>
      </aside>
      {/* 移动端侧边栏按钮 */}
      <button className="fixed top-4 left-4 z-40 md:hidden bg-zinc-800 text-white p-2 rounded-full shadow-lg border border-zinc-700" onClick={toggleSidebar}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-zinc-800 min-w-0 relative overflow-hidden">
        {/* 消息流或欢迎语 */}
        <div className="flex-1 flex flex-col w-full h-0 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center w-full h-full">
              <h1 className="text-3xl font-bold text-white mb-6 select-none">What's on the agenda today?</h1>
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                loading={loading}
                textareaRef={textareaRef}
                handleKeyDown={handleKeyDown}
                placeholder="Ask anything"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col w-full h-full px-0 py-6 overflow-y-auto">
              <div className="w-full max-w-2xl mx-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-lg font-bold select-none">
                        {msg.role === "user" ? <span>U</span> : <span>🤖</span>}
                      </div>
                      <div className={`max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] px-4 py-3 rounded-2xl text-base whitespace-pre-wrap break-words shadow border ${msg.role === "user" ? "bg-zinc-700 text-white/90 border-zinc-600" : "bg-zinc-600 text-white border-zinc-500"}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
        {/* 输入区吸底，全宽 */}
        {messages.length > 0 && (
          <>
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSend}
              loading={loading}
              textareaRef={textareaRef}
              handleKeyDown={handleKeyDown}
            />
            <div className="w-full flex justify-center pb-4 pt-2">
              <span className="text-xs text-gray-400 select-none">YAK Ai can make mistakes. Check important info.</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}