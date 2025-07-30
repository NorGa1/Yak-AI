"use client";
import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiChevronLeft, FiChevronRight, FiX, FiCopy, FiVolume2 } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { FaBrain } from "react-icons/fa";
import { useRouter } from "next/navigation";

// 复用现有代码中的 YakAILogo 和 Sidebar 组件
function YakAILogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg text-white select-none font-tibetan">བོད</span>
      <span className="text-2xl font-extrabold tracking-widest text-white select-none">YAKAI</span>
    </div>
  );
}

const MENU = [
  { label: "གླེང་མོལ།", icon: "💬", path: "/markdown-qa" },
  { label: "ཡིག་སྒྱུར།", icon: "🌐", path: "/markdown-qa/translatePage" },
  // { label: "གླེང་མོལ་གསར་བ།", icon: "➕" },
  // { label: "གླེང་མོལ་འཚོལ་ཞིབ།", icon: "🔍" },
  // { label: "དཔེ་མཛོད་ཁང་།", icon: "📚" },
];

// const SESSIONS = [
//   { id: 1, name: "གླེང་མོལ་ ༡ " },
//   { id: 2, name: "གླེང་མོལ་ ༢ " },
//   { id: 3, name: "གླེང་མོལ་ ༣ " },
// ];

function Sidebar({ onNewChat, currentId, onSelect, show, onClose, collapsed, onToggleCollapse }: {
  onNewChat: () => void;
  currentId: number;
  onSelect: (id: number) => void;
  show: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const router = useRouter();
  return (
    <aside className={`fixed z-30 top-0 left-0 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-100 md:static md:translate-x-0 ${show ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "w-16" : "w-64"} md:block`}>
      <div className={`px-4 py-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onToggleCollapse}
          className={`flex items-center px-3 py-2 rounded-lg bg-zinc-900 text-white/80 hover:bg-zinc-800 cursor-pointer select-none transition ${collapsed ? 'justify-center' : 'justify-end'}`}
          title={collapsed ? "展开侧边栏" : "收缩侧边栏"}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-4">
        {MENU.map((item) => (
          <button 
            key={item.label} 
            onClick={() => router.push(item.path)}
            className={`font-tiebtanchat flex items-center px-3 py-2 rounded-lg text-white/80 bg-zinc-900 hover:bg-zinc-800 cursor-pointer select-none transition ${collapsed ? 'justify-center' : 'gap-2'}`}
            title={collapsed ? item.label : undefined}
          >
            <span>{item.icon}</span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>
      {/* {!collapsed && (
        <div className="flex-1 overflow-y-auto mt-6 px-4">
          <div className="text-xs text-zinc-400 mb-2 font-tiebtanchat text-lg">ལོ་རྒྱུས་གླེང་མོལ།</div>
          <div className="flex flex-col gap-1">
            {SESSIONS.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 rounded-lg text-white/80 bg-zinc-900 hover:bg-zinc-800 cursor-pointer select-none transition"
                title={s.name}
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )} */}
      <div className="absolute bottom-0 left-0 w-full px-4 pb-6 bg-zinc-900">
        <div className="flex flex-col gap-1">
          <button
            className={`font-tiebtanchat flex items-center px-3 py-2 rounded-lg text-white/80 bg-zinc-900 hover:bg-zinc-800 cursor-pointer select-none transition ${collapsed ? 'justify-center' : 'gap-2'}`}
            title={collapsed ? "སྒྲིག་འགོད།" : undefined}
          >
            <span>⚙️</span>
            {!collapsed && "སྒྲིག་འགོད།"}
          </button>
          <button
            className={`font-tiebtanchat flex items-center px-3 py-2 rounded-lg text-white/80 bg-zinc-900 hover:bg-zinc-800 cursor-pointer select-none transition ${collapsed ? 'justify-center' : 'gap-2'}`}
            title={collapsed ? "ཐོ་ཞུགས།" : undefined}
          >
            <span>🚪</span>
            {!collapsed && "ཐོ་ཞུགས།"}
          </button>
        </div>
      </div>
    </aside>
  );
}


// 语言列表
const LANGS = [
  { code: "zho_Hans", name: "རྒྱ་ཡིག" },
  { code: "zho_Hant", name: "中文（繁体）" },
  { code: "eng_Latn", name: "英语" },
  { code: "bod_Tibt", name: "བོད།" },
  { code: "jpn_Jpan", name: "日语" },
  { code: "kor_Hang", name: "韩语" },
  { code: "rus_Cyrl", name: "俄语" },
  { code: "fra_Latn", name: "法语" },
  { code: "deu_Latn", name: "德语" },
  { code: "spa_Latn", name: "西班牙语" },
];

export default function TranslatePage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [srcLang, setSrcLang] = useState("zho_Hans");
  const [tgtLang, setTgtLang] = useState("bod_Tibt");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);



  // 交换语言
  const swapLanguages = () => {
    if (srcLang !== tgtLang) {
      const tempLang = srcLang;
      setSrcLang(tgtLang);
      setTgtLang(tempLang);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  // 清空输入
  const clearInput = () => {
    setInputText("");
    setTranslatedText("");
  };

  // 复制翻译结果
  const copyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      alert("已复制到剪贴板");
    }
  };

  // 朗读翻译结果
  const speakTranslation = () => {
    if (translatedText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = tgtLang.includes('eng') ? 'en-US' : tgtLang.includes('zho') ? 'zh-CN' : tgtLang;
      speechSynthesis.speak(utterance);
    }
  };

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputText]);

  // 翻译功能
  const handleTranslate = async () => {
    if (!inputText.trim() || srcLang === tgtLang) return;
    setTranslatedText("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/translate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          src_lang: srcLang,
          tgt_lang: tgtLang,
        }),
      });

      if (!response.body) {
        setTranslatedText("服务不可用");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const lines = event.split("\n");
          let eventType = "";
          let eventData = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              if (eventData === "") {
                eventData = line.replace("data:", "").trim();
              } else {
                eventData += "\n" + line.replace("data:", "").trim();
              }
            }
          }
          if (eventType === "token") {
            result += eventData;
            setTranslatedText(result);
          } else if (eventType === "finished") {
            setLoading(false);
          } else if (eventType === "error") {
            setTranslatedText("服务不可用");
            setLoading(false);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      setTranslatedText("翻译服务出错，请稍后重试");
      setLoading(false);
    }
  };

  // 移动端侧边栏切换
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // 桌面端侧边栏收缩切换
  const toggleSidebarCollapse = () => setSidebarCollapsed((v) => !v);


  return (
    <div className="flex h-full w-full bg-zinc-900 overflow-hidden relative">
      {/* Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar
          onNewChat={() => {}}
          currentId={1}
          onSelect={() => {}}
          show={true}
          onClose={toggleSidebar}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>
      {/* 移动端侧边栏按钮 */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-zinc-800 text-white p-2 rounded-full shadow-lg border border-zinc-700"
        onClick={toggleSidebar}
      >
        <FiMenu size={24} />
      </button>

      {/* 主翻译区域 - 微软风格优化 */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        {/* YakAI Logo */}
        <div className="absolute top-4 left-4 z-10">
          <YakAILogo />
        </div>


        {/* 翻译界面 - 微软风格上下布局 */}
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 md:p-6 font-tiebtanchat">
          {/* 语言选择器顶部栏 */}
          <div className="flex justify-between items-center bg-white dark:bg-zinc-800 rounded-xl p-3 mb-6 shadow-sm">
            {/* 源语言选择器 */}
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">བསྒྱུར་བྱའི་སྐད་རིགས།</label>
              <div className="relative">
                <select
                  className="w-full bg-transparent text-gray-900 dark:text-white font-medium py-2 pl-3 pr-8 appearance-none focus:outline-none"
                  value={srcLang}
                  onChange={e => setSrcLang(e.target.value)}
                  disabled={loading}
                >
                  {LANGS.map(lang => (
                    <option 
                      key={lang.code} 
                      value={lang.code}
                        className="bg-zinc-800 text-white hover:bg-blue-600" // 关键修复
                      >
                        {lang.name}
                      </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* 交换按钮 */}
            <button 
              onClick={swapLanguages}
              className="mx-4 p-2 rounded-full bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
              title="交换语言"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            
            {/* 目标语言选择器 */}
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">དམིགས་བྱའི་སྐད་རིགས།</label>
              <div className="relative">
                <select
                  className="w-full bg-transparent text-gray-900 dark:text-white font-medium py-2 pl-3 pr-8 appearance-none focus:outline-none"
                  value={tgtLang}
                  onChange={e => setTgtLang(e.target.value)}
                  disabled={loading}
                >
                  {LANGS.map(lang => (
                    <option 
                      key={lang.code} 
                      value={lang.code}
                        className="bg-zinc-800 text-white hover:bg-blue-600" // 关键修复
                      >
                        {lang.name}
                      </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 输入区域 */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ཡི་གེ་ནང་འཇུག</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearInput}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                  title="清空"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className=" relative flex-1">
              <textarea
                ref={textareaRef}
                className="w-full min-h-[150px] bg-transparent text-gray-900 dark:text-white p-4 focus:outline-none resize-none"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="སྒྱུར་དགོས་པའི་ནང་དོན་ནང་འཇུག་བྱ་རོགས།"
                disabled={loading}
              />
              {inputText && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <span className="text-xs text-gray-400">{inputText.length}/2000</span>
                </div>
              )}
            </div>
          </div>

          {/* 翻译按钮 */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleTranslate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
              disabled={loading || !inputText.trim() || srcLang === tgtLang}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ཡིག་སྒྱུར་བྱེད་བཞིན་པ།
                </span>
              ) : (
                <span className="flex items-center">
                  ཡིག་སྒྱུར། <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          {/* 输出区域 */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ཡིག་བསྒྱུར་འབྲས་བུ།</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyTranslation}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                  title="复制"
                >
                  <FiCopy size={18} />
                </button>
                {/* <button 
                  onClick={speakTranslation}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400"
                  title="朗读"
                >
                  <FiVolume2 size={18} />
                </button> */}
              </div>
            </div>

            <div 
              ref={outputRef}
              className="flex-1 min-h-[150px] p-4 text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className={translatedText ? "text-white" : "text-gray-600 dark:text-gray-400"}>
                  {translatedText || "བསྒྱུར་ཟིན་པའི་ནང་དོན།"}
                </div>
              )
              }
            </div>
          </div>

          {/* 底部提示 */}
          <div className="w-full flex justify-center mt-6">
            <span className="text-xs text-gray-500 dark:text-gray-400 select-none font-tiebtanchat">
            YAK Ai translation can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}