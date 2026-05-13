"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/purity, @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import {
  CheckSquare, Plus, Trash2, Circle, CheckCircle2, Target, Shield, X, Save, UserPlus, Pencil,
  Mic, ImageIcon, Lock, Paperclip, User, Play, Pause, ZoomIn, ZoomOut, RotateCcw, Loader2,
  Square
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InviteModal } from "@/components/invite-modal";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TaskAttachment = {
  type: "voice" | "image";
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  duration?: number;
  width?: number;
  height?: number;
  waveformPeaks?: number[];
};

type TaskCapabilities = {
  text: boolean;
  voice: boolean;
  image: boolean;
};

export default function TasksPage() {
  const { data: session } = useSession();
  const orgRole = (session?.user as any)?.orgRole || "owner";

  const { data: tabsData } = useSWR("/api/tasks/tabs", fetcher);
  const tabs = useMemo(() => tabsData?.tabs || [], [tabsData?.tabs]);

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

          <TasksList tabId={activeTabId} activeTab={activeTab} />
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
function TasksList({ tabId, activeTab }: { tabId: string; activeTab: any }) {
  const { data, mutate: mutateTasks } = useSWR(`/api/tasks?tabId=${tabId}`, fetcher);
  const { data: teamData } = useSWR("/api/organization/team", fetcher);
  const { data: planData } = useSWR("/api/plan/config", fetcher);
  const { data: session } = useSession();
  const tasks = useMemo(() => data?.tasks || [], [data?.tasks]);
  const hasWriteAccess = data?.hasWriteAccess;
  const taskCapabilities: TaskCapabilities = data?.taskCapabilities || planData?.taskCapabilities || {
    text: true,
    voice: false,
    image: false,
  };
  const team = useMemo(() => teamData?.members || [], [teamData?.members]);

  const accessibleMembers = useMemo(() => {
    const accessIds = new Set((activeTab?.accessControl || []).map((entry: any) => entry.userId));
    return team.filter((member: any) => (
      member.orgRole === "owner" ||
      member.orgRole === "staff" ||
      accessIds.has(member._id)
    ));
  }, [activeTab?.accessControl, team]);

  const currentUserId = (session?.user as any)?.id || "";
  const defaultAssigneeId = accessibleMembers.some((member: any) => member._id === currentUserId)
    ? currentUserId
    : accessibleMembers[0]?._id || "";

  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high"|"medium"|"low">("medium");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [mediaError, setMediaError] = useState("");
  const [lockedFeature, setLockedFeature] = useState<"voice" | "image" | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [lightbox, setLightbox] = useState<{ images: TaskAttachment[]; index: number } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState<"high"|"medium"|"low">("medium");
  const [editStatus, setEditStatus] = useState<TaskStatus>("To Do");
  const [editAssignedToUserId, setEditAssignedToUserId] = useState("");
  const canAddTask = newTask.trim().length > 0 || attachments.length > 0;
  const statusCounts = useMemo(() => {
    return tasks.reduce((counts: Record<string, number>, task: any) => {
      const taskStatus = getTaskStatus(task);
      counts[taskStatus] = (counts[taskStatus] || 0) + 1;
      return counts;
    }, {});
  }, [tasks]);
  const filteredTasks = useMemo(() => {
    if (statusFilter === "All") return tasks;
    return tasks.filter((task: any) => getTaskStatus(task) === statusFilter);
  }, [statusFilter, tasks]);

  useEffect(() => {
    if (!assignedToUserId && defaultAssigneeId) {
      setAssignedToUserId(defaultAssigneeId);
    }
  }, [assignedToUserId, defaultAssigneeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const addTask = async () => {
    if (!canAddTask || !hasWriteAccess || isUploadingVoice || isRecording) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabId, text: newTask, priority, status, assignedToUserId, attachments }),
    });
    const result = await res.json().catch(() => null);
    if (res.ok) {
      setNewTask("");
      setPriority("medium");
      setStatus("To Do");
      setAssignedToUserId(defaultAssigneeId);
      setAttachments([]);
      setMediaError("");
      mutateTasks();
    } else {
      setMediaError(result?.error || "Failed to create task.");
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

  const startEditing = (task: any) => {
    setEditingId(task._id);
    setEditText(task.text || "");
    setEditPriority(task.priority);
    setEditStatus(getTaskStatus(task));
    setEditAssignedToUserId(task.assignedToUserId || defaultAssigneeId);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
    setEditPriority("medium");
    setEditStatus("To Do");
    setEditAssignedToUserId("");
  };

  const saveEdit = async (taskId: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabId,
        taskId,
        text: editText,
        priority: editPriority,
        status: editStatus,
        assignedToUserId: editAssignedToUserId,
      }),
    });
    setEditingId(null);
    mutateTasks();
  };

  const handleLockedFeature = (feature: "voice" | "image") => {
    setLockedFeature(feature);
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCloudinaryImageSuccess = (result: any) => {
    const info = result?.info;
    if (!info?.secure_url) return;

    setAttachments((current) => [
      ...current,
      {
        type: "image",
        url: info.secure_url,
        publicId: info.public_id,
        format: info.format,
        bytes: info.bytes,
        width: info.width,
        height: info.height,
      },
    ]);
  };

  const startRecording = async () => {
    if (!taskCapabilities.voice) {
      handleLockedFeature("voice");
      return;
    }

    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      setRecordingSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const duration = Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        await uploadVoiceAttachment(blob, duration);
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
      }, 500);
    } catch {
      setMediaError("Microphone access was blocked or unavailable.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRecording(false);
    setIsUploadingVoice(true);
    mediaRecorderRef.current.stop();
  };

  const uploadVoiceAttachment = async (blob: Blob, duration: number) => {
    try {
      const peaks = await extractWaveformPeaks(blob);
      const formData = new FormData();
      formData.append("tabId", tabId);
      formData.append("duration", String(duration));
      formData.append("waveformPeaks", JSON.stringify(peaks));
      formData.append("file", blob, "task-voice.webm");

      const res = await fetch("/api/tasks/media/audio", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to upload voice note.");

      setAttachments((current) => [...current, result.attachment]);
      setMediaError("");
    } catch (error: any) {
      setMediaError(error.message || "Failed to upload voice note.");
    } finally {
      setIsUploadingVoice(false);
      setRecordingSeconds(0);
    }
  };

  return (
    <div className="space-y-6">
      {hasWriteAccess && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_170px_160px_160px_auto]">
              <Input 
                value={newTask} 
                onChange={e => setNewTask(e.target.value)}
                placeholder="What needs to be done? Optional if you add voice."
                className="h-12"
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <select 
                value={assignedToUserId} 
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="h-12 rounded-lg border border-border bg-background px-3 text-sm"
              >
                {accessibleMembers.map((member: any) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
              <select 
                value={priority} 
                onChange={(e: any) => setPriority(e.target.value)}
                className="h-12 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="h-12 rounded-lg border border-border bg-background px-3 text-sm"
              >
                {TASK_STATUSES.map((taskStatus) => (
                  <option key={taskStatus} value={taskStatus}>{taskStatus}</option>
                ))}
              </select>
              <Button onClick={addTask} disabled={isUploadingVoice || isRecording || !canAddTask} className="h-12 px-6">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={taskCapabilities.voice ? "outline" : "ghost"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploadingVoice}
                className={cn("h-9 gap-2", !taskCapabilities.voice && "border border-dashed border-border text-muted-foreground")}
              >
                {!taskCapabilities.voice ? <Lock className="h-4 w-4" /> : isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                {isRecording ? `Stop ${formatSeconds(recordingSeconds)}` : isUploadingVoice ? "Uploading Voice" : "Voice"}
              </Button>

              {taskCapabilities.image ? (
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  options={{
                    clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                    maxFiles: 10,
                    multiple: true,
                  }}
                  onSuccess={handleCloudinaryImageSuccess}
                >
                  {({ open }) => (
                    <Button type="button" variant="outline" onClick={() => open()} className="h-9 gap-2">
                      <ImageIcon className="h-4 w-4" /> Image
                    </Button>
                  )}
                </CldUploadWidget>
              ) : (
                <Button type="button" variant="ghost" onClick={() => handleLockedFeature("image")} className="h-9 gap-2 border border-dashed border-border text-muted-foreground">
                  <Lock className="h-4 w-4" /> Image
                </Button>
              )}

              {isUploadingVoice && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">
                {planData?.plan ? `${String(planData.plan).toUpperCase()} plan` : "Task media"}
              </span>
            </div>

            {attachments.length > 0 && (
              <AttachmentPreviewStrip attachments={attachments} onRemove={removeAttachment} />
            )}

            {mediaError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                {mediaError}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
              statusFilter === "All" ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            )}
          >
            All <span className="ml-1 opacity-75">{tasks.length}</span>
          </button>
          {TASK_STATUSES.map((taskStatus) => (
            <button
              key={taskStatus}
              type="button"
              onClick={() => setStatusFilter(taskStatus)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                statusFilter === taskStatus ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              )}
            >
              {taskStatus} <span className="ml-1 opacity-75">{statusCounts[taskStatus] || 0}</span>
            </button>
          ))}
        </div>

        {filteredTasks.map((task: any) => {
          const taskAttachments: TaskAttachment[] = task.attachments || [];
          const imageAttachments = taskAttachments.filter((attachment) => attachment.type === "image");
          const taskStatus = getTaskStatus(task);

          return (
            <Card key={task._id} className={cn("transition-all", taskStatus === "Completed" && "opacity-60")}>
              <CardContent className="p-4">
                {editingId === task._id ? (
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="h-10 flex-1"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(task._id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={editAssignedToUserId}
                        onChange={(e) => setEditAssignedToUserId(e.target.value)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        {accessibleMembers.map((member: any) => (
                          <option key={member._id} value={member._id}>{member.name}</option>
                        ))}
                      </select>
                      <select
                        value={editPriority}
                        onChange={(e: any) => setEditPriority(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        {TASK_STATUSES.map((taskStatus) => (
                          <option key={taskStatus} value={taskStatus}>{taskStatus}</option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => saveEdit(task._id)} className="h-10 px-4 gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-10 px-3">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <button onClick={() => toggleTask(task._id, taskStatus === "Completed")} disabled={!hasWriteAccess} className="shrink-0 pt-0.5">
                        {taskStatus === "Completed" ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-primary transition-colors" />}
                      </button>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className={cn("font-medium", !task.text?.trim() && "italic text-muted-foreground", taskStatus === "Completed" && "line-through text-muted-foreground")}>
                          {task.text?.trim() || getMediaOnlyTaskLabel(taskAttachments)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {task.assignedToName && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
                              <User className="h-3 w-3" /> {task.assignedToName}
                            </span>
                          )}
                          {taskAttachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
                              <Paperclip className="h-3 w-3" /> {taskAttachments.length}
                            </span>
                          )}
                          <span className={cn("inline-flex rounded-lg px-2 py-1 font-bold sm:hidden", getStatusColor(taskStatus))}>
                            {taskStatus}
                          </span>
                          <span className={cn(
                            "inline-flex rounded-lg px-2 py-1 font-bold uppercase sm:hidden",
                            task.priority === "high" ? "bg-red-500/10 text-red-500" : task.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="hidden shrink-0 items-center gap-2 sm:flex">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                          getStatusColor(taskStatus)
                        )}>
                          {taskStatus}
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                          task.priority === "high" ? "bg-red-500/10 text-red-500" : task.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {task.priority}
                        </span>
                      </div>

                      {hasWriteAccess && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditing(task)} className="text-muted-foreground hover:text-primary opacity-50 hover:opacity-100 transition-all shrink-0 p-1">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteTask(task._id)} className="text-muted-foreground hover:text-red-500 opacity-50 hover:opacity-100 transition-all shrink-0 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {taskAttachments.length > 0 && (
                      <TaskAttachmentGrid
                        attachments={taskAttachments}
                        onOpenImage={(image) => setLightbox({
                          images: imageAttachments,
                          index: Math.max(0, imageAttachments.findIndex((attachment) => attachment.url === image.url)),
                        })}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No tasks here yet.</div>
        )}
        {tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No tasks match this status.</div>
        )}
      </div>

      {lockedFeature && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <UpgradePrompt
              title={`${lockedFeature === "voice" ? "Voice" : "Image"} Tasks Locked`}
              description={lockedFeature === "voice"
                ? "Voice task assignment is available on the Growth plan and higher."
                : "Image task assignment is available on the Pro plan and higher."}
              type="feature"
              onClose={() => setLockedFeature(null)}
            />
          </div>
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox((current) => current ? { ...current, index } : current)}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

async function extractWaveformPeaks(blob: Blob, sampleCount = 48) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const buffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channel.length / sampleCount));
    const peaks = Array.from({ length: sampleCount }, (_, index) => {
      let sum = 0;
      const start = index * blockSize;
      const end = Math.min(start + blockSize, channel.length);
      for (let i = start; i < end; i++) sum += Math.abs(channel[i]);
      return Math.min(1, Math.max(0.08, sum / Math.max(1, end - start) * 2.8));
    });
    await audioContext.close?.();
    return peaks;
  } catch {
    return Array.from({ length: sampleCount }, (_, index) => 0.22 + (index % 7) * 0.055);
  }
}

function formatSeconds(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getTaskStatus(task: any): TaskStatus {
  if (TASK_STATUSES.includes(task?.status as TaskStatus)) return task.status as TaskStatus;
  return task?.completed ? "Completed" : "To Do";
}

function getStatusColor(status: TaskStatus) {
  const map: Record<TaskStatus, string> = {
    "Not Started": "bg-slate-500/10 text-slate-500",
    "To Do": "bg-sky-500/10 text-sky-500",
    "Pending": "bg-amber-500/10 text-amber-500",
    "In Progress": "bg-blue-500/10 text-blue-500",
    "In Review": "bg-violet-500/10 text-violet-500",
    "Blocked": "bg-red-500/10 text-red-500",
    "Completed": "bg-emerald-500/10 text-emerald-500",
    "Cancelled": "bg-zinc-500/10 text-zinc-500",
  };

  return map[status];
}

function getMediaOnlyTaskLabel(attachments: TaskAttachment[]) {
  if (attachments.some((attachment) => attachment.type === "voice")) return "Voice task";
  if (attachments.some((attachment) => attachment.type === "image")) return "Image task";
  return "Untitled task";
}

function AttachmentPreviewStrip({ attachments, onRemove }: { attachments: TaskAttachment[]; onRemove: (index: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/20 p-2">
      {attachments.map((attachment, index) => (
        <div key={`${attachment.url}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-background">
          {attachment.type === "image" ? (
            <img src={attachment.url} alt="Task attachment preview" className="h-20 w-24 object-cover" />
          ) : (
            <div className="flex h-20 w-48 items-center px-3">
              <AudioWaveformPlayer attachment={attachment} compact />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function TaskAttachmentGrid({ attachments, onOpenImage }: { attachments: TaskAttachment[]; onOpenImage: (attachment: TaskAttachment) => void }) {
  return (
    <div className="grid gap-3 pl-10 sm:grid-cols-2">
      {attachments.map((attachment, index) => (
        attachment.type === "image" ? (
          <button
            key={`${attachment.url}-${index}`}
            type="button"
            onClick={() => onOpenImage(attachment)}
            className="group relative h-36 overflow-hidden rounded-lg border border-border bg-muted text-left"
          >
            <img src={attachment.url} alt="Task image attachment" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Open
            </span>
          </button>
        ) : (
          <div key={`${attachment.url}-${index}`} className="rounded-lg border border-border bg-muted/20 p-3">
            <AudioWaveformPlayer attachment={attachment} />
          </div>
        )
      ))}
    </div>
  );
}

function AudioWaveformPlayer({ attachment, compact = false }: { attachment: TaskAttachment; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const peaks = attachment.waveformPeaks?.length ? attachment.waveformPeaks : Array.from({ length: compact ? 24 : 48 }, (_, index) => 0.22 + (index % 6) * 0.07);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekToBar = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    audio.currentTime = (index / Math.max(1, peaks.length - 1)) * audio.duration;
  };

  return (
    <div className={cn("flex w-full items-center gap-3", compact && "gap-2")}>
      <button
        type="button"
        onClick={togglePlayback}
        className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary text-white", compact ? "h-8 w-8" : "h-9 w-9")}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-9 items-center gap-[3px]">
          {peaks.map((peak, index) => {
            const isActive = index / peaks.length <= progress;
            return (
              <button
                key={`${peak}-${index}`}
                type="button"
                onClick={() => seekToBar(index)}
                className={cn("w-full rounded-full transition-colors", isActive ? "bg-primary" : "bg-muted-foreground/25")}
                style={{ height: `${Math.max(8, peak * 34)}px` }}
                aria-label={`Seek audio to ${index + 1}`}
              />
            );
          })}
        </div>
        {!compact && (
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
            <span>Voice note</span>
            <span>{formatSeconds(attachment.duration || 0)}</span>
          </div>
        )}
      </div>
      <audio
        ref={audioRef}
        src={attachment.url}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
}

function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: TaskAttachment[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const image = images[index];

  useEffect(() => {
    setZoom(1);
  }, [index]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/95 text-white">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <div className="text-sm font-bold">
          Image {index + 1} of {images.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} className="text-white hover:bg-white/10">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setZoom(1)} className="text-white hover:bg-white/10">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} className="text-white hover:bg-white/10">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        <img
          src={image.url}
          alt="Expanded task attachment"
          className="max-h-full max-w-full object-contain transition-transform"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
      {images.length > 1 && (
        <div className="flex h-16 items-center justify-center gap-3 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onIndexChange((index + 1) % images.length)}
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── ACCESS MANAGER MODAL ──────────────────────────────────────────
function AccessManagerModal({ tabId, onClose }: { tabId: string, onClose: () => void }) {
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
