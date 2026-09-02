"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

interface ChatWidgetProps {
  dashboardData?: any;
}

export default function ChatWidget({ dashboardData }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { dashboardData },
    }),
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage({ text: trimmed });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#2F3C52] text-[#D8CFB8] shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-[#1E2022] border border-[#6F848F]/30 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#6F848F]/20 bg-black/10">
              <h3 className="text-[#D8CFB8] font-medium font-serif">
                Varna Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#6F848F] hover:text-[#D8CFB8] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center text-[#6F848F] mt-10 text-sm">
                  <p>How can I assist you with the Varna Framework today?</p>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-[#7A3F1E] text-white rounded-tr-sm"
                        : "bg-white/5 text-[#D8CFB8] rounded-tl-sm"
                    }`}
                  >
                    {m.parts?.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null
                    ) ?? (m as any).content ?? ""}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-[#6F848F] rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                    Something went wrong. Please check your API key configuration.
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-[#6F848F]/20 bg-black/10"
            >
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white/5 border border-[#6F848F]/30 rounded-full pl-4 pr-10 py-2 text-sm text-[#D8CFB8] placeholder:text-[#6F848F] focus:outline-none focus:border-[#7A3F1E]/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 text-[#6F848F] hover:text-[#D8CFB8] disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
