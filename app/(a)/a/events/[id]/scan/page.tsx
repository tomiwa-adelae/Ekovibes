"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconX,
  IconLoader2,
  IconKeyboard,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { scanTicket, type ScanResult } from "@/lib/events-api";

type ScanState = "idle" | "scanning" | "success" | "error" | "used";

const QRScannerPage = () => {
  const { id } = useParams<{ id: string }>();
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

  const handleScan = useCallback(async (code: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await scanTicket(code);
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
  }, [processing, stopCamera]);

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

  // QR scan loop
  useEffect(() => {
    if (!cameraActive) return;

    let jsQR: any = null;
    import("jsqr").then((m) => { jsQR = m.default; });

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
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href={`/a/events/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest mb-4 transition-colors">
          <IconArrowLeft size={12} /> Back to Event
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-tighter">
          QR Scanner
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Scan tickets at the door
        </p>
      </div>

      {/* Result: Success */}
      {scanState === "success" && result && (
        <div className="bg-green-500/10 border border-green-500/30 p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <IconCheck size={32} className="text-green-500" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-green-500">Valid Ticket</p>
          <h2 className="text-xl font-bold uppercase tracking-tighter">{result.holder}</h2>
          <p className="text-sm text-white/60">{result.tier}</p>
          <p className="text-[10px] text-white/30 uppercase">{result.event}</p>
          <Button onClick={reset} className="bg-foreground text-background rounded-none px-8 py-5 uppercase text-[10px] tracking-widest font-bold mt-4">
            Scan Next
          </Button>
        </div>
      )}

      {/* Result: Already Used */}
      {scanState === "used" && result && (
        <div className="bg-red-500/10 border border-red-500/30 p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <IconX size={32} className="text-red-500" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-red-500">Already Used</p>
          <h2 className="text-xl font-bold uppercase tracking-tighter">{result.holder}</h2>
          <p className="text-sm text-white/60">{result.tier}</p>
          {result.usedAt && (
            <p className="text-[10px] text-white/30 uppercase">
              Used at {new Date(result.usedAt).toLocaleTimeString()}
            </p>
          )}
          <Button onClick={reset} className="bg-foreground text-background rounded-none px-8 py-5 uppercase text-[10px] tracking-widest font-bold mt-4">
            Scan Next
          </Button>
        </div>
      )}

      {/* Result: Error */}
      {scanState === "error" && (
        <div className="bg-orange-500/10 border border-orange-500/30 p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
            <IconX size={32} className="text-orange-500" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-orange-500">Invalid Ticket</p>
          <p className="text-sm text-muted-foreground">This QR code is not recognised.</p>
          <Button onClick={reset} className="bg-foreground text-background rounded-none px-8 py-5 uppercase text-[10px] tracking-widest font-bold mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Camera View */}
      {(scanState === "idle" || scanState === "scanning") && (
        <>
          <div className="relative bg-black border border-border overflow-hidden aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background">
                <IconCamera size={48} className="text-white/20" stroke={1} />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Camera inactive
                </p>
              </div>
            )}

            {/* Scan overlay guides */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/60 relative">
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
          </div>

          {cameraError && (
            <p className="text-xs text-orange-400 text-center">{cameraError}</p>
          )}

          <div className="flex gap-3">
            {!cameraActive ? (
              <Button onClick={startCamera} className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-none py-6 uppercase text-[10px] tracking-widest font-bold">
                <IconCamera size={16} className="mr-2" /> Activate Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1 border-border rounded-none py-6 uppercase text-[10px] tracking-widest">
                Stop Camera
              </Button>
            )}
            <Button
              onClick={() => setShowManual((v) => !v)}
              variant="outline"
              className="border-border rounded-none py-6 px-4 uppercase text-[10px] tracking-widest"
            >
              <IconKeyboard size={16} />
            </Button>
          </div>

          {showManual && (
            <div className="bg-card border border-border p-6 space-y-4 animate-in fade-in duration-300">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Manual Code Entry
              </p>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && manualCode && handleScan(manualCode)}
                placeholder="Paste ticket UUID..."
                className="w-full bg-background border border-border p-4 text-sm font-mono outline-none focus:border-foreground/40"
              />
              <Button
                onClick={() => handleScan(manualCode)}
                disabled={!manualCode || processing}
                className="w-full bg-foreground text-background rounded-none py-5 uppercase text-[10px] tracking-widest font-bold disabled:opacity-40"
              >
                {processing ? <IconLoader2 size={16} className="animate-spin mr-2" /> : null}
                Verify Ticket
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRScannerPage;
