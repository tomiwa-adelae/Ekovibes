"use client";

import React, { useState } from "react";
import { IconBrandX, IconBrandWhatsapp, IconLink, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const shareX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${title} ${getUrl()}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      <Button variant="outline" size="sm" onClick={shareX}>
        <IconBrandX size={14} className="mr-1.5" /> X
      </Button>
      <Button variant="outline" size="sm" onClick={shareWhatsApp}>
        <IconBrandWhatsapp size={14} className="mr-1.5" /> WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <IconCheck size={14} className="mr-1.5 text-green-500" />
        ) : (
          <IconLink size={14} className="mr-1.5" />
        )}
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
