"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconShoppingCart,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getPublicProductBySlug,
  type Product,
  type ProductVariant,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { cn } from "@/lib/utils";

export default function VaultProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getPublicProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        const first =
          p.variants.find((v) => v.stock > 0) ?? p.variants[0] ?? null;
        setSelectedVariant(first);
      })
      .catch(() => router.replace("/vault"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <IconLoader2 size={32} className="animate-spin opacity-20" />
      </div>
    );
  }

  if (!product) return null;

  const effectivePrice = selectedVariant?.price ?? product.price;
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const images = product.images.length > 0 ? product.images : [DEFAULT_IMAGE];

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      router.push("/login");
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }
    setAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="container py-12">
      <Button
        asChild
        variant="ghost"
        className="mb-8 -ml-2 text-muted-foreground"
      >
        <Link href="/vault">
          <IconArrowLeft size={15} className="mr-1" /> The Vault
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors",
                    activeImage === i ? "border-primary" : "border-transparent",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Badge variant="outline" className="capitalize mb-2">
              {product.category.toLowerCase()}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-bold mt-2">
              {formatNaira(effectivePrice)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Variant selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    disabled={v.stock === 0}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      selectedVariant?.id === v.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : v.stock === 0
                          ? "border-muted text-muted-foreground line-through cursor-not-allowed"
                          : "border-border hover:border-primary",
                    )}
                  >
                    {v.name}
                    {v.price !== null && v.price !== product.price && (
                      <span className="ml-1 text-xs opacity-70">
                        +{formatNaira(v.price - product.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className="text-xs text-muted-foreground">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} in stock`
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          {inStock && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <IconMinus size={14} />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant?.stock ?? 1, q + 1),
                    )
                  }
                  disabled={quantity >= (selectedVariant?.stock ?? 1)}
                >
                  <IconPlus size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!inStock || !selectedVariant || adding}
            >
              {adding ? (
                <IconLoader2 size={16} className="animate-spin mr-2" />
              ) : (
                <IconShoppingCart />
              )}
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
