"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Clock,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import { formatPKR } from "@/lib/dateUtils";
import {
  getStoreData,
  createCourt,
  updateCourt,
  toggleArchiveCourt,
  subscribeToStore
} from "@/lib/store";

export default function CourtsPage() {
  const [data, setData] = useState({ courts: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [pricePerHour, setPricePerHour] = useState(2500);
  const [sportType, setSportType] = useState("cricket");
  const [color, setColor] = useState("#0ea5e9");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setData(getStoreData());
    const unsubscribe = subscribeToStore((updated) => setData(updated));
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourt(null);
    setName("");
    setPricePerHour(2500);
    setSportType("cricket");
    setColor("#0ea5e9");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (court) => {
    setEditingCourt(court);
    setName(court.name);
    setPricePerHour(court.pricePerHour);
    setSportType(court.sportType);
    setColor(court.color);
    setDescription(court.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Court name is required.");
      return;
    }

    if (editingCourt) {
      updateCourt(editingCourt.id, {
        name: name.trim(),
        pricePerHour: Number(pricePerHour),
        sportType,
        color,
        description: description.trim()
      });
      alert("Court updated successfully!");
    } else {
      createCourt({
        name: name.trim(),
        pricePerHour: Number(pricePerHour),
        sportType,
        color,
        description: description.trim()
      });
      alert("New court added successfully!");
    }

    setIsModalOpen(false);
  };

  const handleToggleArchive = (id) => {
    toggleArchiveCourt(id);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Courts & Hourly Rates</h1>
          <p>Configure arena courts, turf surfaces, hourly rates in PKR & operational timing</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus style={{ width: 16, height: 16 }} />
          <span>Add New Court</span>
        </button>
      </div>

      {/* Courts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {data.courts.map((court) => (
          <div
            key={court.id}
            className="card"
            style={{
              borderLeft: `5px solid ${court.color}`,
              opacity: court.isArchived ? 0.6 : 1,
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{court.name}</span>
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {court.sportType} Arena
                </span>
              </div>
              <span className={`badge ${court.isArchived ? "badge-cancelled" : "badge-confirmed"}`}>
                {court.isArchived ? "Archived" : "Active"}
              </span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", minHeight: "36px" }}>
              {court.description || "No description provided."}
            </p>

            <div style={{ background: "var(--bg-surface)", padding: "12px 16px", borderRadius: "var(--radius-md)", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Current Hourly Rate:</span>
              <strong style={{ fontSize: "18px", color: "var(--accent-green)", fontFamily: "var(--font-heading)" }}>
                {formatPKR(court.pricePerHour)} <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>/ hour</span>
              </strong>
            </div>

            <div style={{ fontSize: "12px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <Clock style={{ width: 14, height: 14 }} />
              <span>Operating Hours: 4:00 PM – 2:00 AM (10 hrs daily)</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleOpenEdit(court)}
              >
                <Edit2 style={{ width: 14, height: 14 }} />
                <span>Edit Rate & Details</span>
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleToggleArchive(court.id)}
                title={court.isArchived ? "Restore court" : "Archive court"}
              >
                {court.isArchived ? (
                  <RotateCcw style={{ width: 14, height: 14, color: "var(--accent-green)" }} />
                ) : (
                  <Archive style={{ width: 14, height: 14 }} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT COURT */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>{editingCourt ? "Edit Court Rate & Settings" : "Add New Court"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Court Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Artificial Turf Pitch 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price Per Hour (PKR)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    placeholder="2500"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Sport Type</label>
                    <select
                      className="form-select"
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                    >
                      <option value="cricket">Cricket</option>
                      <option value="futsal">Futsal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Theme</label>
                    <input
                      type="color"
                      className="form-input"
                      style={{ height: "42px", padding: "4px" }}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Surface Type</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. 50mm imported artificial grass with 4 floodlights"
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
                  {editingCourt ? "Save Changes" : "Create Court"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
