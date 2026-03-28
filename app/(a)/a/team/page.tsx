"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconPlus,
  IconTrash,
  IconPencil,
  IconLoader2,
  IconShield,
  IconShieldCheck,
  IconUsers,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatDate } from "@/lib/utils";
import {
  getTeam,
  searchUsersForTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  ALL_MODULES,
  type TeamMember,
  type UserSearchResult,
  type AdminPosition,
} from "@/lib/team-api";

const positionConfig = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: IconShieldCheck,
    color: "text-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    description: "Full access to everything including team management",
  },
  ADMIN: {
    label: "Admin",
    icon: IconShield,
    color: "text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
    description: "Full access except team management",
  },
  MODERATOR: {
    label: "Moderator",
    icon: IconUsers,
    color: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    description: "Access limited to assigned modules",
  },
};

function MemberAvatar({ member }: { member: TeamMember }) {
  const initials =
    `${member.user.firstName[0]}${member.user.lastName[0]}`.toUpperCase();
  if (member.user.image) {
    return (
      <img
        src={member.user.image}
        alt={`${member.user.firstName} ${member.user.lastName}`}
        className="size-10 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold">{initials}</span>
    </div>
  );
}

function ModuleCheckboxes({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (mods: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  };
  return (
    <div className="grid grid-cols-1 gap-2">
      {ALL_MODULES.map((mod) => (
        <label
          key={mod.key}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
            selected.includes(mod.key)
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-border/80",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <Checkbox
            checked={selected.includes(mod.key)}
            onCheckedChange={() => !disabled && toggle(mod.key)}
            disabled={disabled}
            id={`mod-${mod.key}`}
          />
          <span className="text-sm">{mod.label}</span>
        </label>
      ))}
    </div>
  );
}

// ── Add Member Dialog ────────────────────────────────────────────────────────

function AddMemberDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (member: TeamMember) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<UserSearchResult | null>(null);
  const [position, setPosition] = useState<AdminPosition>("MODERATOR");
  const [modules, setModules] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected(null);
      setPosition("MODERATOR");
      setModules([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsersForTeam(query);
        setResults(res);
      } catch {
        // silent
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query, selected]);

  const handleSubmit = async () => {
    if (!selected) return toast.error("Select a user first");
    if (position === "MODERATOR" && modules.length === 0)
      return toast.error("Assign at least one module for a Moderator");
    setSubmitting(true);
    try {
      const member = await addTeamMember({
        userId: selected.id,
        position,
        modules: position === "ADMIN" ? [] : modules,
      });
      onAdded(member);
      toast.success(`${selected.firstName} added to the team`);
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to add team member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search for a registered Ekovibe user to add to your admin team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1 overflow-y-auto flex-1 pr-1">
          {/* User search */}
          <div className="space-y-2">
            <Label>User</Label>
            {selected ? (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-primary/40 bg-primary/5">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold">
                    {selected.firstName[0]}
                    {selected.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selected.firstName} {selected.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selected.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <IconSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search by name or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
                {(results.length > 0 || searching) && (
                  <div className="absolute top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-10 overflow-y-auto max-h-52">
                    {searching ? (
                      <div className="flex items-center justify-center py-4">
                        <IconLoader2
                          size={16}
                          className="animate-spin text-muted-foreground"
                        />
                      </div>
                    ) : (
                      results.map((u) => (
                        <button
                          key={u.id}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-left transition-colors"
                          onClick={() => {
                            setSelected(u);
                            setQuery("");
                            setResults([]);
                          }}
                        >
                          <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold">
                              {u.firstName[0]}
                              {u.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={position}
              onValueChange={(v) => setPosition(v as AdminPosition)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin — full access</SelectItem>
                <SelectItem value="MODERATOR">
                  Moderator — limited access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modules (only for MODERATOR) */}
          {position === "MODERATOR" && (
            <div className="space-y-2">
              <Label>Access Modules</Label>
              <p className="text-xs text-muted-foreground">
                Choose which sections this moderator can access.
              </p>
              <ModuleCheckboxes selected={modules} onChange={setModules} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader text="Adding…" /> : "Add to Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Member Dialog ───────────────────────────────────────────────────────

function EditMemberDialog({
  member,
  onClose,
  onUpdated,
}: {
  member: TeamMember;
  onClose: () => void;
  onUpdated: (member: TeamMember) => void;
}) {
  const [position, setPosition] = useState<AdminPosition>(
    member.position as AdminPosition,
  );
  const [modules, setModules] = useState<string[]>(member.modules ?? []);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (position === "MODERATOR" && modules.length === 0)
      return toast.error("Assign at least one module");
    setSubmitting(true);
    try {
      const updated = await updateTeamMember(member.id, {
        position,
        modules: position === "ADMIN" ? [] : modules,
      });
      onUpdated(updated);
      toast.success("Team member updated");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit {member.user.firstName}&apos;s Access</DialogTitle>
          <DialogDescription>
            Change their role or adjust which modules they can access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1 overflow-y-auto flex-1 pr-1">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={position}
              onValueChange={(v) => setPosition(v as AdminPosition)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin — full access</SelectItem>
                <SelectItem value="MODERATOR">
                  Moderator — limited access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {position === "MODERATOR" && (
            <div className="space-y-2">
              <Label>Access Modules</Label>
              <ModuleCheckboxes selected={modules} onChange={setModules} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader text="Saving…" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Guard: only SUPER_ADMIN can access this page
  useEffect(() => {
    if (user && user.adminPosition !== "SUPER_ADMIN") {
      router.replace("/a/dashboard");
    }
  }, [user, router]);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeam();
      setTeam(data);
    } catch {
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleRemove = async (member: TeamMember) => {
    if (
      !confirm(
        `Remove ${member.user.firstName} ${member.user.lastName} from the team?`,
      )
    )
      return;
    setRemoving(member.id);
    try {
      await removeTeamMember(member.id);
      setTeam((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("Team member removed");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to remove");
    } finally {
      setRemoving(null);
    }
  };

  if (user?.adminPosition !== "SUPER_ADMIN") return null;

  const superAdmins = team.filter((m) => m.position === "SUPER_ADMIN");
  const regularTeam = team.filter((m) => m.position !== "SUPER_ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start md:items-center justify-between gap-1 md:flex-row flex-col">
        <PageHeader
          back
          title="Team"
          description="Manage admin access and permissions for your team."
        />

        <Button className="w-full md:w-auto" onClick={() => setShowAdd(true)}>
          <IconPlus />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <IconLoader2
            size={24}
            className="animate-spin text-muted-foreground"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Super Admins — read only */}
          {superAdmins.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <IconShieldCheck size={18} className="text-yellow-500" />
                  Super Admin
                </CardTitle>
                <CardDescription>
                  Super Admins have unrestricted access and cannot be modified
                  here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {superAdmins.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30"
                  >
                    <MemberAvatar member={member} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                      Super Admin
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Regular team members */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {regularTeam.length === 0
                  ? "No team members yet. Add someone to get started."
                  : `${regularTeam.length} member${regularTeam.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regularTeam.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconUsers size={32} className="text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No team members added yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowAdd(true)}
                  >
                    <IconPlus size={14} className="mr-1.5" />
                    Add First Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {regularTeam.map((member) => {
                    const config =
                      positionConfig[member.position] ??
                      positionConfig.MODERATOR;
                    const Icon = config.icon;
                    return (
                      <div
                        key={member.id}
                        className="flex flex-col md:flex-row items-start gap-3 p-4 rounded-xl border border-border hover:border-border/80 transition-colors"
                      >
                        <div className="flex items-start gap-1">
                          <MemberAvatar member={member} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <Badge
                                className={cn("text-xs border", config.badge)}
                              >
                                <Icon size={11} className="mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {member.user.email}
                            </p>
                            {member.position === "MODERATOR" &&
                              member.modules.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {member.modules.map((mod) => {
                                    const label =
                                      ALL_MODULES.find((m) => m.key === mod)
                                        ?.label ?? mod;
                                    return (
                                      <span
                                        key={mod}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                      >
                                        <IconCheck size={10} />
                                        {label}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            {member.position === "ADMIN" && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Full admin access
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              Added {formatDate(member.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-2 items-center shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-1"
                            onClick={() => setEditing(member)}
                          >
                            <IconPencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive flex-1 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(member)}
                            disabled={removing === member.id}
                          >
                            {removing === member.id ? (
                              <IconLoader2 size={15} className="animate-spin" />
                            ) : (
                              <IconTrash size={15} />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <AddMemberDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={(m) => setTeam((prev) => [...prev, m])}
      />

      {editing && (
        <EditMemberDialog
          member={editing}
          onClose={() => setEditing(null)}
          onUpdated={(m) =>
            setTeam((prev) => prev.map((x) => (x.id === m.id ? m : x)))
          }
        />
      )}
    </div>
  );
}
