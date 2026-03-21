"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconLoader2,
  IconPhoto,
  IconX,
  IconPlus,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  getAdminProductById,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadProductImage,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductVariant,
  type ProductCategory,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { cn } from "@/lib/utils";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>("OTHER");
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // Variant dialog
  const [variantDialog, setVariantDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantStock, setVariantStock] = useState("");
  const [variantSaving, setVariantSaving] = useState(false);

  useEffect(() => {
    getAdminProductById(id)
      .then((p) => {
        setProduct(p);
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price / 100));
        setCategory(p.category);
        setIsAvailable(p.isAvailable);
        setImages(p.images);
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    const priceKobo = Math.round(parseFloat(price) * 100);
    if (isNaN(priceKobo)) {
      toast.error("Invalid price");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProduct(id, {
        name,
        description,
        price: priceKobo,
        category,
        isAvailable,
        images,
      });
      setProduct((p) => (p ? { ...p, ...updated } : p));
      toast.success("Product saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setVariantName("");
    setVariantPrice("");
    setVariantStock("0");
    setVariantDialog(true);
  };

  const openEditVariant = (v: ProductVariant) => {
    setEditingVariant(v);
    setVariantName(v.name);
    setVariantPrice(v.price !== null ? String(v.price / 100) : "");
    setVariantStock(String(v.stock));
    setVariantDialog(true);
  };

  const handleSaveVariant = async () => {
    if (!variantName.trim()) {
      toast.error("Variant name is required");
      return;
    }
    setVariantSaving(true);
    try {
      const stockNum = parseInt(variantStock) || 0;
      const priceKobo = variantPrice
        ? Math.round(parseFloat(variantPrice) * 100)
        : undefined;
      if (editingVariant) {
        const v = await updateVariant(editingVariant.id, {
          name: variantName.trim(),
          price: priceKobo ?? null,
          stock: stockNum,
        });
        setProduct((p) =>
          p
            ? {
                ...p,
                variants: p.variants.map((x) =>
                  x.id === editingVariant.id ? { ...x, ...v } : x,
                ),
              }
            : p,
        );
      } else {
        const v = await addVariant(id, {
          name: variantName.trim(),
          price: priceKobo,
          stock: stockNum,
        });
        setProduct((p) => (p ? { ...p, variants: [...p.variants, v] } : p));
      }
      setVariantDialog(false);
      toast.success(editingVariant ? "Variant updated" : "Variant added");
    } catch {
      toast.error("Failed to save variant");
    } finally {
      setVariantSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant(variantId);
      setProduct((p) =>
        p
          ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) }
          : p,
      );
      toast.success("Variant deleted");
    } catch {
      toast.error("Failed to delete variant");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      router.push("/a/vault");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-40">
        <IconLoader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <PageHeader
          back
          title={product.name}
          description={`${product.variants.length} variant${product.variants.length !== 1 ? "s" : ""} · ${formatNaira(product.price)}`}
        />
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <IconTrash size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <IconLoader2 size={14} className="animate-spin mr-1" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative size-24 rounded-lg overflow-hidden border group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setImages((imgs) => imgs.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconX size={11} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={cn(
                    "size-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 transition-colors",
                    uploading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {uploading ? (
                    <IconLoader2 size={18} className="animate-spin" />
                  ) : (
                    <IconPhoto size={18} />
                  )}
                  <span className="text-[10px]">Add</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button variant="outline" size="sm" onClick={openAddVariant}>
                  <IconPlus size={13} className="mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {product.variants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No variants yet.
                </p>
              ) : (
                <div className="divide-y">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between py-3 gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.price !== null
                            ? formatNaira(v.price)
                            : `Base (${formatNaira(product.price)})`}{" "}
                          · {v.stock} in stock
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditVariant(v)}
                        >
                          <IconEdit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <IconTrash size={13} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete variant "{v.name}"?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVariant(v.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Base Price (₦)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={0}
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ProductCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-xs text-muted-foreground">
                    Visible in The Vault
                  </p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variant dialog */}
      <Dialog open={variantDialog} onOpenChange={setVariantDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. Red / Large"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price Override (₦)</Label>
              <Input
                type="number"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                placeholder={`Base: ${formatNaira(product.price)}`}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use base product price.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input
                type="number"
                min={0}
                value={variantStock}
                onChange={(e) => setVariantStock(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} disabled={variantSaving}>
              {variantSaving ? (
                <IconLoader2 size={13} className="animate-spin mr-1" />
              ) : null}
              {editingVariant ? "Save" : "Add Variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
