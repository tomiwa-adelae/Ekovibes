"use client";
import React, { useEffect, useState } from "react";
import {
  IconBuilding,
  IconLoader2,
  IconMapPin,
  IconPlus,
  IconPencil,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminVenues,
  createVenue,
  updateVenue,
  type Venue,
  type VenueType,
} from "@/lib/reservations-api";

const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  RESTAURANT: "Restaurant",
  NIGHTCLUB: "Nightclub",
  LOUNGE: "Lounge",
  PRIVATE_DINING: "Private Dining",
  ROOFTOP: "Rooftop",
};

const VENUE_TYPES: VenueType[] = [
  "RESTAURANT",
  "NIGHTCLUB",
  "LOUNGE",
  "PRIVATE_DINING",
  "ROOFTOP",
];

interface VenueForm {
  name: string;
  type: VenueType | "";
  address: string;
  city: string;
  description: string;
  coverImage: string;
  instagram: string;
  website: string;
}

const EMPTY_FORM: VenueForm = {
  name: "",
  type: "",
  address: "",
  city: "",
  description: "",
  coverImage: "",
  instagram: "",
  website: "",
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [form, setForm] = useState<VenueForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (venue: Venue) => {
    setEditing(venue);
    setForm({
      name: venue.name,
      type: venue.type,
      address: venue.address,
      city: venue.city,
      description: venue.description ?? "",
      coverImage: venue.coverImage ?? "",
      instagram: venue.instagram ?? "",
      website: venue.website ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.type || !form.address || !form.city) {
      toast.error("Name, type, address, and city are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type as VenueType,
        address: form.address,
        city: form.city,
        description: form.description || undefined,
        coverImage: form.coverImage || undefined,
        instagram: form.instagram || undefined,
        website: form.website || undefined,
      };
      if (editing) {
        await updateVenue(editing.id, payload);
        toast.success("Venue updated");
      } else {
        await createVenue(payload);
        toast.success("Venue created");
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save venue");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (venue: Venue) => {
    try {
      await updateVenue(venue.id, { isActive: !venue.isActive });
      toast.success(venue.isActive ? "Venue deactivated" : "Venue activated");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update venue");
    }
  };

  const f =
    (key: keyof VenueForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 md:flex-row flex-col md:items-center">
        <PageHeader
          title="Venues"
          description="Manage The Black Book — restaurants, clubs, and dining venues."
        />

        <Button size="sm" onClick={openCreate}>
          <IconPlus size={14} className="mr-1" /> Add Venue
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 border rounded-xl">
          <IconBuilding size={36} className="text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            No venues yet. Add one to get started.
          </p>
          <Button size="sm" onClick={openCreate}>
            <IconPlus size={14} className="mr-1" /> Add Venue
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className={`border rounded-xl overflow-hidden bg-card ${!venue.isActive ? "opacity-50" : ""}`}
            >
              {venue.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={venue.coverImage}
                  alt={venue.name}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-muted flex items-center justify-center">
                  <IconBuilding
                    size={32}
                    className="text-muted-foreground/30"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm">{venue.name}</h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider shrink-0"
                  >
                    {VENUE_TYPE_LABELS[venue.type]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconMapPin size={12} />
                  {venue.address}, {venue.city}
                </div>
                {venue.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {venue.description}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(venue)}
                  >
                    <IconPencil size={12} className="mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(venue)}
                  >
                    {venue.isActive ? (
                      <IconToggleRight size={16} className="text-green-500" />
                    ) : (
                      <IconToggleLeft
                        size={16}
                        className="text-muted-foreground"
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Venue" : "New Venue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Venue Name</label>
                <Input
                  value={form.name}
                  onChange={f("name")}
                  placeholder="e.g. Nok by Alara"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as VenueType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {VENUE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={form.city}
                  onChange={f("city")}
                  placeholder="Lagos"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={form.address}
                  onChange={f("address")}
                  placeholder="12 Adeola Odeku, Victoria Island"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                value={form.description}
                onChange={f("description")}
                placeholder="Short description of the venue…"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Cover Image URL{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Input
                value={form.coverImage}
                onChange={f("coverImage")}
                placeholder="https://…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Instagram{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  value={form.instagram}
                  onChange={f("instagram")}
                  placeholder="@handle"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Website{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  value={form.website}
                  onChange={f("website")}
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <IconLoader2 size={14} className="animate-spin mr-1" />
              )}
              {editing ? "Save Changes" : "Create Venue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
