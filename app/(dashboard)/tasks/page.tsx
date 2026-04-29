"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import {
  CheckSquare,
  Plus,
  Trash2,
  Circle,
  CheckCircle2,
  Clock,
  Flame,
  CalendarDays,
  GripVertical,
  Sparkles,
  RotateCcw,
  Users,
  PhoneCall,
  Trophy,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Types ──────────────────────────────────────────────────────────
type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ISO date string
}

interface DayData {
  date: string; // YYYY-MM-DD
  tasks: Task[];
}

// ─── Helpers ────────────────────────────────────────────────────────
const TODAY = () => new Date().toISOString().split("T")[0];

const STORAGE_KEY = "leadpro_tasks";

function loadTasks(): DayData {
  if (typeof window === "undefined") return { date: TODAY(), tasks: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: TODAY(), tasks: [] };
    const parsed: DayData = JSON.parse(raw);
    // If the stored date is not today, reset tasks (daily refresh)
    if (parsed.date !== TODAY()) {
      // Carry over incomplete tasks from yesterday
      const carryOver = parsed.tasks
        .filter((t) => !t.completed)
        .map((t) => ({ ...t, id: crypto.randomUUID() }));
      return { date: TODAY(), tasks: carryOver };
    }
    return parsed;
  } catch {
    return { date: TODAY(), tasks: [] };
  }
}

function saveTasks(data: DayData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Component ──────────────────────────────────────────────────────
export default function TasksPage() {
  const [dayData, setDayData] = useState<DayData>({ date: TODAY(), tasks: [] });
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  // Load from localStorage on mount
  useEffect(() => {
    setDayData(loadTasks());
  }, []);

  // Save whenever tasks change
  useEffect(() => {
    if (dayData.tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveTasks(dayData);
    }
  }, [dayData]);

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      text: newTask.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setDayData((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTask("");
  }, [newTask, priority]);

  const toggleTask = (id: string) => {
    setDayData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const deleteTask = (id: string) => {
    setDayData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const resetDay = () => {
    setDayData({ date: TODAY(), tasks: [] });
  };

  // ── Derived ──
  const filteredTasks = dayData.tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const totalTasks = dayData.tasks.length;
  const completedTasks = dayData.tasks.filter((t) => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityConfig: Record<Priority, { icon: typeof Flame; label: string; color: string; bg: string; border: string }> = {
    high: { icon: Flame, label: "Urgent", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    medium: { icon: Clock, label: "Normal", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    low: { icon: Circle, label: "Low", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  };

  // Format today's date nicely
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Today&apos;s Tasks
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <p className="text-sm text-muted-foreground font-semibold">{todayFormatted}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 rounded-xl h-10"
          onClick={resetDay}
        >
          <RotateCcw className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {/* Progress Bar */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground">Daily Progress</span>
            </div>
            <span className="text-sm font-black text-foreground">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted/30 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                progressPct === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {progressPct === 100 && totalTasks > 0 && (
            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All tasks completed! Great job today 🎉
            </p>
          )}
        </CardContent>
      </Card>

      {/* CRM Daily Goals */}
      <CRMGoals />

      {/* Add Task */}
      <Card className="border-border bg-card shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="What do you need to do today?"
              className="flex-1 h-12 rounded-xl bg-background border-border shadow-sm pl-4 text-sm font-medium"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <div className="flex gap-2">
              {(["high", "medium", "low"] as Priority[]).map((p) => {
                const cfg = priorityConfig[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "h-12 px-3 rounded-xl border text-xs font-bold tracking-wider transition-all flex items-center gap-1.5",
                      priority === p
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                        : "border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <cfg.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </button>
                );
              })}
              <Button
                className="h-12 px-5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
                onClick={addTask}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "done", label: "Completed" },
          ] as { key: "all" | "active" | "done"; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all",
              filter === tab.key
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-card border border-border text-muted-foreground hover:bg-muted/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-card/50">
            <CardContent className="py-16 flex flex-col items-center justify-center text-muted-foreground">
              <CheckSquare className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm font-bold tracking-widest">
                {filter === "done" ? "No completed tasks yet" : filter === "active" ? "All done! Nothing pending" : "No tasks for today"}
              </p>
              <p className="text-xs mt-1">
                {filter === "all" ? "Add your first task above to get started" : ""}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const cfg = priorityConfig[task.priority];
            return (
              <Card
                key={task.id}
                className={cn(
                  "border-border bg-card transition-all group hover:shadow-lg",
                  task.completed && "opacity-60"
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 transition-all" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-primary transition-all" />
                    )}
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold text-foreground transition-all",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.text}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/50 mt-0.5">
                      {new Date(task.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest border", cfg.bg, cfg.color, cfg.border)}>
                    {cfg.label}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Tip */}
      <p className="text-[10px] text-center text-muted-foreground/50 font-bold tracking-widest">
        Tasks are stored locally • Incomplete tasks carry over to the next day automatically
      </p>
    </div>
  );
}

// ─── CRM Daily Goals Component ──────────────────────────────────────
function CRMGoals() {
  const { data } = useSWR("/api/leads?limit=500", fetcher, { refreshInterval: 30000 });
  const leads = data?.leads || [];

  const today = new Date().toISOString().split("T")[0];

  // Count leads added today
  const leadsToday = leads.filter((l: any) => l.createdAt?.startsWith(today)).length;

  // Count follow-ups done today (leads with follow-up date = today that are contacted/interested)
  const followUpsToday = leads.filter((l: any) => {
    const followDate = l.nextFollowupDate?.split("T")[0];
    return followDate === today && ["Contacted", "Interested", "Qualified", "Follow-up Required"].includes(l.status);
  }).length;

  // Count conversions today
  const conversionsToday = leads.filter((l: any) => {
    return l.status === "Converted (Won)" && l.updatedAt?.startsWith(today);
  }).length;

  const goals = [
    {
      label: "Leads Added",
      current: leadsToday,
      target: 25,
      icon: Users,
      color: "#6366f1",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Follow-ups Done",
      current: followUpsToday,
      target: 5,
      icon: PhoneCall,
      color: "#f59e0b",
      bg: "bg-amber-500/10",
    },
    {
      label: "Conversions",
      current: conversionsToday,
      target: 2,
      icon: Trophy,
      color: "#10b981",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <Card className="border-border bg-card shadow-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold tracking-widest text-muted-foreground">CRM Daily Goals</h3>
          <span className="text-[10px] font-bold text-muted-foreground/40 ml-auto">Auto-tracked from leads</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            const isComplete = goal.current >= goal.target;
            const circumference = 2 * Math.PI * 36;
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            return (
              <div
                key={goal.label}
                className={cn(
                  "rounded-2xl border border-border p-5 flex flex-col items-center gap-3 transition-all",
                  isComplete && "border-emerald-500/30 bg-emerald-500/5"
                )}
              >
                {/* SVG Circle Progress */}
                <div className="relative">
                  <svg width="88" height="88" className="-rotate-90">
                    <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                    <circle
                      cx="44" cy="44" r="36" fill="none"
                      stroke={isComplete ? "#10b981" : goal.color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <goal.icon className="h-5 w-5" style={{ color: goal.color }} />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-black text-foreground">
                    {goal.current}<span className="text-sm font-bold text-muted-foreground">/{goal.target}</span>
                  </p>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground mt-0.5">{goal.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
