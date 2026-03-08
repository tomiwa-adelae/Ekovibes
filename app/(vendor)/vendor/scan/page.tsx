"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  IconCamera,
  IconCheck,
  IconKeyboard,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { scanVendorTicket } from "@/lib/vendor-api";
import type { ScanResult } from "@/lib/events-api";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type ScanState = "idle" | "scanning" | "success" | "error" | "used";

export default function VendorScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleScan = useCallback(
    async (code: string) => {
      if (processing) return;
      setProcessing(true);
      try {
        const res = await scanVendorTicket(code);
        setResult(res);
        setScanState(res.valid ? "success" : "used");
        stopCamera();
      } catch {
        setScanState("error");
        setResult(null);
        stopCamera();
      } finally {
        setProcessing(false);
      }
    },
    [processing, stopCamera],
  );

  const startCamera = useCallback(async () => {
    setScanState("scanning");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError("Camera access denied. Use manual entry instead.");
      setScanState("idle");
      setShowManual(true);
    }
  }, []);

  useEffect(() => {
    if (!cameraActive) return;
    let jsQR: any = null;
    import("jsqr").then((m) => {
      jsQR = m.default;
    });

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !jsQR) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code?.data) {
          handleScan(code.data);
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [cameraActive, handleScan]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const reset = () => {
    setScanState("idle");
    setResult(null);
    setManualCode("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        back
        title="Scanner Mode"
        description="Scan any ticket across your events"
      />

      {scanState === "success" && result && (
        <Card className="bg-green-500/10 border border-green-500/30 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <IconCheck size={32} className="text-green-500" />
            </div>
            <p className="text-sm uppercase text-green-500">Valid Ticket</p>
            <h2 className="text-xl font-bold uppercase tracking-tighter">
              {result.holder}
            </h2>
            <p className="text-lg">{result.tier}</p>
            <p className="text-sm uppercase text-muted-foreground">
              {result.event}
            </p>
            <Button onClick={reset} className="mt-4">
              Scan Next
            </Button>
          </CardContent>
        </Card>
      )}

      {scanState === "used" && result && (
        <Card className="bg-red-500/10 border border-red-500/30 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <IconX size={32} className="text-red-500" />
            </div>
            <p className="text-xs uppercase text-red-500">Already Used</p>
            <h2 className="text-xl font-bold uppercase tracking-tighter">
              {result.holder}
            </h2>
            <p className="text-lg">{result.tier}</p>
            <p className="text-sm uppercase text-muted-foreground">
              {result.event}
            </p>
            {result.usedAt && (
              <p className="text-xs uppercase text-muted-foreground">
                Used at {formatDate(result.usedAt)}
              </p>
            )}
            <Button onClick={reset} className="mt-4">
              Scan Next
            </Button>
          </CardContent>
        </Card>
      )}

      {scanState === "error" && (
        <Card className="bg-orange-500/10 border border-orange-500/30">
          <CardContent className="text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
              <IconX size={32} className="text-orange-500" />
            </div>
            <CardTitle className="text-orange-500">Invalid Ticket</CardTitle>
            <CardDescription>
              This QR code is not recognized or doesn&apos;t belong to your
              events.
            </CardDescription>
            <Button onClick={reset} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {(scanState === "idle" || scanState === "scanning") && (
        <>
          <Card className="relative overflow-hidden">
            <CardContent className="p-0 aspect-square md:aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/50">
                  <IconCamera
                    size={48}
                    stroke={1}
                    className="text-muted-foreground"
                  />
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Camera inactive
                  </p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 border-2 border-white/60 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white" />
                  </div>
                </div>
              )}
              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <IconLoader2 size={32} className="animate-spin text-white" />
                </div>
              )}
            </CardContent>
          </Card>

          {cameraError && (
            <p className="text-xs text-orange-400 text-center">{cameraError}</p>
          )}

          <div className="flex gap-3">
            {!cameraActive ? (
              <Button onClick={startCamera} className="flex-1">
                <IconCamera size={16} className="mr-2" /> Activate Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Camera
              </Button>
            )}
            <Button
              onClick={() => setShowManual((v) => !v)}
              variant="outline"
              size="icon-lg"
            >
              <IconKeyboard size={16} />
            </Button>
          </div>

          {showManual && (
            <Card>
              <CardContent className="space-y-4">
                <Label>Manual Code Entry</Label>
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && manualCode && handleScan(manualCode)
                  }
                  placeholder="e.g. LAPD-X7K3MN"
                />
                <Button
                  onClick={() => handleScan(manualCode)}
                  disabled={!manualCode || processing}
                  className="w-full"
                >
                  {processing ? <Loader /> : "Verify Ticket"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
