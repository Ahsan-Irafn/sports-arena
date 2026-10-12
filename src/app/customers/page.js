"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  CalendarCheck,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Trophy,
  MessageCircle,
  Download
} from "lucide-react";
import { formatPKR, formatDate, getWhatsAppCustomerUrl, exportToCSV, getTodayDateString } from "@/lib/dateUtils";
import { getCustomersList, subscribeToStore } from "@/lib/store";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    setCustomers(getCustomersList());
    const unsubscribe = subscribeToStore(() => setCustomers(getCustomersList()));
    return () => unsubscribe();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Confirmed Matches",
      "Total Bookings",
      "Lifetime Spend (PKR)",
      "Last Booking Date"
    ];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.phone,
      c.email || "",
      c.confirmedBookings,
      c.totalBookings,
      c.totalSpent,
      c.lastBookingDate || ""
    ]);
    exportToCSV(`3X_Arena_Customers_${getTodayDateString()}`, headers, rows);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Customer Management (CRM)</h1>
          <p>Player and team records, booking history, lifetime arena spend & direct phone contact</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleExportCSV}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          title="Export customer roster to CSV"
        >
          <Download style={{ width: 15, height: 15 }} />
          <span>Export Players (CSV)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: "14px 20px", marginBottom: "20px" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ width: 16, height: 16, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "38px" }}
            placeholder="Search players by name or mobile number (e.g. 0317...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Confirmed Matches</th>
              <th>Lifetime Spend</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)" }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => (
                <tr key={cust.phone}>
                  <td>
                    <strong style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{cust.name}</span>
                      {cust.totalSpent >= 4000 && (
                        <span title="VIP Regular Customer" style={{ color: "var(--accent-amber)" }}>⭐</span>
                      )}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "13px" }}>📞 {cust.phone}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{cust.email || "—"}</td>
                  <td>
                    <strong style={{ color: "var(--accent-cyan)" }}>{cust.confirmedBookings}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", marginLeft: "4px" }}>
                      ({cust.totalBookings} total)
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--accent-green)", fontSize: "15px" }}>
                      {formatPKR(cust.totalSpent)}
                    </strong>
                  </td>
                  <td>
                    {cust.totalSpent >= 4000 ? (
                      <span className="badge badge-paid">VIP Regular</span>
                    ) : (
                      <span className="badge badge-confirmed">Player</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <a
                        href={getWhatsAppCustomerUrl(cust)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: "#25D366", color: "#25D366", padding: "6px 8px" }}
                        title="Chat with player on WhatsApp"
                      >
                        <MessageCircle style={{ width: 14, height: 14 }} />
                      </a>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCustomer(cust)}
                      >
                        <span>History</span>
                        <ArrowRight style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CUSTOMER HISTORY MODAL */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div>
                <h3>{selectedCustomer.name}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  📞 {selectedCustomer.phone} · Total Spent: {formatPKR(selectedCustomer.totalSpent)}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>All Match Bookings</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(selectedCustomer.bookings || []).map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong>{b.bookingNumber}</strong>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {formatDate(b.bookingDate)} · {b.courtName} ({b.durationMinutes} mins)
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ color: "var(--accent-green)", display: "block" }}>
                        {formatPKR(b.totalAmount)}
                      </strong>
                      <Link
                        href={`/receipt/${b.id}`}
                        target="_blank"
                        style={{ fontSize: "11px", color: "var(--accent-cyan)", textDecoration: "none" }}
                      >
                        Print Invoice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
