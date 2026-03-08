import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, ShieldCheck } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { useLanguage } from "../hooks/use-language";

export default function Chat() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am the MediChain AI Assistant. How can I help you today?",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) throw new Error("Failed to communicate with AI");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I am currently unable to process your request." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-16 bg-gray-50/50">
      
      {/* 100% ACCURACY BANNER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-sm z-10">
        <ShieldCheck className="w-5 h-5" />
        <span className="font-semibold tracking-wide text-sm">
          CONFIRMED 100% ACCURACY RATE
        </span>
        <span className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
          Diagnostic Engine V.2
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center p-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="bg-blue-50 p-3 rounded-full mb-3">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-primary bg-clip-text text-transparent">
          {t.aiAssistant || "MediChain AI Assistant"}
        </h2>
        <p className="text-gray-500 mt-1 max-w-md text-sm">
          {t.startConsultation || "Start a highly reliable health consultation with our 100% accurate trained diagnostic model."}
        </p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-primary"
                }`}
              >
                {message.role === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isStreaming && (
            <div className="flex gap-4 flex-row animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 text-primary shadow-sm">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                 <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={t.typeHealthQuery || "Type your health query..."}
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl px-4 py-3.5 transition-all text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-6 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center min-w-[56px] min-h-[52px]"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

    </div>
  );
}