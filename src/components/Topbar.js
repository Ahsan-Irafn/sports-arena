"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Banknote, Calendar } from "lucide-react";
import { getTodayDateString, formatDate, formatPKR } from "@/lib/dateUtils";
import { getDashboardMetrics, subscribeToStore } from "@/lib/store";

export default function Topbar({ onNewBookingClick }) {
  const [metrics, setMetrics] = useState({ netCashInDrawer: 0 });
  const [todayStr, setTodayStr] = useState(getTodayDateString());

  useEffect(() => {
    setMetrics(getDashboardMetrics());

    const unsubscribe = subscribeToStore(() => {
      setMetrics(getDashboardMetrics());
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="top-bar no-print">
      {/* Date & Arena Timing Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
          <Calendar style={{ width: 16, height: 16, color: "var(--accent-cyan)" }} />
          <span suppressHydrationWarning style={{ fontWeight: 600, color: "var(--text-main)" }}>
            {formatDate(todayStr)}
          </span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, color: "var(--accent-green)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }}></span>
          <span>Arena Active · 4:00 PM – 2:00 AM</span>
        </div>
      </div>

      {/* Right Actions: Cash in Drawer & Quick Booking */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Desk Cash Drawer Indicator */}
        <div
          title="Current physical cash in arena reception drawer (Cash payments minus cash expenses)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            padding: "6px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px"
          }}
        >
          <Banknote style={{ width: 17, height: 17, color: "var(--accent-green)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Cash in Drawer:</span>
          <strong style={{ color: "var(--accent-green)", fontFamily: "var(--font-heading)" }}>
            {formatPKR(metrics.netCashInDrawer)}
          </strong>
        </div>

        {/* Action Button */}
        <Link href="/bookings?action=new" className="btn btn-primary btn-sm">
          <PlusCircle style={{ width: 16, height: 16 }} />
          <span>New Booking</span>
        </Link>
      </div>
    </header>
  );
}
