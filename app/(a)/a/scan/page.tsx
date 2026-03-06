"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  IconCamera,
  IconCheck,
  IconX,
  IconLoader2,
  IconKeyboard,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { scanTicket, type ScanResult } from "@/lib/events-api";
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

const ScannerPage = () => {
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
  const [scanCount, setScanCount] = useState(0);

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
        const res = await scanTicket(code.trim().toUpperCase());
        setResult(res);
        setScanState(res.valid ? "success" : "used");
        if (res.valid) setScanCount((n) => n + 1);
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
      setCameraError("Camera access denied. Use manual entry below.");
      setScanState("idle");
      setShowManual(true);
    }
  }, []);

  // QR scan loop
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

  const scanAgainWithCamera = () => {
    reset();
    startCamera();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scanner Mode"
        description="Scan tickets at the door — any event"
      />

      {/* Session counter */}
      {scanCount > 0 && (
        <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-500 font-bold text-[10px]">
            {scanCount}
          </span>
          ticket{scanCount !== 1 ? "s" : ""} admitted this session
        </div>
      )}

      {/* Result: Success */}
      {scanState === "success" && result && (
        <Card className="bg-green-500/10 border border-green-500/30 text-center">
          <CardContent className="space-y-4 pt-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <IconCheck size={32} className="text-green-500" />
            </div>
            <p className="text-xs uppercase tracking-widest text-green-500">
              Valid — Admit
            </p>
            <h2 className="text-2xl font-bold uppercase">{result.holder}</h2>
            <p className="text-sm font-medium uppercase">{result.tier}</p>
            <p className="text-xs text-muted-foreground uppercase">
              {result.event}
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={scanAgainWithCamera} className="flex-1">
                <IconCamera size={14} className="mr-2" /> Scan Next
              </Button>
              <Button onClick={reset} variant="outline" className="flex-1">
                <IconKeyboard size={14} className="mr-2" /> Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result: Already Used */}
      {scanState === "used" && result && (
        <Card className="bg-red-500/10 border border-red-500/30 text-center">
          <CardContent className="space-y-4 pt-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <IconX size={32} className="text-red-500" />
            </div>
            <p className="text-xs uppercase tracking-widest text-red-500">
              Already Used — Deny
            </p>
            <h2 className="text-2xl font-bold uppercase">{result.holder}</h2>
            <p className="text-sm font-medium uppercase">{result.tier}</p>
            {result.usedAt && (
              <p className="text-xs text-muted-foreground uppercase">
                Scanned {formatDate(result.usedAt)}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={scanAgainWithCamera} className="flex-1">
                <IconCamera size={14} className="mr-2" /> Scan Next
              </Button>
              <Button onClick={reset} variant="outline" className="flex-1">
                <IconKeyboard size={14} className="mr-2" /> Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result: Error / Invalid */}
      {scanState === "error" && (
        <Card className="bg-orange-500/10 border border-orange-500/30 text-center">
          <CardContent className="space-y-4 pt-6">
            <div className="w-16 h-16 mb-2 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
              <IconX size={32} className="text-orange-500" />
            </div>
            <CardTitle className="text-orange-500 uppercase">
              Invalid Ticket
            </CardTitle>
            <CardDescription>
              This code is not recognised in our system.
            </CardDescription>
            <div className="flex gap-3 pt-2">
              <Button onClick={scanAgainWithCamera} className="flex-1">
                <IconCamera size={14} className="mr-2" /> Try Again
              </Button>
              <Button onClick={reset} variant="outline" className="flex-1">
                <IconKeyboard size={14} className="mr-2" /> Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera View */}
      {(scanState === "idle" || scanState === "scanning") && (
        <>
          <Card className="relative py-0 overflow-hidden">
            <CardContent className="p-0 aspect-square relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/30">
                  <IconCamera
                    size={48}
                    stroke={1}
                    className="text-muted-foreground"
                  />
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">
                    Camera inactive
                  </p>
                </div>
              )}

              {/* Corner guides */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-px w-full bg-white/30" />
                    </div>
                  </div>
                </div>
              )}

              {processing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <IconLoader2 size={36} className="animate-spin text-white" />
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
              variant={showManual ? "default" : "outline"}
              size="icon-lg"
              title="Manual entry"
            >
              <IconKeyboard size={16} />
            </Button>
          </div>

          {showManual && (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Label className="text-xs uppercase tracking-widest">
                  Manual Code Entry
                </Label>
                <Input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    manualCode.trim() &&
                    handleScan(manualCode)
                  }
                  placeholder="e.g. LAPD-X7K3MN"
                  className="font-mono uppercase"
                  autoFocus
                />
                <Button
                  onClick={() => handleScan(manualCode)}
                  disabled={!manualCode.trim() || processing}
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
};

export default ScannerPage;
