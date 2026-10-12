"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, MessageCircle } from "lucide-react";
import { formatPKR, formatDate, formatTime12, getWhatsAppBookingUrl } from "@/lib/dateUtils";
import { getStoreData } from "@/lib/store";

export default function ReceiptClient({ id }) {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const store = getStoreData();
    const found = store.bookings.find((b) => b.id === id);
    setBooking(found || null);
  }, [id]);

  if (!booking) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Receipt Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          The requested booking invoice does not exist.
        </p>
        <Link href="/bookings" className="btn btn-secondary btn-sm" style={{ marginTop: "16px" }}>
          Back to Bookings
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "480px", margin: "20px auto" }}>
      {/* Action Buttons (Hidden on Print) */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Link href="/bookings" className="btn btn-outline btn-sm">
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span>Back to Bookings</span>
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          {booking.phone && (
            <a
              href={getWhatsAppBookingUrl(booking)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: "#25D366",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                fontWeight: 600
              }}
              title="Send slip to customer on WhatsApp"
            >
              <MessageCircle style={{ width: 14, height: 14 }} />
              <span>WhatsApp Slip</span>
            </a>
          )}
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer style={{ width: 14, height: 14 }} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Printable Slip Receipt */}
      <div
        className="printable-receipt"
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: "28px 24px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontFamily: "'Courier New', Courier, monospace"
        }}
      >
        {/* Arena Header */}
        <div style={{ textAlign: "center", borderBottom: "2px dashed #94a3b8", paddingBottom: "16px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
            3X SPORTS ARENA
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            Sports Turf & Futsal Facility · Lahore
          </p>
          <p style={{ fontSize: "11px", color: "#64748b" }}>
            Phone: +92 349 0556425 · admin@3xsportsarena.pk
          </p>
        </div>

        {/* Invoice Info */}
        <div style={{ fontSize: "12px", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Booking Ref:</strong> {booking.bookingNumber}
            <div style={{ color: "#64748b" }}>Date: {new Date(booking.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Status:</strong> {booking.paymentStatus.toUpperCase()}
            <div style={{ color: "#64748b" }}>{booking.status.toUpperCase()}</div>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px" }}>
          <div><strong>Customer:</strong> {booking.customerName}</div>
          <div><strong>Contact:</strong> {booking.phone}</div>
        </div>

        {/* Slot Details */}
        <div style={{ borderBottom: "1px dashed #cbd5e1", paddingBottom: "12px", marginBottom: "12px", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span><strong>Court:</strong> {booking.courtName}</span>
            <span style={{ textTransform: "capitalize" }}>{booking.sportType}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span><strong>Match Date:</strong></span>
            <span>{formatDate(booking.bookingDate)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>Timings:</strong></span>
            <span>{formatTime12(booking.startTime)} – {formatTime12(booking.endTime)} ({booking.durationMinutes} mins)</span>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div style={{ fontSize: "13px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>Hourly Rate:</span>
            <span>{formatPKR(booking.pricePerHour)}/hr</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>Subtotal:</span>
            <span>{formatPKR(booking.grossAmount)}</span>
          </div>
          {booking.discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#16a34a" }}>
              <span>Discount ({booking.discountType}):</span>
              <span>− {formatPKR(booking.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0f172a", paddingTop: "6px", marginTop: "6px", fontSize: "15px", fontWeight: 800 }}>
            <span>TOTAL BILL:</span>
            <span>{formatPKR(booking.totalAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", color: "#16a34a", fontWeight: 700 }}>
            <span>PAID SO FAR:</span>
            <span>{formatPKR(booking.amountPaid)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: booking.remainingAmount > 0 ? "#d97706" : "#16a34a", fontWeight: 700 }}>
            <span>REMAINING BALANCE:</span>
            <span>{formatPKR(booking.remainingAmount)}</span>
          </div>
        </div>

        {/* Payment History Log */}
        {(booking.payments || []).length > 0 && (
          <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "10px", marginBottom: "14px", fontSize: "11px" }}>
            <strong style={{ display: "block", marginBottom: "4px" }}>Payment Records:</strong>
            {booking.payments.map((p, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>• {p.type === "refund" ? "Refund" : "Received"} via {p.paymentMethod || "Cash"}</span>
                <span>{formatPKR(p.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Notes */}
        <div style={{ textAlign: "center", borderTop: "2px dashed #94a3b8", paddingTop: "14px", fontSize: "10px", color: "#64748b", lineHeight: 1.4 }}>
          <p>Thank you for choosing 3X Sports Arena!</p>
          <p>• Metal spikes & smoking are strictly prohibited on turf.</p>
          <p>• Please report to desk 10 minutes before your slot.</p>
        </div>
      </div>
    </div>
  );
}
