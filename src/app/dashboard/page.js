"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  Activity,
  CalendarCheck,
  Banknote,
  ArrowUpRight,
  ShieldAlert,
  Plus
} from "lucide-react";
import { formatPKR, formatDate, formatTime12 } from "@/lib/dateUtils";
import { getStoreData, getDashboardMetrics, subscribeToStore } from "@/lib/store";

export default function DashboardPage() {
  const [data, setData] = useState({ courts: [], bookings: [], expenses: [] });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    setData(getStoreData());
    setMetrics(getDashboardMetrics());

    const unsubscribe = subscribeToStore((updated) => {
      setData(updated);
      setMetrics(getDashboardMetrics());
    });
    return () => unsubscribe();
  }, []);

  if (!metrics) return null;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Arena Operations Dashboard</h1>
          <p>Real-time booking income, cash drawer tracking, expenses & court utilization</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/bookings?action=new" className="btn btn-primary">
            <Plus style={{ width: 16, height: 16 }} />
            <span>Create Booking</span>
          </Link>
          <Link href="/expenses?action=new" className="btn btn-secondary">
            <Receipt style={{ width: 16, height: 16 }} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        {/* 1. Collected Revenue */}
        <div className="metric-card accent-green">
          <div className="metric-top">
            <span className="metric-label">Collected Revenue</span>
            <div className="metric-icon-box">
              <DollarSign style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-green)" }}>
            {formatPKR(metrics.collectedRevenue)}
          </div>
          <div className="metric-sub" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>💵 Cash: {formatPKR(metrics.cashRevenue)}</span>
            <span>💳 Online: {formatPKR(metrics.onlineRevenue)}</span>
          </div>
        </div>

        {/* 2. Total Expenses */}
        <div className="metric-card accent-amber">
          <div className="metric-top">
            <span className="metric-label">Total Expenses</span>
            <div className="metric-icon-box">
              <Receipt style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-amber)" }}>
            {formatPKR(metrics.totalExpenses)}
          </div>
          <div className="metric-sub">
            <span>From Cash Drawer: {formatPKR(metrics.cashExpenses)}</span>
          </div>
        </div>

        {/* 3. Net Profit */}
        <div className="metric-card accent-cyan">
          <div className="metric-top">
            <span className="metric-label">Net Profit</span>
            <div className="metric-icon-box">
              <TrendingUp style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: metrics.netProfit >= 0 ? "var(--accent-cyan)" : "var(--accent-red)" }}>
            {formatPKR(metrics.netProfit)}
          </div>
          <div className="metric-sub">
            <span>Collected Revenue − Total Expenses</span>
          </div>
        </div>

        {/* 4. Cash In Desk Drawer */}
        <div className="metric-card accent-purple">
          <div className="metric-top">
            <span className="metric-label">Physical Cash in Drawer</span>
            <div className="metric-icon-box">
              <Banknote style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-purple)" }}>
            {formatPKR(metrics.netCashInDrawer)}
          </div>
          <div className="metric-sub">
            <span>Physical cash at reception counter</span>
          </div>
        </div>
      </div>

      {/* Second Row: Utilization & Hours */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        {/* Court Operational Utilization Card */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity style={{ width: 18, height: 18, color: "var(--accent-cyan)" }} />
              <span>Court Utilization (Operational Hours)</span>
            </h3>
            <span className="badge badge-paid">{metrics.utilizationPercent}% Booked</span>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ width: "100%", height: "10px", background: "var(--bg-muted)", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, metrics.utilizationPercent)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent-green), var(--accent-cyan))",
                  borderRadius: "999px",
                  transition: "width 0.5s ease"
                }}
              ></div>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            💡 <strong>Accurate Formula:</strong> Utilization is calculated against the arena's actual 10 operating hours/day (4:00 PM – 2:00 AM) across {metrics.activeCourtsCount} active courts. Total hours booked: <strong>{metrics.hoursBooked} hrs</strong>.
          </p>
        </div>

        {/* Bookings Summary Card */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarCheck style={{ width: 18, height: 18, color: "var(--accent-green)" }} />
              <span>Booking Statistics</span>
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>This Month</span>
          </div>

          <div className="stats-row-3" style={{ textAlign: "center" }}>
            <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Confirmed</span>
              <strong style={{ fontSize: "20px", color: "var(--accent-green)" }}>{metrics.confirmedBookingsCount}</strong>
            </div>
            <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Cancelled</span>
              <strong style={{ fontSize: "20px", color: "var(--text-dim)" }}>{metrics.cancelledBookingsCount}</strong>
            </div>
            <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Discounts</span>
              <strong style={{ fontSize: "20px", color: "var(--accent-amber)" }}>{formatPKR(metrics.totalDiscounts)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Courts Overview Grid */}
      <h3 style={{ fontSize: "18px", marginBottom: "14px" }}>Active Courts</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {(data.courts || []).filter(c => !c.isArchived).map((court) => (
          <div key={court.id} className="card" style={{ borderLeft: `4px solid ${court.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "15px" }}>{court.name}</h4>
              <span className="badge badge-confirmed" style={{ textTransform: "capitalize" }}>{court.sportType}</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>{court.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Hourly Rate:</span>
              <strong style={{ fontSize: "16px", color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                {formatPKR(court.pricePerHour)} / hr
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "18px" }}>Recent Arena Bookings</h3>
        <Link href="/bookings" className="btn btn-outline btn-sm">
          <span>View All Bookings</span>
          <ArrowUpRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking #</th>
              <th>Customer</th>
              <th>Court & Sport</th>
              <th>Date & Timing</th>
              <th>Duration</th>
              <th>Total Bill</th>
              <th>Paid (Cash/Online)</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.bookings || []).slice(0, 6).map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={`/receipt/${b.id}`} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                    {b.bookingNumber}
                  </Link>
                </td>
                <td>
                  <strong style={{ display: "block" }}>{b.customerName}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{b.phone}</span>
                </td>
                <td>
                  <span>{b.courtName}</span>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-dim)", textTransform: "capitalize" }}>
                    {b.sportType}
                  </span>
                </td>
                <td>
                  <span style={{ display: "block", fontWeight: 500 }}>{formatDate(b.bookingDate)}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    {formatTime12(b.startTime)} – {formatTime12(b.endTime)}
                  </span>
                </td>
                <td>{b.durationMinutes} min</td>
                <td><strong>{formatPKR(b.totalAmount)}</strong></td>
                <td>
                  <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>
                    {formatPKR(b.amountPaid)}
                  </span>
                </td>
                <td>
                  <span style={{ color: b.remainingAmount > 0 ? "var(--accent-amber)" : "var(--text-dim)", fontWeight: 600 }}>
                    {formatPKR(b.remainingAmount)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${b.status}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
