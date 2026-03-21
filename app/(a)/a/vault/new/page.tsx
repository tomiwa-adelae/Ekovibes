"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconLoader2,
  IconPhoto,
  IconX,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  createProduct,
  uploadProductImage,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { cn } from "@/lib/utils";

interface VariantRow {
  name: string;
  price: string;
  stock: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>("OTHER");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    { name: "", price: "", stock: "0" },
  ]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addVariant = () =>
    setVariants((v) => [...v, { name: "", price: "", stock: "0" }]);
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantRow, value: string) => {
    setVariants((v) =>
      v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !price) {
      toast.error("Name, description and price are required");
      return;
    }
    const priceKobo = Math.round(parseFloat(price) * 100);
    if (isNaN(priceKobo) || priceKobo <= 0) {
      toast.error("Invalid price");
      return;
    }
    if (variants.some((v) => !v.name.trim())) {
      toast.error("All variants need a name");
      return;
    }

    setSubmitting(true);
    try {
      await createProduct({
        name: name.trim(),
        description: description.trim(),
        price: priceKobo,
        images,
        category,
        variants: variants.map((v) => ({
          name: v.name.trim(),
          price: v.price ? Math.round(parseFloat(v.price) * 100) : undefined,
          stock: parseInt(v.stock) || 0,
        })),
      });
      toast.success("Product created!");
      router.push("/a/vault");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="New Product"
          description="Add a product to The Vault."
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <IconLoader2 size={15} className="animate-spin mr-1" />
          ) : null}
          Publish Product
        </Button>
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
                <Label>Product Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ekovibe Signature Tee"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the product…"
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
                  <span className="text-[10px]">Add image</span>
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
              <p className="text-xs text-muted-foreground">
                First image is the cover. PNG, JPG, WEBP.
              </p>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Variants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <IconPlus size={13} className="mr-1" /> Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
                <span className="col-span-5">Name</span>
                <span className="col-span-3">Price (₦)</span>
                <span className="col-span-3">Stock</span>
                <span className="col-span-1" />
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      placeholder="e.g. Red / Large"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, "price", e.target.value)
                      }
                      placeholder="Base"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={variants.length === 1}
                      onClick={() => removeVariant(i)}
                    >
                      <IconTrash size={13} />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Leave Price blank to use the base product price.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Pricing & Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Base Price (₦) *</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 15000"
                  min={0}
                />
                {price && !isNaN(parseFloat(price)) && (
                  <p className="text-xs text-muted-foreground">
                    {formatNaira(Math.round(parseFloat(price) * 100))}
                  </p>
                )}
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
            </CardContent>
          </Card>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
          >
            {submitting ? (
              <IconLoader2 size={15} className="animate-spin mr-1" />
            ) : null}
            Publish Product
          </Button>
        </div>
      </div>
    </div>
  );
}
