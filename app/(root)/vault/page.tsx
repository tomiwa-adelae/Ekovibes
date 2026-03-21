"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconLoader2, IconSearch, IconShoppingBag } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPublicProducts,
  PRODUCT_CATEGORIES,
  type ProductSummary,
  type ProductCategory,
} from "@/lib/vault-api";
import { formatNaira } from "@/lib/events-api";
import { DEFAULT_IMAGE } from "@/constants";
import { PageHeader } from "@/components/PageHeader";

export default function VaultPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const load = useCallback(
    async (currentPage = 1, reset = false) => {
      setLoading(true);
      try {
        const res = await getPublicProducts({
          page: currentPage,
          limit: LIMIT,
          search: search || undefined,
          category: category || undefined,
        });
        setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [search, category],
  );

  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => load(1, true), 300);
    return () => clearTimeout(t);
  }, [search, category, load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, false);
  };

  const hasMore = products.length < total;

  return (
    <main className="container py-12 space-y-8">
      <PageHeader
        back
        title="The Vault"
        description="Curated lifestyle products from the Ekovibe world."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={category === "" ? "default" : "outline"} onClick={() => setCategory("")}>
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

      {/* Grid */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <IconLoader2 size={32} className="animate-spin opacity-20" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-32 gap-3 text-muted-foreground">
          <IconShoppingBag size={40} className="opacity-20" />
          <p>No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
              const inStock = totalStock > 0;
              return (
                <Link
                  key={product.id}
                  href={`/vault/${product.slug}`}
                  className="group flex flex-col rounded-xl border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0] || DEFAULT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold uppercase tracking-widest">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {product.category.toLowerCase()}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold">
                      {formatNaira(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading && <IconLoader2 size={16} className="animate-spin mr-2" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
