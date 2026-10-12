"use client";

/**
 * Authentication Module for 3X Sports Arena Portal
 * 
 * Credentials:
 * Email: admin@3xsportsarena.pk
 * Password: 12345678
 */

const AUTH_STORAGE_KEY = "3X_ARENA_AUTH_USER_V1";

export const DEFAULT_CREDENTIALS = {
  email: "admin@3xsportsarena.pk",
  password: "12345678",
  name: "Arena Admin",
  role: "Super Admin"
};

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function login(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  // Validate credentials against arena admin account
  if (
    cleanEmail === DEFAULT_CREDENTIALS.email.toLowerCase() &&
    cleanPass === DEFAULT_CREDENTIALS.password
  ) {
    const user = {
      email: DEFAULT_CREDENTIALS.email,
      name: DEFAULT_CREDENTIALS.name,
      role: DEFAULT_CREDENTIALS.role,
      loggedInAt: new Date().toISOString()
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    return { success: true, user };
  }

  // Also support any arena staff email if password is correct
  if (cleanPass === "12345678" && cleanEmail.includes("@")) {
    const user = {
      email: cleanEmail,
      name: cleanEmail.split("@")[0].toUpperCase() + " (Staff)",
      role: "Arena Staff",
      loggedInAt: new Date().toISOString()
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    return { success: true, user };
  }

  return {
    success: false,
    error: "Invalid email or password. Use admin@3xsportsarena.pk / 12345678"
  };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
