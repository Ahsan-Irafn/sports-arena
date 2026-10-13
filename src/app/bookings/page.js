"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ListFilter,
  Plus,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Banknote,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  MessageCircle
} from "lucide-react";
import {
  formatPKR,
  formatDate,
  formatTime12,
  getTodayDateString,
  getWeekDays,
  timeToMinutes,
  checkSlotOverlap,
  getWhatsAppBookingUrl,
  exportToCSV
} from "@/lib/dateUtils";
import { calculateBookingPrice } from "@/lib/pricing";
import {
  getStoreData,
  createBooking,
  updateBooking,
  recordBookingPayment,
  cancelBooking,
  subscribeToStore
} from "@/lib/store";

function BookingsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState({ courts: [], bookings: [] });
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [courtFilter, setCourtFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today" | "YYYY-MM-DD"

  // Calendar week state
  const [currentDate, setCurrentDate] = useState(getTodayDateString());
  const [mobileDayFilter, setMobileDayFilter] = useState("all"); // "all" | specific date string

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null); // When editing existing booking
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMethod, setCollectMethod] = useState("Cash");

  // Booking Form State
  const [formCourtId, setFormCourtId] = useState("");
  const [formSportType, setFormSportType] = useState("cricket");
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formStartTime, setFormStartTime] = useState("18:00");
  const [formEndTime, setFormEndTime] = useState("20:00");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDiscountType, setFormDiscountType] = useState("none");
  const [formDiscountValue, setFormDiscountValue] = useState(0);
  const [formAdvanceAmount, setFormAdvanceAmount] = useState(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState("Cash"); // Cash or Online
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    const store = getStoreData();
    setData(store);
    if (store.courts.length > 0 && !formCourtId) {
      setFormCourtId(store.courts[0].id);
    }

    if (searchParams.get("action") === "new") {
      setEditingBookingId(null);
      setIsCreateModalOpen(true);
    }

    const unsubscribe = subscribeToStore((updated) => {
      setData(updated);
    });
    return () => unsubscribe();
  }, [searchParams]);

  // Selected Court for pricing
  const currentCourt = useMemo(() => {
    return data.courts.find((c) => c.id === formCourtId) || data.courts[0] || {};
  }, [data.courts, formCourtId]);

  // Real-time bug-free pricing calculation
  const priceCalculation = useMemo(() => {
    const existing = editingBookingId
      ? data.bookings.find((b) => b.id === editingBookingId)
      : null;

    return calculateBookingPrice({
      pricePerHour: currentCourt.pricePerHour || 2500,
      startTime: formStartTime,
      endTime: formEndTime,
      discountType: formDiscountType,
      discountValue: formDiscountValue,
      advanceAmount: formAdvanceAmount,
      alreadyPaid: existing ? existing.amountPaid : 0
    });
  }, [currentCourt, formStartTime, formEndTime, formDiscountType, formDiscountValue, formAdvanceAmount, editingBookingId, data.bookings]);

  // Check slot conflicts (excluding self if editing)
  const slotConflict = useMemo(() => {
    if (!formDate || !formStartTime || !formEndTime || !formCourtId) return null;
    if (!priceCalculation.isValid) return null;

    const currentSlot = { startTime: formStartTime, endTime: formEndTime };

    const conflict = (data.bookings || []).find((b) => {
      if (editingBookingId && b.id === editingBookingId) return false;
      if (b.courtId !== formCourtId || b.bookingDate !== formDate || b.status === "cancelled") {
        return false;
      }
      return checkSlotOverlap(currentSlot, { startTime: b.startTime, endTime: b.endTime });
    });

    return conflict || null;
  }, [data.bookings, formCourtId, formDate, formStartTime, formEndTime, editingBookingId, priceCalculation.isValid]);

  // Week days for calendar view
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Filtered bookings for Table / List view
  const filteredBookings = useMemo(() => {
    return (data.bookings || []).filter((b) => {
      if (courtFilter !== "all" && b.courtId !== courtFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (dateFilter === "today" && b.bookingDate !== getTodayDateString()) return false;
      if (dateFilter !== "all" && dateFilter !== "today" && b.bookingDate !== dateFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.customerName?.toLowerCase().includes(q);
        const matchPhone = b.phone?.includes(q);
        const matchNum = b.bookingNumber?.toLowerCase().includes(q);
        return matchName || matchPhone || matchNum;
      }
      return true;
    });
  }, [data.bookings, courtFilter, statusFilter, dateFilter, searchQuery]);

  // Open booking details and prefill collection state
  const handleOpenDetails = (b) => {
    setSelectedBooking(b);
    setCollectAmount(b.remainingAmount || 0);
    setCollectMethod("Cash");
  };

  // Export Bookings to CSV for Excel bookkeeping
  const handleExportCSV = () => {
    const headers = [
      "Booking #",
      "Customer Name",
      "Phone",
      "Court",
      "Sport",
      "Date",
      "Timings",
      "Duration (Mins)",
      "Rate/Hr",
      "Gross (Rs)",
      "Discount (Rs)",
      "Total Bill (Rs)",
      "Amount Paid (Rs)",
      "Remaining Dues (Rs)",
      "Status",
      "Payment Status"
    ];
    const rows = filteredBookings.map((b) => [
      b.bookingNumber,
      b.customerName,
      b.phone,
      b.courtName,
      b.sportType,
      b.bookingDate,
      `${b.startTime} - ${b.endTime}`,
      b.durationMinutes,
      b.pricePerHour,
      b.grossAmount,
      b.discountAmount,
      b.totalAmount,
      b.amountPaid,
      b.remainingAmount,
      b.status,
      b.paymentStatus
    ]);
    exportToCSV(`3X_Arena_Bookings_${getTodayDateString()}`, headers, rows);
  };

  // Open modal for brand new booking
  const handleOpenNew = () => {
    setEditingBookingId(null);
    setFormCustomerName("");
    setFormPhone("");
    setFormEmail("");
    setFormAdvanceAmount(0);
    setFormDiscountType("none");
    setFormDiscountValue(0);
    setFormNotes("");
    setIsCreateModalOpen(true);
  };

  // Open modal for editing existing booking
  const handleEditClick = (b) => {
    setEditingBookingId(b.id);
    setFormCourtId(b.courtId);
    setFormSportType(b.sportType);
    setFormDate(b.bookingDate);
    setFormStartTime(b.startTime);
    setFormEndTime(b.endTime);
    setFormCustomerName(b.customerName);
    setFormPhone(b.phone);
    setFormEmail(b.email || "");
    setFormDiscountType(b.discountType || "none");
    setFormDiscountValue(b.discountValue || 0);
    setFormAdvanceAmount(0);
    setFormNotes(b.notes || "");
    setSelectedBooking(null);
    setIsCreateModalOpen(true);
  };

  // Handle form submission
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formPhone.trim()) {
      alert("Please enter customer name and phone number.");
      return;
    }
    if (!priceCalculation.isValid) {
      alert(priceCalculation.error);
      return;
    }
    if (slotConflict) {
      alert(`Conflict: This slot overlaps with booking ${slotConflict.bookingNumber} (${slotConflict.customerName}).`);
      return;
    }

    if (editingBookingId) {
      // UPDATE EXISTING BOOKING
      updateBooking(editingBookingId, {
        customerName: formCustomerName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        courtId: currentCourt.id,
        sportType: formSportType,
        bookingDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        durationMinutes: priceCalculation.durationMinutes,
        pricePerHour: priceCalculation.ratePerHour,
        grossAmount: priceCalculation.grossAmount,
        discountType: formDiscountType,
        discountValue: priceCalculation.discountValue,
        discountAmount: priceCalculation.discountAmount,
        totalAmount: priceCalculation.totalAmount,
        notes: formNotes.trim()
      });

      setIsCreateModalOpen(false);
      setEditingBookingId(null);
      if (priceCalculation.refundDue > 0) {
        alert(`Booking updated! Customer duration was reduced. Please return Rs ${priceCalculation.refundDue} in Cash to customer.`);
      } else {
        alert("Booking updated successfully!");
      }
    } else {
      // CREATE BRAND NEW BOOKING
      createBooking({
        customerName: formCustomerName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        courtId: currentCourt.id,
        sportType: formSportType,
        bookingDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        durationMinutes: priceCalculation.durationMinutes,
        pricePerHour: priceCalculation.ratePerHour,
        grossAmount: priceCalculation.grossAmount,
        discountType: formDiscountType,
        discountValue: priceCalculation.discountValue,
        discountAmount: priceCalculation.discountAmount,
        totalAmount: priceCalculation.totalAmount,
        advanceAmount: priceCalculation.advanceAmount,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim()
      });

      setIsCreateModalOpen(false);
      alert("Booking successfully created!");
    }
  };

  // Handle collecting remaining cash at reception
  const handleCollectCash = () => {
    if (!selectedBooking) return;
    const amount = Number(collectAmount) || selectedBooking.remainingAmount;
    if (amount <= 0) return;

    recordBookingPayment(selectedBooking.id, {
      amount,
      paymentMethod: collectMethod,
      note: `Remaining balance collected at counter in ${collectMethod}`
    });

    setIsCollectPaymentOpen(false);
    setSelectedBooking(null);
    alert(`Payment of Rs ${amount} recorded successfully via ${collectMethod}!`);
  };

  // Handle cancellation
  const handleCancelBooking = (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking? Advance cash refund will be logged.")) {
      cancelBooking(bookingId, { refundOption: "refund_cash", reason: "Cancelled by customer/admin" });
      setSelectedBooking(null);
      alert("Booking cancelled and remaining balance zeroed.");
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Court Bookings & Schedule</h1>
          <p>Create bookings, prevent time overlaps, record desk cash & print invoices</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* View Toggles */}
          <div className="tabs-bar" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon style={{ width: 14, height: 14, display: "inline", marginRight: 6 }} />
              Weekly Calendar
            </button>
            <button
              className={`tab-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <ListFilter style={{ width: 14, height: 14, display: "inline", marginRight: 6 }} />
              Searchable Table
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleOpenNew}>
            <Plus style={{ width: 16, height: 16 }} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: WEEKLY CALENDAR */}
      {viewMode === "calendar" && (
        <div>
          {/* Week Navigator */}
          <div className="card" style={{ padding: "14px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() - 7);
                  setCurrentDate(d.toISOString().slice(0, 10));
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
                <span>Prev Week</span>
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentDate(getTodayDateString())}
              >
                Today
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(d.getDate() + 7);
                  setCurrentDate(d.toISOString().slice(0, 10));
                }}
              >
                <span>Next Week</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ fontWeight: 600, fontSize: "15px" }}>
              Week of {formatDate(weekDays[0].dateStr)} – {formatDate(weekDays[6].dateStr)}
            </div>

            {/* Court Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Court:</span>
              <select
                className="form-select"
                style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }}
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
              >
                <option value="all">All Courts</option>
                {data.courts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Day Selector Bar (Visible on phones & tablets) */}
          <div className="mobile-day-pills">
            <button
              type="button"
              className={`mobile-day-pill ${mobileDayFilter === "all" ? "active" : ""}`}
              onClick={() => setMobileDayFilter("all")}
            >
              All 7 Days
            </button>
            {weekDays.map((d) => (
              <button
                key={d.dateStr}
                type="button"
                className={`mobile-day-pill ${mobileDayFilter === d.dateStr ? "active" : ""}`}
                onClick={() => setMobileDayFilter(d.dateStr)}
              >
                <span>{d.dayName.slice(0, 3)}</span>
                <strong>{d.dayNumber} {d.isToday ? "•" : ""}</strong>
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid" style={{ minHeight: "450px" }}>
            {weekDays
              .filter((day) => mobileDayFilter === "all" || day.dateStr === mobileDayFilter)
              .map((day) => {
              const dayBookings = (data.bookings || []).filter((b) => {
                if (b.bookingDate !== day.dateStr) return false;
                if (courtFilter !== "all" && b.courtId !== courtFilter) return false;
                return true;
              });

              return (
                <div
                  key={day.dateStr}
                  className="card"
                  style={{
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    background: day.isToday ? "rgba(16, 185, 129, 0.05)" : "var(--bg-card)",
                    borderColor: day.isToday ? "var(--accent-green)" : "var(--border)"
                  }}
                >
                  <div style={{ paddingBottom: "10px", borderBottom: "1px solid var(--border)", marginBottom: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>{day.dayName}</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: day.isToday ? "var(--accent-green)" : "var(--text-main)" }}>
                      {day.dayNumber} {day.monthName}
                    </div>
                  </div>

                  {/* Day Bookings Slots */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    {dayBookings.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px 8px",
                          color: "var(--text-dim)",
                          fontSize: "12px",
                          border: "1px dashed var(--border)",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setFormDate(day.dateStr);
                          handleOpenNew();
                        }}
                      >
                        + Book Slot
                      </div>
                    ) : (
                      dayBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => handleOpenDetails(b)}
                          style={{
                            background: "var(--bg-surface)",
                            border: `1px solid ${b.status === "cancelled" ? "var(--border)" : "var(--border-light)"}`,
                            borderLeft: `4px solid ${b.status === "cancelled" ? "var(--text-dim)" : b.remainingAmount === 0 ? "var(--accent-green)" : "var(--accent-amber)"}`,
                            borderRadius: "var(--radius-sm)",
                            padding: "8px",
                            cursor: "pointer",
                            transition: "transform 0.15s, background 0.15s",
                            opacity: b.status === "cancelled" ? 0.6 : 1
                          }}
                        >
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                            <span>{formatTime12(b.startTime)}</span>
                            <span>{b.durationMinutes}m</span>
                          </div>
                          <strong style={{ fontSize: "12px", display: "block", color: "var(--text-main)", margin: "2px 0" }}>
                            {b.customerName}
                          </strong>
                          <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                            {b.courtName}
                          </div>
                          <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-green)" }}>
                              {formatPKR(b.totalAmount)}
                            </span>
                            <span className={`badge badge-${b.paymentStatus}`} style={{ fontSize: "9px", padding: "1px 6px" }}>
                              {b.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SEARCHABLE TABLE VIEW */}
      {viewMode === "list" && (
        <div>
          {/* Filters Bar */}
          <div className="card" style={{ padding: "14px 20px", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <Search style={{ width: 16, height: 16, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              <input
                type="text"
                placeholder="Search by customer name, phone, or booking #..."
                className="form-input"
                style={{ paddingLeft: "36px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: "auto" }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Matches ({formatDate(getTodayDateString())})</option>
            </select>

            <select
              className="form-select"
              style={{ width: "auto" }}
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
            >
              <option value="all">All Courts</option>
              {data.courts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Download bookings as Excel CSV"
            >
              <Download style={{ width: 14, height: 14 }} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Bookings Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Court & Sport</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Total</th>
                  <th>Paid (Cash/Online)</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)" }}>
                      No bookings found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ color: "var(--accent-cyan)" }}>{b.bookingNumber}</strong>
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
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetails(b)}
                          >
                            Details
                          </button>
                          {b.remainingAmount > 0 && b.status !== "cancelled" && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenDetails(b)}
                              title="Collect desk cash from customer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <Banknote style={{ width: 13, height: 13 }} />
                              <span>Cash</span>
                            </button>
                          )}
                          {b.phone && (
                            <a
                              href={getWhatsAppBookingUrl(b)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: "#25D366", color: "#25D366", padding: "6px 8px" }}
                              title="Send match slip via WhatsApp"
                            >
                              <MessageCircle style={{ width: 13, height: 13 }} />
                            </a>
                          )}
                          <Link
                            href={`/receipt/${b.id}`}
                            className="btn btn-outline btn-sm"
                            title="Print Customer Invoice Receipt"
                          >
                            <Printer style={{ width: 13, height: 13 }} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE OR EDIT BOOKING */}
      {isCreateModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h3>{editingBookingId ? "Edit Booking Details" : "Create Court Booking"}</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {/* Court & Sport Selection */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Select Court</label>
                    <select
                      className="form-select"
                      value={formCourtId}
                      onChange={(e) => setFormCourtId(e.target.value)}
                    >
                      {data.courts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({formatPKR(c.pricePerHour)}/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sport Type</label>
                    <select
                      className="form-select"
                      value={formSportType}
                      onChange={(e) => setFormSportType(e.target.value)}
                    >
                      <option value="cricket">Cricket</option>
                      <option value="futsal">Futsal</option>
                    </select>
                  </div>
                </div>

                {/* Date & Timings */}
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Booking Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Real-time Validation Error Banner (Fixes 22-hour bug) */}
                {!priceCalculation.isValid && (
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "10px 14px", borderRadius: "var(--radius-md)", color: "var(--accent-red)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <AlertCircle style={{ width: 18, height: 18, shrink: 0 }} />
                    <span>{priceCalculation.error}</span>
                  </div>
                )}

                {/* Overlap Conflict Banner */}
                {slotConflict && (
                  <div style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "10px 14px", borderRadius: "var(--radius-md)", color: "var(--accent-amber)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <AlertCircle style={{ width: 18, height: 18, shrink: 0 }} />
                    <span>
                      ⚠️ <strong>Slot Unavailable:</strong> Overlaps with booking #{slotConflict.bookingNumber} ({slotConflict.customerName}, {formatTime12(slotConflict.startTime)} – {formatTime12(slotConflict.endTime)}).
                    </span>
                  </div>
                )}

                {/* Customer Details */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Waqar Hussain"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="03001234567"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Pricing & Discounts */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value)}
                    >
                      <option value="none">No Discount</option>
                      <option value="fixed">Fixed Amount (Rs)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  {formDiscountType !== "none" && (
                    <div className="form-group">
                      <label className="form-label">
                        Discount Value {formDiscountType === "percentage" ? "(%)" : "(Rs)"}
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max={formDiscountType === "percentage" ? "100" : undefined}
                        value={formDiscountValue}
                        onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>

                {/* Advance Payment & Method (Only for brand new booking) */}
                {!editingBookingId && (
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">
                        Advance Paid Now
                        <span className="hint">Max {formatPKR(priceCalculation.totalAmount)}</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max={priceCalculation.totalAmount}
                        value={formAdvanceAmount}
                        onChange={(e) => setFormAdvanceAmount(Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        value={formPaymentMethod}
                        onChange={(e) => setFormPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">💵 Cash (Reception Drawer)</option>
                        <option value="Online">💳 Online / Raast / Bank Transfer</option>
                        <option value="JazzCash">📱 JazzCash / EasyPaisa</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Price Breakdown Summary Box */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Duration & Rate:</span>
                    <span>{priceCalculation.durationMinutes} mins @ {formatPKR(priceCalculation.ratePerHour)}/hr</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Subtotal (Gross):</span>
                    <span>{formatPKR(priceCalculation.grossAmount)}</span>
                  </div>
                  {priceCalculation.discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "var(--accent-green)" }}>
                      <span>Discount ({formDiscountType}):</span>
                      <span>− {formatPKR(priceCalculation.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px", fontSize: "16px", fontWeight: 700 }}>
                    <span>Total Bill:</span>
                    <span style={{ color: "var(--accent-green)" }}>{formatPKR(priceCalculation.totalAmount)}</span>
                  </div>

                  {editingBookingId && priceCalculation.alreadyPaid > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Already Paid:</span>
                      <span>{formatPKR(priceCalculation.alreadyPaid)}</span>
                    </div>
                  )}

                  {priceCalculation.refundDue > 0 ? (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      <span>Refund Due to Customer (Cash):</span>
                      <span>{formatPKR(priceCalculation.refundDue)}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Remaining Balance:</span>
                      <strong style={{ color: priceCalculation.remainingAmount > 0 ? "var(--accent-amber)" : "var(--accent-green)" }}>
                        {formatPKR(priceCalculation.remainingAmount)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!priceCalculation.isValid || !!slotConflict}
                >
                  {editingBookingId ? "Save Changes" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOKING DETAILS, CASH COLLECTION & INVOICE */}
      {selectedBooking && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null);
          }}
        >
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Booking {selectedBooking.bookingNumber}</span>
                  <span className={`badge badge-${selectedBooking.status}`}>{selectedBooking.status}</span>
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {formatDate(selectedBooking.bookingDate)} · {selectedBooking.courtName}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            </div>

            <div className="modal-body">
              {/* Customer Info Card */}
              <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "15px" }}>{selectedBooking.customerName}</strong>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                      📞 {selectedBooking.phone}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Slot Timing</span>
                    <div style={{ fontWeight: 600 }}>
                      {formatTime12(selectedBooking.startTime)} – {formatTime12(selectedBooking.endTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="stats-row-3" style={{ marginBottom: "16px", textAlign: "center" }}>
                <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Total Bill</span>
                  <strong style={{ fontSize: "18px", color: "var(--text-main)" }}>{formatPKR(selectedBooking.totalAmount)}</strong>
                </div>
                <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Paid So Far</span>
                  <strong style={{ fontSize: "18px", color: "var(--accent-green)" }}>{formatPKR(selectedBooking.amountPaid)}</strong>
                </div>
                <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Remaining Dues</span>
                  <strong style={{ fontSize: "18px", color: selectedBooking.remainingAmount > 0 ? "var(--accent-amber)" : "var(--accent-green)" }}>
                    {formatPKR(selectedBooking.remainingAmount)}
                  </strong>
                </div>
              </div>

              {/* Payment History Log */}
              <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Payment History & Cash Log</h4>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "16px" }}>
                {(selectedBooking.payments || []).length === 0 ? (
                  <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-dim)", textAlign: "center" }}>No payments recorded yet.</div>
                ) : (
                  (selectedBooking.payments || []).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      style={{
                        padding: "10px 14px",
                        borderBottom: idx === (selectedBooking.payments.length - 1) ? "none" : "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px"
                      }}
                    >
                      <div>
                        <strong>{formatPKR(p.amount)}</strong>
                        <span className="badge badge-cash" style={{ marginLeft: "8px" }}>{p.paymentMethod || "Cash"}</span>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{p.note}</div>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {p.date ? new Date(p.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Remaining Payment Collection Drawer Form */}
              {selectedBooking.remainingAmount > 0 && selectedBooking.status !== "cancelled" && (
                <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "13px", color: "var(--accent-amber)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Banknote style={{ width: 16, height: 16 }} />
                    <span>Collect Remaining Cash from Customer</span>
                  </h4>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: "140px" }}
                      value={collectAmount}
                      onChange={(e) => setCollectAmount(Number(e.target.value))}
                    />
                    <select
                      className="form-select"
                      style={{ width: "auto" }}
                      value={collectMethod}
                      onChange={(e) => setCollectMethod(e.target.value)}
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Online">💳 Online / Raast</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleCollectCash}>
                      Settle Balance
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {selectedBooking.status !== "cancelled" && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditClick(selectedBooking)}
                    >
                      <Edit style={{ width: 13, height: 13 }} />
                      <span>Edit Details</span>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {selectedBooking.phone && (
                  <a
                    href={getWhatsAppBookingUrl(selectedBooking)}
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
                    title="Send match invoice slip on WhatsApp"
                  >
                    <MessageCircle style={{ width: 14, height: 14 }} />
                    <span>WhatsApp Slip</span>
                  </a>
                )}
                <Link
                  href={`/receipt/${selectedBooking.id}`}
                  className="btn btn-secondary btn-sm"
                  target="_blank"
                >
                  <Printer style={{ width: 14, height: 14 }} />
                  <span>Print Receipt</span>
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading Bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
