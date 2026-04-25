"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Zap, 
  User, 
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Syncing...");

  useEffect(() => {
    if (isLoading) {
      const statuses = ["Analyzing...", "Processing...", "Syncing...", "Generating..."];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % statuses.length;
        setLoadingStatus(statuses[i]);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Identity Verified. Neural Assistant Online. How shall we optimize your empire today?",
        suggestions: ["Features", "Manage deals", "Revenue Reports"],
        timestamp: new Date(),
      }]);
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: messages.slice(-5) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        suggestions: data.suggestions || [],
        timestamp: new Date(),
      }]);
    } catch (err) {} finally { setIsLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans antialiased print:hidden">
      {isOpen && (
        <div className="flex h-[580px] w-[360px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
          
          {/* Compact Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0">
                <h3 className="font-bold uppercase tracking-tight text-sm text-white/90">Neural Core</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/60">Live</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-md bg-white/5 p-1.5 hover:bg-white/10 transition-colors border border-white/5">
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 relative overflow-hidden">
            <div ref={scrollRef} className="h-full overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={cn("flex flex-col gap-1.5 max-w-[90%] animate-in fade-in duration-500", msg.role === "user" ? "ml-auto items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-xl text-[12px] leading-relaxed border",
                    msg.role === "assistant" 
                      ? "bg-white/[0.03] text-white/90 border-white/10 rounded-tl-none" 
                      : "bg-indigo-600 text-white border-indigo-400/20 rounded-tr-none font-medium"
                  )}>
                    {msg.content}
                    
                    {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(s)}
                            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold text-white/50 uppercase tracking-wider transition-all hover:bg-indigo-600/20 hover:text-white hover:border-indigo-600/30"
                          >
                            {s}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[7px] font-bold tracking-[0.2em] text-white/20 uppercase px-1">
                    {msg.role === "assistant" ? "Neural" : "Admin"}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 rounded-tl-none">
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce" />
                  </div>
                  <span className="text-[7px] font-bold tracking-[0.2em] text-indigo-500/50 uppercase italic ml-1">{loadingStatus}</span>
                </div>
              )}
              
              {/* Extra Padding for chips to clear the input area */}
              <div className="h-32" />
            </div>

            {/* Compact Bottom Panel */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Console input..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-12 text-xs text-white focus:bg-white/10 focus:outline-none placeholder:text-white/10 font-medium"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                  disabled={isLoading}
                />
                <button 
                  onClick={() => handleSend(inputValue)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white active:scale-95 disabled:opacity-10"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-4">
                 <a href="https://techecho.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 rounded-md hover:bg-indigo-500/10 transition-all shadow-lg shadow-indigo-500/10">
                    <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">Partner</span>
                    <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                      <Zap className="h-2.5 w-2.5 text-indigo-400 fill-indigo-400" />
                      <span className="text-[9px] font-black italic text-indigo-400">TechEcho</span>
                    </div>
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Squircle Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/10 shadow-2xl",
          isOpen ? "bg-white/5 text-white/40" : "bg-indigo-600 text-white shadow-indigo-600/20"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6 fill-current" />}
      </button>
    </div>
  );
}
