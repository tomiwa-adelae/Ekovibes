"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  IconBrandInstagram,
  IconGlobe,
  IconLoader2,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "@/components/Loader";
import {
  getVendorProfile,
  updateVendorProfile,
  uploadVendorLogo,
  type VendorProfile,
} from "@/lib/vendor-api";

export default function VendorSettingsPage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [brandName, setBrandName] = useState("");
  const [brandBio, setBrandBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    getVendorProfile()
      .then((p) => {
        setProfile(p);
        setBrandName(p.brandName ?? "");
        setBrandBio(p.brandBio ?? "");
        setWebsite(p.website ?? "");
        setInstagram(p.instagram ?? "");
        if (p.logoUrl) setLogoPreview(p.logoUrl);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setFetching(false));
  }, []);

  const handleLogoFile = (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, or WEBP files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleSave = async () => {
    if (!brandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    setSaving(true);
    try {
      let logoUrl = profile?.logoUrl ?? undefined;

      if (logoFile) {
        toast.loading("Uploading logo…", { id: "logo-upload" });
        try {
          logoUrl = await uploadVendorLogo(logoFile);
          toast.dismiss("logo-upload");
        } catch {
          toast.dismiss("logo-upload");
          toast.error("Logo upload failed. Try again.");
          setSaving(false);
          return;
        }
      } else if (!logoPreview && profile?.logoUrl) {
        // Logo was removed
        logoUrl = undefined;
      }

      const updated = await updateVendorProfile({
        brandName: brandName.trim(),
        brandBio: brandBio.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
        logoUrl: logoUrl ?? null,
      });

      setProfile(updated);
      setLogoFile(null);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader2 size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        back
        title="Brand Settings"
        description="Update your vendor profile and brand information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          {/* Logo */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Brand Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoPreview ? (
                <div className="relative group w-32 h-32 mx-auto rounded-full overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Brand logo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-white"
                    >
                      <IconX size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 bg-muted/30"
                  }`}
                >
                  <IconPhoto size={28} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mt-1 text-center px-2">
                    Upload logo
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) =>
                  e.target.files?.[0] && handleLogoFile(e.target.files[0])
                }
              />
              <p className="text-[11px] text-muted-foreground text-center">
                PNG, JPG or WEBP · Max 5 MB
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {/* Brand Info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Brand Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Brand Name *</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Neon Lagos"
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Bio</Label>
                <Textarea
                  value={brandBio}
                  onChange={(e) => setBrandBio(e.target.value)}
                  placeholder="A short description of your brand…"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <IconGlobe size={14} /> Website
                  </Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <IconBrandInstagram size={14} /> Instagram
                  </Label>
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@handle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader text="Saving…" /> : "Save Changes"}
        </Button>
      </div>
    </main>
  );
}
