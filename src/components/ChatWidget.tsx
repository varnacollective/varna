"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useDateRange } from "@/context/DateRangeContext";

interface ChatWidgetProps {
  dashboardData?: any;
}

export default function ChatWidget({ dashboardData }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state: dateState, label: dateLabel } = useDateRange();

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
        body: {
          dashboardData,
          dateFilter: {
            selectedRange: dateLabel || "All Time",
            startDate: dateState?.startDate || null,
            endDate: dateState?.endDate || null,
          },
          currency: "USD",
          exchangeRate: 83,
        },
      }
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Varna Assistant"
        className={`varna-chat-fab fixed bottom-6 right-6 z-[9999] p-4 rounded-full bg-[#1C1917] text-[#FAF8F5] shadow-2xl hover:bg-[#332E2A] hover:shadow-[0_8px_30px_rgba(28,25,23,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center border border-[#332E2A] ${
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
            className="varna-chat-panel fixed bottom-6 right-6 z-[9999] w-[360px] sm:w-[400px] h-[530px] max-h-[calc(100vh-5rem)] flex flex-col bg-white/95 backdrop-blur-md border border-[#E8E2D9] shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden text-[#1C1917] font-sans select-none"
          >
            {/* Header */}
            <div className="bg-[#FAF8F5] border-b border-[#EFECE6] px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-[#1C1917]">
                  Varna Assistant
                </h3>
                <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#8C6239] mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  FRAMEWORK INTELLIGENCE
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text bg-white">
              {messages.length === 0 && (
                <div className="text-center my-auto py-12 px-6 flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-[#F5EFE6] text-[#8C6239] flex items-center justify-center mb-3 shadow-sm border border-[#E8DEC8]">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-[240px] leading-relaxed text-center font-normal">
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
                      className={`max-w-[85%] leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#8C4A27] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm"
                          : "bg-[#FAF8F5] border border-[#EFECE6] text-stone-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap"
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
                  <div className="bg-[#FAF8F5] border border-[#EFECE6] text-stone-500 rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center space-x-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239] animate-bounce" />
                  </div>
                </div>
              )}

              {/* Inline Error Display */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs leading-relaxed">
                    Something went wrong: please try again.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3.5 bg-white border-t border-[#EFECE6] flex-shrink-0"
            >
              <div className="flex items-center bg-[#FAF8F5] border border-[#E5E0D8] focus-within:border-[#8C6239] focus-within:ring-2 focus-within:ring-[#8C6239]/10 rounded-xl px-3.5 py-2 transition-all gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none w-full"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="bg-[#8C4A27] hover:bg-[#733B1E] text-white p-2 rounded-lg transition-colors shadow-sm disabled:opacity-40 flex-shrink-0 cursor-pointer"
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

