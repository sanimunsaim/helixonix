import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockHelixBrainTasks } from "@/stores/mockData";
import type { HelixBrainTask } from "@/types/admin";
import { Brain, Send, Terminal, Zap, Filter, Sparkles } from "lucide-react";

const commandTemplates = [
  "Approve all pending {category} assets with quality score > {X}",
  "Suspend users with fraud score > {X} from the last {period}",
  "Generate weekly performance report and email to team",
  "Show me sellers with declining performance this month",
  "Process all pending payouts that have been waiting > 5 days",
  "Flag orders with no seller response in 48 hours",
];

interface ChatMessage {
  id: string;
  role: "admin" | "helix";
  content: string;
  timestamp: Date;
}

export default function HelixBrain() {
  const [tasks] = useState<HelixBrainTask[]>(mockHelixBrainTasks);
  const [selectedTask, setSelectedTask] = useState<HelixBrainTask | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "init", role: "helix", content: "HELIX-BRAIN v3.2 initialized. I can help you moderate content, process payouts, analyze fraud patterns, and automate platform operations. What would you like me to do?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const adminMsg: ChatMessage = { id: Date.now().toString(), role: "admin", content: input, timestamp: new Date() };
    setChatMessages((prev) => [...prev, adminMsg]);
    setInput("");
    setShowTemplates(false);

    setTimeout(() => {
      const responses = [
        "Scanning queue... Found 23 matching assets. 19 approved (quality > 80). 4 skipped (quality 71-79 — moved to manual review). Action completed at 14:38:22.",
        "Analyzing fraud patterns... 3 users flagged with scores above threshold. Suspension recommendations generated. Awaiting admin approval.",
        "Processing payout queue... 5 payouts approved ($12,450 total). All verification checks passed. Stripe transfers initiated.",
        "Report generated and sent to team@helixonix.com. 47 pages covering revenue, user growth, seller performance, and AI platform metrics.",
      ];
      const helixMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "helix", content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date() };
      setChatMessages((prev) => [...prev, helixMsg]);
    }, 800);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="HELIX-BRAIN Console" subtitle="AI Agent Command Interface" badge="ONLINE" badgeColor="bg-emerald-500/10 text-emerald-400 animate-pulse" />

      <div className="grid gap-4 lg:grid-cols-5" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex flex-col rounded-xl border border-[#1E293B] bg-[#111827] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Terminal className="h-3.5 w-3.5" /> Task Log
            </h3>
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-slate-600" />
              <select className="bg-transparent text-[10px] text-slate-500 outline-none">
                <option>All Categories</option>
                <option>Moderation</option>
                <option>Payout</option>
                <option>Fraud</option>
                <option>Security</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto hx-scrollbar p-2">
            {tasks.map((task) => (
              <button key={task.id} onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                className={`mb-1 w-full rounded-lg p-2.5 text-left transition-colors ${selectedTask?.id === task.id ? "bg-hx-cyan/10 border border-hx-cyan/20" : "hover:bg-hx-surface-hover"}`}>
                <div className="flex items-center gap-2">
                  <StatusBadge label={task.category} variant={task.status === "success" ? "success" : task.status === "pending" ? "warning" : "purple"} className="!text-[9px]" />
                  <span className="text-[10px] text-slate-600">{new Date(task.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{task.action}</p>
                <p className="text-[10px] text-slate-500">{task.result}</p>
              </button>
            ))}
          </div>
          {selectedTask && selectedTask.reasoning && (
            <div className="border-t border-[#1E293B] p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Reasoning</div>
              <p className="text-[11px] text-slate-400 italic">{selectedTask.reasoning}</p>
              {selectedTask.status === "pending" && (
                <button className="mt-2 rounded bg-hx-orange/10 px-2 py-1 text-[10px] text-hx-orange hover:bg-hx-orange/20">
                  Override Action
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-[#1E293B] bg-[#111827] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-hx-cyan">
              <Brain className="h-3.5 w-3.5" /> Command Interface
            </h3>
            <div className="text-[10px] text-slate-600">v3.2.1-stable</div>
          </div>

          <div className="flex-1 overflow-y-auto hx-scrollbar p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "admin" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "admin" ? "bg-hx-cyan/20 text-hx-cyan" : "bg-hx-purple/20 text-hx-purple"
                }`}>
                  {msg.role === "admin" ? <Zap className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === "admin" ? "bg-hx-cyan/10 text-slate-200 border border-hx-cyan/20" : "bg-hx-surface text-slate-300"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-[#1E293B] p-3">
            {showTemplates && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {commandTemplates.map((t, i) => (
                  <button key={i} onClick={() => { setInput(t); setShowTemplates(false); }}
                    className="rounded-md bg-hx-surface px-2 py-1 text-[10px] text-slate-400 hover:bg-hx-surface-hover hover:text-hx-cyan transition-colors">
                    {t.length > 40 ? t.slice(0, 40) + "..." : t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowTemplates(!showTemplates)}
                className="shrink-0 rounded-lg bg-hx-surface px-2 py-2 text-[10px] text-slate-500 hover:text-hx-cyan">
                <Sparkles className="h-3.5 w-3.5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Tell HELIX-BRAIN what to do..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50"
              />
              <button onClick={sendMessage}
                className="shrink-0 rounded-lg bg-hx-cyan/10 p-2 text-hx-cyan hover:bg-hx-cyan/20 transition-colors">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
