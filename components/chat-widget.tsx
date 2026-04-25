"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  X, 
  Send, 
  MessageSquareMore, 
  ArrowRight,
  Command,
  Zap,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_PRIORITIES } from "@/lib/constants";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

const STEPS = [
  { key: "fullName", question: "Neural Link Active. Starting new lead entry. Please provide the **Full Name**.", optional: false },
  { key: "phone", question: "Copy that. Now, what is the **Phone Number**?", optional: false },
  { key: "email", question: "Acknowledged. Do you have an **Email ID**? (You can skip this)", optional: true },
  { key: "company", question: "Understood. Which **Company** do they represent?", optional: true },
  { key: "priority", question: "Select the **Priority Level** for this prospect:", options: LEAD_PRIORITIES, optional: false },
  { key: "status", question: "Final check: What is the current **Lifecycle Status**?", options: LEAD_STATUSES, optional: false }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "client";

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [stepIndex, setStepIndex] = useState(-1);
  const stepIndexRef = useRef(-1); 
  const leadDataRef = useRef<any>({}); 

  const updateStep = (index: number) => {
    setStepIndex(index);
    stepIndexRef.current = index;
    if (index === -1) leadDataRef.current = {}; 
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      if (stepIndexRef.current >= 0) {
        try { recognition.start(); } catch(e) {}
      } else {
        setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const finalInput = transcript.toLowerCase()
        .replace(/\s*at\s+the\s+rate\s*/g, "@")
        .replace(/\s*dot\s+/g, ".")
        .replace(/\s+/g, " ")
        .trim();
      
      const isSensitiveField = stepIndexRef.current === 1 || stepIndexRef.current === 2;
      const cleanVal = isSensitiveField ? finalInput.replace(/\s+/g, "") : finalInput;
      
      setInputValue(cleanVal);
      handleSend(cleanVal);
    };
    recognition.start();
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "wel",
        role: "assistant",
        content: role === "admin" 
          ? "Master System Terminal Online. Greetings, Commander. Ready to oversee the LeadPro network?"
          : "Neural Core Online. Shall we start capturing new leads, Commander?",
        suggestions: role === "admin" ? ["Platform Health", "Client List"] : ["Start Lead Form", "Check status"],
        timestamp: new Date(),
      }]);
    }
  }, [role]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    const cleanContent = content.trim();
    if (!cleanContent) return;
    
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: cleanContent, timestamp: new Date() }]);
    setInputValue("");
    setIsLoading(true);

    const isTriggerWord = cleanContent.toLowerCase().includes("form") || cleanContent.toLowerCase().includes("lead") || cleanContent.toLowerCase().includes("nayi");

    if (role === "admin" && isTriggerWord) {
      setTimeout(() => {
        setMessages(p => [...p, { id: "block", role: "assistant", content: "⚠️ **Access Denied.** Administrative accounts are restricted from operational lead entry. Please use a Client profile for data input.", timestamp: new Date() }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (stepIndexRef.current >= 0) {
      const currentStep = STEPS[stepIndexRef.current];
      let cleanValue = cleanContent === "Skip" ? "" : cleanContent;

      if (currentStep.options) {
        const found = currentStep.options.find(opt => opt.toLowerCase() === cleanValue.toLowerCase());
        if (found) cleanValue = found;
      }

      leadDataRef.current[currentStep.key] = cleanValue;

      const nextIndex = stepIndexRef.current + 1;
      if (nextIndex < STEPS.length) {
        const nextStep = STEPS[nextIndex];
        setTimeout(() => {
          setMessages(p => [...p, {
            id: `step-${nextIndex}`,
            role: "assistant",
            content: nextStep.question,
            suggestions: nextStep.options ? [...nextStep.options] : (nextStep.optional ? ["Skip"] : []),
            timestamp: new Date()
          }]);
          updateStep(nextIndex);
          setIsLoading(false);
        }, 800);
      } else {
        try {
          const finalPayload = {
            ...leadDataRef.current,
            status: leadDataRef.current.status || "New",
            priority: leadDataRef.current.priority || "Medium",
            leadSource: leadDataRef.current.leadSource || "AI Assistant"
          };
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalPayload),
          });
          if (res.ok) {
            setMessages(p => [...p, {
              id: "fin",
              role: "assistant",
              content: `⚡ **Neural Link Secured!** Lead for **${finalPayload.fullName}** has been successully archived.`,
              suggestions: ["Start Lead Form"],
              timestamp: new Date()
            }]);
          } else {
            const errData = await res.json();
            throw new Error(errData.error || "Rejection");
          }
        } catch (e: any) {
          setMessages(p => [...p, { id: "err", role: "assistant", content: `❌ **Signal Failure:** ${e.message}`, timestamp: new Date() }]);
        }
        updateStep(-1);
        setIsLoading(false);
      }
      return;
    }

    if (isTriggerWord) {
      updateStep(0);
      leadDataRef.current = { leadSource: "AI Assistant" };
      setTimeout(() => {
        setMessages(p => [...p, { id: "intro", role: "assistant", content: STEPS[0].question, suggestions: ["Cancel Form"], timestamp: new Date() }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (cleanContent === "Cancel Form") {
      updateStep(-1);
      setMessages(p => [...p, { id: "can", role: "assistant", content: "Sequence aborted.", timestamp: new Date() }]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanContent, history: messages.slice(-5) }),
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
    <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased text-white">
      {isOpen && (
        <div className={cn(
          "fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#0A0A0B] animate-in fade-in zoom-in-95 duration-300 shadow-2xl",
          "sm:absolute sm:inset-auto sm:right-0 sm:bottom-0 sm:h-[600px] sm:w-[420px] sm:rounded-3xl sm:border sm:border-white/10 sm:backdrop-blur-3xl"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-tight text-sm text-white/90 italic">Neural Core</h3>
                <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[8px] font-bold uppercase text-emerald-500/60 tracking-widest">Active Link</span></div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-xl bg-white/5 p-2 hover:bg-white/10 border border-white/10 transition-all"><X className="h-4 w-4 text-white/40" /></button>
          </div>

          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar pb-40">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={cn("flex flex-col gap-1.5 max-w-[90%] animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "ml-auto items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[13px] leading-relaxed border shadow-lg transition-all",
                    msg.role === "assistant" ? "bg-white/[0.04] text-white/90 border-white/10 rounded-tl-none font-medium" : "bg-indigo-600 text-white border-white/10 rounded-tr-none font-bold"
                  )}>
                    {msg.content}
                    {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
                        {msg.suggestions.map((s, i) => (
                          <button key={i} onClick={() => handleSend(s)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-black text-white/40 uppercase tracking-widest hover:bg-indigo-600/30 hover:text-white transition-all">
                            {s} <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <div className="px-6 text-[8px] font-bold text-indigo-500/50 uppercase tracking-[0.4em] animate-pulse">Syncing...</div>}
            </div>

            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-6 transition-all duration-300",
              "bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5",
              "sm:bg-transparent sm:border-none sm:from-transparent"
            )}>
              {stepIndexRef.current >= 0 && (
                <div className="flex items-center justify-between mb-4 bg-indigo-600/10 border border-indigo-600/20 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-2 w-2 rounded-full bg-indigo-500">
                      <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-75" />
                    </div>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Awaiting: {STEPS[stepIndexRef.current].key}</span>
                  </div>
                  <button onClick={() => handleSend("Cancel Form")} className="text-[9px] font-black text-red-500/40 uppercase hover:text-red-500">Abort</button>
                </div>
              )}
              <div className="relative group">
                <input
                  type="text"
                  placeholder={isListening ? "Listening to Signal..." : "Console interface..."}
                  className={cn(
                    "h-14 w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-xl pl-5 pr-28 text-sm text-white transition-all font-bold focus:bg-blue-500/20 focus:outline-none focus:border-blue-400/50 shadow-[0_8px_32px_rgba(59,130,246,0.1)]",
                    isListening && "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse bg-blue-500/25"
                  )}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button onClick={toggleListening} className={cn("h-11 w-11 flex items-center justify-center rounded-xl transition-all", isListening ? "bg-red-500 text-white animate-pulse shadow-lg" : "bg-white/5 text-white/30 hover:bg-blue-500/20 hover:text-white")}><Mic className="h-4 w-4" /></button>
                  <button onClick={() => handleSend(inputValue)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-500"><Send className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-center mt-6">
                 <a href="https://techecho.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-indigo-500/10 bg-indigo-500/5 px-4 py-2 rounded-xl group transition-all hover:bg-indigo-500/10 shadow-lg shadow-black/20">
                    <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.4em]">Partner</span>
                    <div className="flex items-center gap-2 border-l border-white/5 pl-3">
                      <Zap className="h-3 w-3 text-indigo-500 fill-indigo-500 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black italic text-indigo-400 tracking-tighter">TechEcho</span>
                    </div>
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all animate-in fade-in duration-500">
          <MessageSquareMore className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}
