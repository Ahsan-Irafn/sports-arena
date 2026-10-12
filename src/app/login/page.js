"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  AlertCircle,
  ArrowRight,
  Trophy
} from "lucide-react";
import { login, isAuthenticated, DEFAULT_CREDENTIALS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@3xsportsarena.pk");
  const [password, setPassword] = useState("12345678");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (res.success) {
        router.replace("/dashboard");
      } else {
        setError(res.error || "Invalid credentials.");
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail(DEFAULT_CREDENTIALS.email);
    setPassword(DEFAULT_CREDENTIALS.password);
    setError("");
    setLoading(true);

    setTimeout(() => {
      login(DEFAULT_CREDENTIALS.email, DEFAULT_CREDENTIALS.password);
      router.replace("/dashboard");
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.12) 0%, transparent 40%)
        `,
        padding: "24px"
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          background: "rgba(21, 29, 50, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(36, 48, 79, 0.9)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.15)",
          borderRadius: "var(--radius-xl)"
        }}
      >
        {/* Arena Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, var(--accent-green), var(--accent-cyan))",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              fontSize: "24px",
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)"
            }}
          >
            3X
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-main)" }}>
            3X Sports Arena
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Admin & Reception Management Portal · Lahore
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              color: "var(--accent-red)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px"
            }}
          >
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "18px" }}>
            <label className="form-label" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Admin Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                style={{
                  width: 17,
                  height: 17,
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)"
                }}
              />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: "42px" }}
                placeholder="admin@3xsportsarena.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                style={{
                  width: 17,
                  height: 17,
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)"
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              fontSize: "15px",
              fontWeight: 600,
              justifyContent: "center",
              marginBottom: "14px"
            }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Arena Portal</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>

          {/* Quick One-Click Demo Access Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              fontSize: "13px",
              justifyContent: "center",
              gap: "8px",
              border: "1px dashed var(--border-light)"
            }}
          >
            <Zap style={{ width: 15, height: 15, color: "var(--accent-amber)" }} />
            <span>Quick 1-Click Login (Pre-filled Admin)</span>
          </button>
        </form>

        {/* Credentials Info Box */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            color: "var(--text-muted)"
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck style={{ width: 14, height: 14, color: "var(--accent-green)" }} />
            <span>Authorized Admin Credentials:</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>Email:</span>
            <code style={{ color: "var(--accent-cyan)", background: "var(--bg-muted)", padding: "2px 6px", borderRadius: "4px" }}>
              admin@3xsportsarena.pk
            </code>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Password:</span>
            <code style={{ color: "var(--accent-green)", background: "var(--bg-muted)", padding: "2px 6px", borderRadius: "4px" }}>
              12345678
            </code>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "var(--text-dim)" }}>
          3X Sports Arena Management System · v2.0 Clean Edition
        </div>
      </div>
    </div>
  );
}
