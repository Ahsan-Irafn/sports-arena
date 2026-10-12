"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  Plus,
  Receipt,
  Banknote,
  Calendar,
  Trash2,
  Filter,
  Download
} from "lucide-react";
import { formatPKR, formatDate, getTodayDateString, exportToCSV } from "@/lib/dateUtils";
import {
  getStoreData,
  createExpense,
  deleteExpense,
  subscribeToStore
} from "@/lib/store";

function ExpensesContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState({ expenses: [], expenseCategories: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash from counter drawer
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const store = getStoreData();
    setData(store);
    if (store.expenseCategories.length > 0 && !categoryId) {
      setCategoryId(store.expenseCategories[0].id);
    }

    if (searchParams.get("action") === "new") {
      setIsModalOpen(true);
    }

    const unsubscribe = subscribeToStore((updated) => setData(updated));
    return () => unsubscribe();
  }, [searchParams]);

  // Summary Metrics
  const summary = useMemo(() => {
    let total = 0;
    let cash = 0;
    let online = 0;
    (data.expenses || []).forEach((e) => {
      const amt = Number(e.amount) || 0;
      total += amt;
      if (e.paymentMethod === "Cash") cash += amt;
      else online += amt;
    });
    return { total, cash, online };
  }, [data.expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return (data.expenses || []).filter((e) => {
      if (categoryFilter !== "all" && e.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [data.expenses, categoryFilter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert("Please enter a valid expense amount in rupees.");
      return;
    }

    createExpense({
      categoryId,
      amount: numAmount,
      paymentMethod,
      date,
      notes: notes.trim()
    });

    setAmount("");
    setNotes("");
    setIsModalOpen(false);
    alert(`Expense of Rs ${numAmount} recorded (${paymentMethod})!`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      deleteExpense(id);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Expense ID",
      "Date",
      "Category",
      "Amount (PKR)",
      "Payment Method",
      "Notes / Details"
    ];
    const rows = filteredExpenses.map((exp) => {
      const cat = data.expenseCategories.find((c) => c.id === exp.categoryId);
      return [
        exp.id,
        exp.date,
        cat ? cat.name : "General",
        exp.amount,
        exp.paymentMethod || "Cash",
        exp.notes || ""
      ];
    });
    exportToCSV(`3X_Arena_Expenses_${getTodayDateString()}`, headers, rows);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Expenses & Cash Outflow</h1>
          <p>Track operating costs, utility bills, fuel, and physical cash spent from reception drawer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus style={{ width: 16, height: 16 }} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div className="metric-card accent-amber">
          <div className="metric-top">
            <span className="metric-label">Total Outflow</span>
            <div className="metric-icon-box">
              <Receipt style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-amber)" }}>
            {formatPKR(summary.total)}
          </div>
          <div className="metric-sub">Total expenses recorded</div>
        </div>

        <div className="metric-card accent-green">
          <div className="metric-top">
            <span className="metric-label">Paid via Cash (Drawer)</span>
            <div className="metric-icon-box">
              <Banknote style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-green)" }}>
            {formatPKR(summary.cash)}
          </div>
          <div className="metric-sub">Deducted from physical counter cash</div>
        </div>

        <div className="metric-card accent-cyan">
          <div className="metric-top">
            <span className="metric-label">Paid via Bank / Online</span>
            <div className="metric-icon-box">
              <Wallet style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-cyan)" }}>
            {formatPKR(summary.online)}
          </div>
          <div className="metric-sub">Bank transfer / Card expenses</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "12px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter style={{ width: 15, height: 15, color: "var(--text-muted)" }} />
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Filter by Category:</span>
          <select
            className="form-select"
            style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {data.expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing <strong>{filteredExpenses.length}</strong> expenses
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            title="Download expenses as Excel CSV"
          >
            <Download style={{ width: 14, height: 14 }} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Paid Through</th>
              <th>Notes & Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)" }}>
                  No expenses recorded.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => {
                const cat = data.expenseCategories.find((c) => c.id === exp.categoryId);
                return (
                  <tr key={exp.id}>
                    <td>
                      <strong>{formatDate(exp.date)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-confirmed">
                        {cat ? cat.name : "Category"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--accent-amber)", fontSize: "15px" }}>
                        {formatPKR(exp.amount)}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-cash">
                        {exp.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{exp.notes || "—"}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDelete(exp.id)}
                        title="Delete expense"
                      >
                        <Trash2 style={{ width: 13, height: 13, color: "var(--accent-red)" }} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: RECORD EXPENSE */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>Record Arena Expense</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Expense Category</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    {data.expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.sportType})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Amount (PKR)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 5000"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Source</label>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">💵 Cash from Desk Drawer</option>
                      <option value="Online">💳 Bank Transfer / Card</option>
                      <option value="EasyPaisa">📱 EasyPaisa / JazzCash</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Expense</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Details / Receipt Reference</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. 20 Liters diesel bought for floodlight generator during power cut"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading Expenses...</div>}>
      <ExpensesContent />
    </Suspense>
  );
}
