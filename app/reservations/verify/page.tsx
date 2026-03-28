"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IconCheck, IconLoader2, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { verifyReservationPayment } from "@/lib/reservations-api";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("reference");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [reservationRef, setReservationRef] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }
    verifyReservationPayment(reference)
      .then((res) => {
        setReservationRef(res.reservation.reference);
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(
          e?.response?.data?.message ?? "Payment verification failed.",
        );
      });
  }, [reference]);

  return (
    <div className="max-w-sm w-full mx-4 border rounded-2xl p-8 text-center space-y-4">
      {status === "loading" && (
        <>
          <IconLoader2
            size={40}
            className="animate-spin mx-auto text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            Verifying your payment…
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <IconCheck size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Booking Confirmed
          </h2>
          <p className="text-sm text-muted-foreground">
            Your reservation <strong>{reservationRef}</strong> has been
            confirmed. A confirmation email has been sent to you.
          </p>
          <Button className="w-full" onClick={() => router.push("/tables")}>
            View My Reservations
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <IconX size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">
            Verification Failed
          </h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/reservations")}
          >
            Back to Venues
          </Button>
        </>
      )}
    </div>
  );
}

function ReservationVerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="max-w-sm w-full mx-4 border rounded-2xl p-8 text-center">
            <IconLoader2
              size={40}
              className="animate-spin mx-auto text-muted-foreground"
            />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}

export default function Page() {
  return <Suspense><ReservationVerifyPage /></Suspense>;
}
