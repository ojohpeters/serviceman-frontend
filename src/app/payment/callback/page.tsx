"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Universal Payment Callback Page
 * Handles callbacks from Paystack for both:
 * - INITIAL_BOOKING_FEE payments
 * - FINAL_PAYMENT (service payment)
 * 
 * Backend redirects to: /payment/callback?reference=...
 * This page redirects to the actual handler at /payment/booking-callback
 */
export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (reference) {
      console.log("🔀 [Callback Redirect] Received reference:", reference);
      console.log("🔀 [Callback Redirect] Forwarding to booking-callback handler...");
      
      // Redirect to the actual callback handler
      router.replace(`/payment/booking-callback?reference=${reference}`);
    } else {
      console.error("❌ [Callback Redirect] No payment reference found");
      router.replace("/dashboard/client");
    }
  }, [reference, router]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="card shadow-lg border-0">
          <div className="card-body p-5 text-center">
            <div className="mb-4">
              <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h2 className="h3 mb-3">Processing Payment...</h2>
            <p className="text-muted mb-0">Please wait while we verify your payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

