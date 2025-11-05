"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentsService } from "../../services/payments";
import { serviceRequestsService } from "../../services/serviceRequests";
import type { CreateServiceRequestData } from "../../types/api";

export default function BookingPaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [requestId, setRequestId] = useState<number | null>(null);

  useEffect(() => {
    if (reference) {
      verifyPaymentAndCreateRequest();
    } else {
      setStatus("failed");
      setMessage("No payment reference found");
    }
  }, [reference]);

  const verifyPaymentAndCreateRequest = async () => {
    try {
      console.log("🔍 [Callback] Payment reference:", reference);
      setMessage("Verifying payment with Paystack...");

      // Check if this is a final service payment or initial booking fee
      const paymentType = localStorage.getItem("paymentType");
      const serviceRequestId = localStorage.getItem("pendingServiceRequestId");

      console.log("💳 [Callback] Payment type:", paymentType);
      console.log("📋 [Callback] Service request ID:", serviceRequestId);

      // 1. Verify payment
      const verifyResponse = await paymentsService.verifyPayment(reference!);

      if (verifyResponse.status !== "SUCCESSFUL") {
        setStatus("failed");
        setMessage(
          `Payment verification failed. Status: ${verifyResponse.status}. Please try again.`
        );
        return;
      }

      console.log("✅ [Callback] Payment verified successfully");

      // Handle based on payment type
      if (paymentType === "FINAL_PAYMENT") {
        // Final service payment - just verify and redirect to request page
        setMessage("Payment successful! Redirecting...");
        setStatus("success");
        setRequestId(serviceRequestId ? parseInt(serviceRequestId) : null);

        // Clear saved data
        localStorage.removeItem("pendingPaymentReference");
        localStorage.removeItem("pendingServiceRequestId");
        localStorage.removeItem("paymentType");

        // Redirect to service request page after 2 seconds
        setTimeout(() => {
          if (serviceRequestId) {
            router.push(`/service-requests/${serviceRequestId}`);
          } else {
            router.push("/dashboard/client");
          }
        }, 2000);
      } else {
        // Initial booking fee - create service request
        setMessage("Payment verified! Creating your service request...");

        // 2. Get saved service request data from localStorage
        const savedData = localStorage.getItem("pendingServiceRequest");
        if (!savedData) {
          throw new Error("No pending service request found. Please start over.");
        }

        const requestData = JSON.parse(savedData);
        console.log("📦 [Callback] Retrieved saved request data:", requestData);

        // 3. Create service request with payment reference
        const createResponse = await serviceRequestsService.createServiceRequest({
          ...requestData,
          payment_reference: reference!,
        } as CreateServiceRequestData);

        console.log("✅ [Callback] Service request created:", createResponse);

        // 4. Clear saved data
        localStorage.removeItem("pendingPaymentReference");
        localStorage.removeItem("pendingServiceRequest");

        // 5. Show success
        setStatus("success");
        setMessage("Service request created successfully!");
        setRequestId(createResponse.id);

        // 6. Redirect to client dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard/client");
        }, 3000);
      }
    } catch (error: any) {
      console.error("❌ [Callback] Error:", error);
      setStatus("failed");

      // Handle specific error cases
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error === "Payment already used") {
          setMessage(
            "This payment has already been used for another service request. Please make a new payment."
          );
        } else if (errorData.error === "Payment amount mismatch") {
          setMessage(
            "Payment amount doesn't match the booking type. Please make a new payment with the correct amount."
          );
        } else if (errorData.detail) {
          setMessage(errorData.detail);
        } else {
          setMessage("Failed to create service request. Please contact support.");
        }
      } else {
        setMessage(error.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="card shadow-lg border-0">
          <div className="card-body p-5 text-center">
            {status === "verifying" && (
              <>
                <div className="mb-4">
                  <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h2 className="h3 mb-3">Verifying Payment</h2>
                <p className="text-muted mb-0">{message}</p>
                <small className="text-muted d-block mt-3">
                  Please wait, this may take a few moments...
                </small>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mb-4">
                  <div
                    className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <i className="bi bi-check2 text-white" style={{ fontSize: "4rem" }}></i>
                  </div>
                </div>
                <h2 className="h3 mb-3 text-success">Payment Successful!</h2>
                <p className="text-muted mb-3">{message}</p>
                {requestId && (
                  <div className="alert alert-success" role="alert">
                    <strong>Request ID:</strong> #{requestId}
                  </div>
                )}
                <div className="mt-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <small className="text-muted">Redirecting to your dashboard...</small>
                </div>
                <button
                  onClick={() => router.push("/dashboard/client")}
                  className="btn btn-primary mt-3"
                >
                  Go to Dashboard Now
                </button>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="mb-4">
                  <div
                    className="rounded-circle bg-danger d-inline-flex align-items-center justify-content-center"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <i className="bi bi-x-lg text-white" style={{ fontSize: "4rem" }}></i>
                  </div>
                </div>
                <h2 className="h3 mb-3 text-danger">Payment Failed</h2>
                <div className="alert alert-danger" role="alert">
                  {message}
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button
                    onClick={() => {
                      localStorage.removeItem("pendingPaymentReference");
                      localStorage.removeItem("pendingServiceRequest");
                      router.push("/servicemen");
                    }}
                    className="btn btn-primary"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/client")}
                    className="btn btn-outline-secondary"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Bootstrap Icons if not already included */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
        />
      </div>
    </div>
  );
}

