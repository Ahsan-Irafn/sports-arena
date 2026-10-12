"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Banknote, Calendar, Menu } from "lucide-react";
import { getTodayDateString, formatDate, formatPKR } from "@/lib/dateUtils";
import { getDashboardMetrics, subscribeToStore } from "@/lib/store";

export default function Topbar({ onToggleMobileMenu = () => {} }) {
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
      {/* Left: Mobile Hamburger + Date & Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Hamburger button visible only on mobile / tablet */}
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Open mobile menu"
        >
          <Menu style={{ width: 20, height: 20 }} />
        </button>

        {/* Brand tag for small screens */}
        <div className="mobile-brand-tag">
          <span className="logo-badge" style={{ width: 28, height: 28, fontSize: 13, borderRadius: 6 }}>3X</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Sports Arena</span>
        </div>

        {/* Date & Arena Timing Status */}
        <div className="topbar-date-box" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
          <Calendar style={{ width: 16, height: 16, color: "var(--accent-cyan)" }} />
          <span suppressHydrationWarning style={{ fontWeight: 600, color: "var(--text-main)" }}>
            {formatDate(todayStr)}
          </span>
        </div>

        <div className="topbar-status-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, color: "var(--accent-green)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }}></span>
          <span>4 PM – 2 AM</span>
        </div>
      </div>

      {/* Right Actions: Cash in Drawer & Quick Booking */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Desk Cash Drawer Indicator */}
        <div
          className="topbar-cash-pill"
          title="Current physical cash in arena reception drawer"
        >
          <Banknote style={{ width: 16, height: 16, color: "var(--accent-green)", flexShrink: 0 }} />
          <span className="cash-label" style={{ color: "var(--text-muted)", fontSize: "12px" }}>Cash:</span>
          <strong style={{ color: "var(--accent-green)", fontFamily: "var(--font-heading)", fontSize: "13px" }}>
            {formatPKR(metrics.netCashInDrawer)}
          </strong>
        </div>

        {/* Quick Booking Button */}
        <Link href="/bookings?action=new" className="btn btn-primary btn-sm topbar-book-btn">
          <PlusCircle style={{ width: 15, height: 15 }} />
          <span className="book-btn-text">New Booking</span>
        </Link>
      </div>
    </header>
  );
}
