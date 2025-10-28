"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";

export default function DashboardRouterPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    
    if (user.user_type === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (user.user_type === "SERVICEMAN") {
      router.replace("/dashboard/worker");
    } else {
      router.replace("/dashboard/client");
    }
  }, [user, loading, router]);

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}