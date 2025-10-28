"use client";
import React from "react";
import NairaIcon from "../NairaIcon";
import { useUser } from "../../contexts/UserContext";
import { useNotifications } from "../../hooks/useAPI";
import { Home, Briefcase, MessageCircle, Settings, Bell } from "lucide-react";

export default function ClientSidebar(): React.ReactElement {
  const { user, loading } = useUser();
  const { unreadCount } = useNotifications();
  const isLoading = loading && !user;
  const displayName = user?.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className="d-flex flex-column align-items-center justify-content-start p-4"
      style={{
        minWidth: "280px",
        maxWidth: "320px",
        background: "rgba(245,248,255,0.85)",
        borderRight: "1px solid var(--border)",
        minHeight: "100vh",
        boxShadow: "0 0 24px 0 rgba(52,84,250,0.04)",
      }}
    >
      <div className="w-100" style={{ position: "sticky", top: "4rem" }}>
        <div
          className="card shadow-sm mb-4 sophisticated-sidebar-card"
          style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: "1.5rem",
            boxShadow: "0 2px 12px 0 rgba(52,84,250,0.08)",
          }}
        >
          <div className="card-body text-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: 80,
                height: 80,
                background: "linear-gradient(135deg,#3454fa 60%,#6c757d 100%)",
                boxShadow: "0 2px 12px 0 rgba(52,84,250,0.08)",
                color: "white",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {isLoading ? "" : initial}
            </div>
            <h6 className="mb-0 fw-semibold" style={{ color: "var(--foreground)" }}>
              {isLoading ? "Loading..." : displayName}
            </h6>
            <p className="small mb-0" style={{ color: "var(--muted-foreground)" }}>
              Client
            </p>
          </div>
        </div>

        <div className="list-group sophisticated-sidebar-list">
          <a href="/dashboard/client" className="list-group-item list-group-item-action active d-flex align-items-center">
            <Home className="me-2" /> Dashboard
          </a>
          <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
            <Briefcase className="me-2" /> Service Requests
          </a>
          <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
            <NairaIcon size={24} color="#3454fa" /> Payment History
          </a>
          <a href="/notifications" className="list-group-item list-group-item-action d-flex align-items-center position-relative">
            <Bell className="me-2" /> Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger position-absolute top-0 end-0 translate-middle-y me-2" style={{ fontSize: '0.7rem' }}>
                {unreadCount}
              </span>
            )}
          </a>
          <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
            <MessageCircle className="me-2" /> Messages
          </a>
          <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
            <Settings className="me-2" /> Settings
          </a>
        </div>
      </div>
    </aside>
  );
}