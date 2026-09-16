"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

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
    }),
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom when messages or loading status change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage(
      { text: trimmed },
      {
        body: { dashboardData },
      }
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Varna Assistant"
        className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-full bg-[#7A3F1E] text-[#D8CFB8] shadow-2xl hover:bg-[#8F4B24] hover:shadow-[0_8px_30px_rgba(122,63,30,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center border border-[#D8CFB8]/20 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] w-[360px] sm:w-[400px] h-[530px] max-h-[calc(100vh-5rem)] flex flex-col bg-[#18191D]/95 border border-[#6F848F]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden font-sans select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#6F848F]/20 bg-black/25 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Varna Faceted Diamond Brand Mark */}
                <div className="w-8 h-8 rounded-lg bg-[#7A3F1E]/20 border border-[#7A3F1E]/40 flex items-center justify-center p-1 shadow-inner">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 240 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#D8CFB8]"
                  >
                    <path
                      d="M107.92 167.55L92.48 62.32c-0.13-0.89 0.95-1.43 1.59-0.79l49.1 49.49c1.12 1.13 1.8 2.63 1.9 4.22l3.36 52.27L107.92 167.55z"
                      fill="currentColor"
                      fillOpacity="0.9"
                    />
                    <path
                      d="M107.88 167.66l17.02-61.53c0.19-0.7 1.05-0.96 1.59-0.47l29.42 26.57c1.04 0.94 1.46 2.39 1.1 3.75l-8.47 31.58L107.88 167.66z"
                      fill="currentColor"
                      fillOpacity="0.5"
                    />
                    <path
                      d="M92.48 62.32L107.92 167.55l39.06-25.75"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeOpacity="0.8"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#D8CFB8] font-medium font-sans text-sm tracking-wide leading-tight">
                    Varna Assistant
                  </h3>
                  <p className="text-[10px] text-[#6F848F] uppercase tracking-wider font-medium">
                    Framework Intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="p-1.5 text-[#6F848F] hover:text-[#D8CFB8] hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text">
              {messages.length === 0 && (
                <div className="text-center text-[#8C9DA8] my-auto py-12 px-6 flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 rounded-full bg-[#7A3F1E]/15 border border-[#7A3F1E]/30 text-[#D8CFB8]">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs leading-relaxed text-[#8C9DA8] max-w-[240px]">
                    How can I assist you with the Varna Framework today? Ask about scores, certificates, or impact rules.
                  </p>
                </div>
              )}

              {messages.map((m) => {
                const textContent =
                  m.parts
                    ?.filter((p) => p.type === "text")
                    .map((p) => (p as any).text)
                    .join("") ||
                  (m as any).content ||
                  "";

                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#7A3F1E] text-[#FAF6EE] rounded-2xl rounded-tr-xs shadow-md"
                          : "bg-[#23262B] border border-[#6F848F]/20 text-[#D8CFB8] rounded-2xl rounded-tl-xs shadow-sm whitespace-pre-wrap"
                      }`}
                    >
                      {textContent}
                    </div>
                  </div>
                );
              })}

              {/* Streaming / Typing Indicator */}
              {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
                <div className="flex justify-start">
                  <div className="bg-[#23262B] border border-[#6F848F]/20 text-[#8C9DA8] rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center space-x-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C9DA8] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C9DA8] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C9DA8] animate-bounce" />
                  </div>
                </div>
              )}

              {/* Inline Error Display */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs leading-relaxed">
                    Something went wrong — please try again.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-[#6F848F]/20 bg-black/30 flex-shrink-0"
            >
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white/[0.04] border border-[#6F848F]/30 rounded-xl pl-4 pr-11 py-2.5 text-sm text-[#D8CFB8] placeholder:text-[#6F848F]/80 focus:outline-none focus:border-[#7A3F1E] focus:ring-1 focus:ring-[#7A3F1E]/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="absolute right-1.5 p-1.5 rounded-lg bg-[#7A3F1E] text-[#FAF6EE] hover:bg-[#8F4B24] active:scale-95 disabled:opacity-30 disabled:hover:bg-[#7A3F1E] disabled:active:scale-100 transition-all"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

