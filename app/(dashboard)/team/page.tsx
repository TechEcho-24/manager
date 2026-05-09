"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Users, UserPlus, Shield, ShieldCheck, Crown, Copy, Check,
  Loader2, Mail, Phone, MoreVertical, UserX, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InviteModal } from "@/components/invite-modal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ROLE_CONFIG = {
  owner: { label: "Owner", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  staff: { label: "Staff", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  member: { label: "Member", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function TeamPage() {
  const { data: session } = useSession();
  const orgRole = (session?.user as any)?.orgRole || "owner";
  const { data: teamData, isLoading } = useSWR("/api/organization/team", fetcher);
  const { data: invitesData } = useSWR("/api/organization/team/invites", fetcher);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const team = teamData?.members || [];
  const pendingInvites = invitesData?.invites || [];

  const owners = team.filter((m: any) => m.orgRole === "owner");
  const staff = team.filter((m: any) => m.orgRole === "staff");
  const members = team.filter((m: any) => m.orgRole === "member");

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Team Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your workspace members and their roles
          </p>
        </div>
        {(orgRole === "owner" || orgRole === "staff") && (
          <Button onClick={() => setShowInviteModal(true)} className="bg-primary text-white gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{owners.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                <ShieldCheck className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{staff.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Staff Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{members.length}</p>
                <p className="text-xs font-medium text-muted-foreground">Task Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Members ({team.length})
          </CardTitle>
          <CardDescription>
            Overview of everyone in your workspace with their roles and contact info.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground tracking-wider uppercase">
            <span>Member</span>
            <span>Contact</span>
            <span className="w-28 text-center">Role</span>
          </div>

          {/* Members */}
          <div className="divide-y divide-border">
            {team.map((member: any) => {
              const roleConf = ROLE_CONFIG[member.orgRole as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
              const RoleIcon = roleConf.icon;
              const initials = (member.name || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={member._id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto] gap-2 sm:gap-4 items-start sm:items-center px-6 py-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Name + Avatar */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      member.orgRole === "owner" ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" :
                      member.orgRole === "staff" ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white" :
                      "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                    )}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1 pl-13 sm:pl-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && member.phone !== "0000000000" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-2 pl-13 sm:pl-0">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border w-28 justify-center",
                      roleConf.bg, roleConf.color
                    )}>
                      <RoleIcon className="h-3 w-3" />
                      {roleConf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {team.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No team members found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
