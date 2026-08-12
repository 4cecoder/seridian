"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@bytecats/ui-kit";
import { Settings, Users, UserPlus, Trash2, Mail, Shield, Clock, RefreshCw, Layers, GitBranch, Bot, Key } from "lucide-react";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { SyncDashboard } from "@/components/sync/SyncDashboard";
import { SecretsVault } from "@/components/settings/SecretsVault";

type User = Doc<"users">;

function UserCard({ user, onEdit, onDelete }: { user: User; onEdit: (user: User) => void; onDelete: (userId: Id<"users">) => void }) {
  const statusColors: Record<string, string> = {
    online: "bg-emerald-500",
    away: "bg-amber-400",
    offline: "bg-slate-500",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0c1222]/80 p-4 transition-colors hover:border-white/[0.1]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-seridian-500/10 text-sm font-semibold text-seridian-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c1222] ${statusColors[user.status]}`} aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{user.name}</span>
            <Badge variant="secondary" className="text-[10px]">{user.pubkey}</Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            {user.email && (
              <>
                <Mail className="h-3 w-3" aria-hidden="true" />
                <span>{user.email}</span>
                <span className="text-white/10">|</span>
              </>
            )}
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{new Date(user.lastSeen).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="text-slate-400 hover:text-white">
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(user._id)} className="text-red-400 hover:text-red-300">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
  const createUser = useMutation(api.users.upsert);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pubkey, setPubkey] = useState(user?.pubkey ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pubkey.trim()) return;
    setSaving(true);
    try {
      await createUser({
        pubkey: pubkey.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        status: "offline",
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-md border-white/[0.08] bg-[#0c1222]">
      <DialogHeader>
        <DialogTitle className="text-white">{user ? "Edit User" : "Add User"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Pubkey *</Label>
          <Input value={pubkey} onChange={(e) => setPubkey(e.target.value)} placeholder="e.g. john" disabled={!!user} className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Password {user && "(leave blank to keep current)"}</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={user ? "••••••" : "Set password"} className="bg-white/5 border-white/10" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
          <Button type="submit" disabled={saving || !name.trim() || !pubkey.trim()} className="bg-seridian-500 text-white hover:bg-seridian-400">
            {saving ? "Saving..." : user ? "Update" : "Add User"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const users = useQuery(api.chat.getUsers, {});
  const deleteUser = useMutation(api.users.remove);
  const [activeTab, setActiveTab] = useState(tabParam || "users");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"users"> | null>(null);

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditingUser(undefined);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmId) return;
    await deleteUser({ userId: deleteConfirmId });
    setDeleteConfirmId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Governance</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage user access, organization roles, and Linear/GitHub integration sync.</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList variant="line" className="gap-2 border-b border-white/[0.08]">
          <TabsTrigger value="users" className="gap-2 text-xs font-medium">
            <Users className="h-4 w-4" />
            Team Members & Access
            <Badge variant="secondary" className="ml-1 text-[10px] bg-white/10 text-white">
              {users?.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2 text-xs font-medium">
            <RefreshCw className="h-4 w-4" />
            Integrations & Data Sync
            <Badge variant="secondary" className="ml-1 text-[10px] bg-cyan-500/20 text-cyan-300">
              Linear + GitHub
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="secrets" className="gap-2 text-xs font-medium">
            <Key className="h-4 w-4 text-amber-400" />
            API Keys & Secrets
            <Badge variant="secondary" className="ml-1 text-[10px] bg-amber-500/20 text-amber-300">
              Admin Only
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2 text-xs font-medium">
            <Bot className="h-4 w-4 text-cyan-400" />
            AI Agent Studio
            <Badge variant="secondary" className="ml-1 text-[10px] bg-purple-500/20 text-purple-300">
              3 Agents
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: USERS */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Registered organization members</span>
            <Button size="sm" onClick={() => setFormOpen(true)} className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Add User
            </Button>
          </div>

          <div className="space-y-2">
            {users === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : users.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-slate-600">
                No users yet. Add one to get started.
              </div>
            ) : (
              users.map((user) => (
                <UserCard key={user._id} user={user} onEdit={handleEdit} onDelete={setDeleteConfirmId} />
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 2: INTEGRATIONS & SYNC */}
        <TabsContent value="sync" className="space-y-4 pt-2">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">External Integrations Sync Center</h3>
              <p className="text-xs text-slate-400 mt-1">Configure and manually trigger synchronization with Linear issues, teams, projects, and GitHub repositories.</p>
            </div>
            <SyncDashboard />
          </div>
        </TabsContent>

        {/* TAB 3: SECRETS & API KEYS (ADMIN ONLY) */}
        <TabsContent value="secrets" className="space-y-4 pt-2">
          <SecretsVault currentUserId="dee" />
        </TabsContent>

        {/* TAB 4: AI AGENT STUDIO */}
        <TabsContent value="agents" className="space-y-4 pt-2">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-400" />
                AI Agent Studio & Automation Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure workspace orchestration agents, triggers, API connections, and automated notification webhooks.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">@SeridianAI</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Architect Agent</div>
                <p className="text-xs text-slate-400 leading-relaxed">Orchestrates multi-agent subtasks, codebase queries, layout optimization, and workflow planning.</p>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">@LinearSyncBot</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Sprint Orchestrator</div>
                <p className="text-xs text-slate-400 leading-relaxed">Syncs Linear tickets, creates issues from chat threads, updates labels, and tracks sprint velocity.</p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">@DataPulse</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-300">Active</Badge>
                </div>
                <div className="text-sm font-semibold text-white">Analytics Bot</div>
                <p className="text-xs text-slate-400 leading-relaxed">Monitors sales pipelines, client dossier background checks, booking rates, and team bandwidth.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <UserForm user={editingUser} onClose={handleClose} />
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm border-white/[0.08] bg-[#0c1222]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)} className="text-slate-400">Cancel</Button>
            <Button onClick={handleConfirmDelete} className="bg-red-500 text-white hover:bg-red-400">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardGuard>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <SettingsContent />
      </Suspense>
    </DashboardGuard>
  );
}
