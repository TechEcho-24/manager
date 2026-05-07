"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import {
  CheckSquare, Plus, Trash2, Circle, CheckCircle2, Clock, Flame, 
  Settings, Users, Target, PhoneCall, Trophy, Shield, X, Save, UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InviteModal } from "@/components/invite-modal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TasksPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgRole = (session?.user as any)?.orgRole || "owner";

  const { data: tabsData, isLoading: tabsLoading } = useSWR("/api/tasks/tabs", fetcher);
  const tabs = tabsData?.tabs || [];

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showCreateTab, setShowCreateTab] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");

  const [showAccessModal, setShowAccessModal] = useState<string | null>(null);

  // Auto select first tab
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0]._id);
    }
  }, [tabs, activeTabId]);

  const handleCreateTab = async () => {
    if (!newTabName.trim()) return;
    const res = await fetch("/api/tasks/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTabName }),
    });
    if (res.ok) {
      setNewTabName("");
      setShowCreateTab(false);
      mutate("/api/tasks/tabs");
    }
  };

  const activeTab = tabs.find((t: any) => t._id === activeTabId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Tasks & Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage tasks across different boards and teams</p>
        </div>
        {(orgRole === "owner" || orgRole === "staff") && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowInviteModal(true)} className="border-border">
              <UserPlus className="h-4 w-4 mr-2" /> Invite
            </Button>
            <Button onClick={() => setShowCreateTab(true)} className="bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" /> New Tab
            </Button>
          </div>
        )}
      </div>

      {showCreateTab && (
        <Card className="border-border">
          <CardContent className="p-4 flex gap-3">
            <Input 
              placeholder="Tab Name (e.g. Lead: Apple Inc, Project Alpha)" 
              value={newTabName}
              onChange={e => setNewTabName(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleCreateTab}>Create</Button>
            <Button variant="ghost" onClick={() => setShowCreateTab(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs List */}
      {tabs.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map((tab: any) => (
            <button
              key={tab._id}
              onClick={() => setActiveTabId(tab._id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap border flex items-center gap-2",
                activeTabId === tab._id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent py-12">
          <CardContent className="text-center">
            <Target className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No Task Tabs Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {orgRole === "member" ? "You haven't been granted access to any task tabs yet." : "Create your first task tab to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Tab Content */}
      {activeTabId && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" /> {activeTab?.name}
            </h2>
            {(orgRole === "owner" || orgRole === "staff") && (
              <Button variant="outline" size="sm" onClick={() => setShowAccessModal(activeTabId)}>
                <Shield className="h-4 w-4 mr-2" /> Manage Access
              </Button>
            )}
          </div>

          <TasksList tabId={activeTabId} />
        </div>
      )}

      {showAccessModal && (
        <AccessManagerModal tabId={showAccessModal} onClose={() => setShowAccessModal(null)} />
      )}

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

// ─── TASKS LIST COMPONENT ───────────────────────────────────────────
function TasksList({ tabId }: { tabId: string }) {
  const { data, mutate: mutateTasks } = useSWR(`/api/tasks?tabId=${tabId}`, fetcher);
  const tasks = data?.tasks || [];
  const hasWriteAccess = data?.hasWriteAccess;

  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high"|"medium"|"low">("medium");

  const addTask = async () => {
    if (!newTask.trim() || !hasWriteAccess) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabId, text: newTask, priority }),
    });
    if (res.ok) {
      setNewTask("");
      mutateTasks();
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!hasWriteAccess) return;
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabId, taskId, completed: !completed }),
    });
    mutateTasks();
  };

  const deleteTask = async (taskId: string) => {
    if (!hasWriteAccess) return;
    await fetch(`/api/tasks?tabId=${tabId}&taskId=${taskId}`, { method: "DELETE" });
    mutateTasks();
  };

  return (
    <div className="space-y-6">
      {hasWriteAccess && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <Input 
              value={newTask} 
              onChange={e => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="h-12 flex-1"
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <div className="flex gap-2">
              <select 
                value={priority} 
                onChange={(e: any) => setPriority(e.target.value)}
                className="h-12 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button onClick={addTask} className="h-12 px-6">Add</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tasks.map((task: any) => (
          <Card key={task._id} className={cn("transition-all", task.completed && "opacity-60")}>
            <CardContent className="p-4 flex items-center gap-4">
              <button onClick={() => toggleTask(task._id, task.completed)} disabled={!hasWriteAccess} className="shrink-0">
                {task.completed ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-primary transition-colors" />}
              </button>
              <p className={cn("flex-1 font-medium", task.completed && "line-through text-muted-foreground")}>{task.text}</p>
              
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                task.priority === "high" ? "bg-red-500/10 text-red-500" : task.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {task.priority}
              </span>

              {hasWriteAccess && (
                <button onClick={() => deleteTask(task._id)} className="text-muted-foreground hover:text-red-500 opacity-50 hover:opacity-100 transition-all shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No tasks here yet.</div>
        )}
      </div>
    </div>
  );
}

// ─── ACCESS MANAGER MODAL ──────────────────────────────────────────
function AccessManagerModal({ tabId, onClose }: { tabId: string, onClose: () => void }) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const { data: teamData } = useSWR("/api/organization/team", fetcher);
  const { data: tabsData, mutate: mutateTabs } = useSWR("/api/tasks/tabs", fetcher);
  
  const team = teamData?.members || [];
  const tab = tabsData?.tabs?.find((t: any) => t._id === tabId);

  const handleAccessChange = async (userId: string, permission: string) => {
    await fetch(`/api/tasks/tabs/${tabId}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission }),
    });
    mutateTabs();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Manage Access: {tab?.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInvite(true)} className="h-8">
              <UserPlus className="h-4 w-4 mr-2" /> Invite
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {team.map((member: any) => {
            const currentAccess = tab?.accessControl?.find((a: any) => a.userId === member._id)?.permission || "none";
            return (
              <div key={member._id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <div>
                  <p className="font-bold text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email} • <span className="uppercase text-[9px] tracking-widest">{member.orgRole}</span></p>
                </div>
                {member.orgRole === "owner" ? (
                  <span className="text-xs font-bold text-primary">Full Access</span>
                ) : (
                  <select 
                    value={currentAccess} 
                    onChange={e => handleAccessChange(member._id, e.target.value)}
                    className="h-8 px-2 rounded-md border text-xs"
                  >
                    <option value="none">No Access</option>
                    <option value="read">View Only</option>
                    <option value="write">Can Edit</option>
                  </select>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
