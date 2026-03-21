"use client";

import React, { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getDeliveryZones,
  saveDeliveryZones,
  type DeliveryZone,
} from "@/lib/vault-api";
import { Save } from "lucide-react";

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDeliveryZones()
      .then((z) => {
        setZones(z);
        const initial: Record<string, string> = {};
        z.forEach((zone) => {
          initial[zone.state] = String(zone.fee / 100);
        });
        setFees(initial);
      })
      .catch(() => toast.error("Failed to load delivery zones"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = zones.map((z) => ({
        state: z.state,
        fee: Math.round((parseFloat(fees[z.state] ?? "0") || 0) * 100),
      }));
      await saveDeliveryZones(payload);
      toast.success("Delivery zones saved!");
    } catch {
      toast.error("Failed to save delivery zones");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="Delivery Zones"
          description="Set delivery fees per state. All amounts in Naira (₦)."
        />
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <IconLoader2 size={14} className="animate-spin mr-1" />
          ) : (
            <Save size={14} className="mr-1" />
          )}
          Save All
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden divide-y">
          {zones.map((zone) => (
            <div
              key={zone.state}
              className="flex items-center justify-between gap-4 p-3 bg-card"
            >
              <span className="text-sm font-medium w-40 shrink-0">
                {zone.state}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-48">
                <span className="text-sm text-muted-foreground">₦</span>
                <Input
                  type="number"
                  min={0}
                  value={fees[zone.state] ?? ""}
                  onChange={(e) =>
                    setFees((f) => ({ ...f, [zone.state]: e.target.value }))
                  }
                  className="h-8"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
