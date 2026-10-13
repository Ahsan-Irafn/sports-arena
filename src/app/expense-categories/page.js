"use client";

import { useEffect, useState } from "react";
import {
  Tags,
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  AlertCircle
} from "lucide-react";
import { formatPKR } from "@/lib/dateUtils";
import {
  getStoreData,
  createExpenseCategory,
  toggleArchiveCategory,
  deleteExpenseCategory,
  subscribeToStore
} from "@/lib/store";

export default function ExpenseCategoriesPage() {
  const [data, setData] = useState({ expenseCategories: [], expenses: [] });
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState("general");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setData(getStoreData());
    const unsubscribe = subscribeToStore((updated) => setData(updated));
    return () => unsubscribe();
  }, []);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Category name is required.");
      return;
    }

    createExpenseCategory({
      name: name.trim(),
      sportType,
      description: description.trim()
    });

    setName("");
    setDescription("");
    setIsModalOpen(false);
    alert("Category created successfully!");
  };

  const handleToggleArchive = (id) => {
    toggleArchiveCategory(id);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const res = deleteExpenseCategory(id);
      if (!res.success) {
        alert(res.error);
      } else {
        alert("Category deleted.");
      }
    }
  };

  // Filtered categories
  const categoriesList = (data.expenseCategories || []).filter((c) => {
    return showArchived ? true : !c.isArchived;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Expense Categories</h1>
          <p>Organize arena expenditures by type, facility utility, and sport discipline</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            <span>Show Archived</span>
          </label>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus style={{ width: 16, height: 16 }} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Sport Scope</th>
              <th>Description</th>
              <th>Expenses Count</th>
              <th>Total Spend</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoriesList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categoriesList.map((cat) => {
                const catExpenses = (data.expenses || []).filter((e) => e.categoryId === cat.id);
                const totalSpent = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                return (
                  <tr key={cat.id} style={{ opacity: cat.isArchived ? 0.6 : 1 }}>
                    <td>
                      <strong style={{ fontSize: "14px" }}>{cat.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-confirmed" style={{ textTransform: "capitalize" }}>
                        {cat.sportType}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{cat.description || "—"}</td>
                    <td>{catExpenses.length} entries</td>
                    <td>
                      <strong style={{ color: "var(--accent-amber)" }}>{formatPKR(totalSpent)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${cat.isArchived ? "badge-cancelled" : "badge-paid"}`}>
                        {cat.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleToggleArchive(cat.id)}
                          title={cat.isArchived ? "Restore category" : "Archive category"}
                        >
                          {cat.isArchived ? (
                            <RotateCcw style={{ width: 13, height: 13, color: "var(--accent-green)" }} />
                          ) : (
                            <Archive style={{ width: 13, height: 13 }} />
                          )}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDelete(cat.id)}
                          title="Delete category"
                          disabled={catExpenses.length > 0}
                          style={{ opacity: catExpenses.length > 0 ? 0.4 : 1 }}
                        >
                          <Trash2 style={{ width: 13, height: 13, color: "var(--accent-red)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD CATEGORY */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Create Expense Category</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cricket Balls or Generator Fuel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sport Discipline</label>
                  <select
                    className="form-select"
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                  >
                    <option value="general">General Facility (Rent, Utility, Security)</option>
                    <option value="cricket">Cricket Specific</option>
                    <option value="futsal">Futsal Specific</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe what expenses fall under this category"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
