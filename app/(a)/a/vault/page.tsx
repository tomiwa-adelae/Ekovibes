"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IconLoader2,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  getAdminProducts,
  deleteProduct,
  updateProduct,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";

export default function AdminVaultPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        limit: LIMIT,
        search: search || undefined,
        category: category || undefined,
      });
      setProducts(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        isAvailable: !product.isAvailable,
      });
      setProducts((p) =>
        p.map((x) =>
          x.id === product.id ? { ...x, isAvailable: updated.isAvailable } : x,
        ),
      );
      toast.success(updated.isAvailable ? "Product enabled" : "Product hidden");
    } catch {
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          back
          title="The Vault"
          description={`${total} product${total !== 1 ? "s" : ""}`}
        />
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/a/vault/delivery-zones">Delivery Zones</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/a/vault/orders">Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/a/vault/new">
              <IconPlus size={15} className="mr-1" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search products…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category === "" ? "default" : "outline"}
            onClick={() => setCategory("")}
          >
            All
          </Button>
          {PRODUCT_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={category === c.value ? "default" : "outline"}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const totalStock = product.variants.reduce(
              (s, v) => s + v.stock,
              0,
            );
            return (
              <div
                key={product.id}
                className="border rounded-xl overflow-hidden bg-card flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0] || DEFAULT_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.isAvailable && (
                    <div className="absolute top-2 left-2">
                      <Badge className="text-[10px] bg-muted text-muted-foreground">
                        Hidden
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-semibold line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {product.category.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">
                      {formatNaira(product.price)}
                    </span>
                    <span
                      className={
                        totalStock === 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {totalStock === 0
                        ? "Out of stock"
                        : `${totalStock} in stock`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {product.variants.length} variant
                    {product.variants.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2 pt-1 mt-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/a/vault/${product.id}`}>
                        <IconEdit size={13} className="mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleAvailable(product)}
                      title={
                        product.isAvailable ? "Hide product" : "Show product"
                      }
                    >
                      {product.isAvailable ? (
                        <IconToggleRight size={16} className="text-green-500" />
                      ) : (
                        <IconToggleLeft
                          size={16}
                          className="text-muted-foreground"
                        />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <IconTrash size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{product.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
