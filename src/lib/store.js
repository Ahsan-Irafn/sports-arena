"use client";

/**
 * 3X Sports Arena - Central Data Store
 *
 * LocalStorage backed reactive state with realistic seed data.
 * Har function asan aur straightforward hai takay koi bhi developer ya user asaani se samajh sakay.
 */

import { getTodayDateString } from "./dateUtils.js";

const STORAGE_KEY = "3X_SPORTS_ARENA_DATA_V1";

// Initial Seed Data
const INITIAL_DATA = {
  courts: [
    {
      id: "court-1",
      name: "Artificial Grass Court",
      pricePerHour: 2500,
      sportType: "cricket",
      color: "#0ea5e9", // Electric cyan
      description: "High quality artificial turf with floodlights",
      operatingHours: { open: "16:00", close: "02:00", hoursPerDay: 10 },
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "court-2",
      name: "Natural Grass Court",
      pricePerHour: 2000,
      sportType: "cricket",
      color: "#16a34a", // Emerald green
      description: "Lush green natural turf for cricket matches",
      operatingHours: { open: "16:00", close: "02:00", hoursPerDay: 10 },
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "court-3",
      name: "Indoor Futsal Court",
      pricePerHour: 3000,
      sportType: "futsal",
      color: "#8b5cf6", // Purple
      description: "FIFA standard indoor futsal rubber court",
      operatingHours: { open: "16:00", close: "02:00", hoursPerDay: 10 },
      isArchived: false,
      createdAt: "2026-10-02"
    }
  ],
  expenseCategories: [
    {
      id: "cat-1",
      name: "Cricket Balls",
      description: "Match tape balls and practice gear",
      sportType: "cricket",
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "cat-2",
      name: "Football / Futsal",
      description: "Match balls and goal post equipment",
      sportType: "futsal",
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "cat-3",
      name: "Electricity & Generator Fuel",
      description: "LESCO electricity bills and generator diesel",
      sportType: "general",
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "cat-4",
      name: "Arena Ground Rent",
      description: "Monthly lease rent for arena property",
      sportType: "general",
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "cat-5",
      name: "Staff Salaries",
      description: "Ground staff, security guard, and desk salary",
      sportType: "general",
      isArchived: false,
      createdAt: "2026-10-01"
    },
    {
      id: "cat-6",
      name: "Floodlights & Maintenance",
      description: "Lighting, net repairs, and ground upkeep",
      sportType: "general",
      isArchived: false,
      createdAt: "2026-10-01"
    }
  ],
  expenses: [
    {
      id: "exp-1",
      categoryId: "cat-3",
      amount: 6500,
      paymentMethod: "Cash", // Cash from drawer
      date: "2026-10-08",
      notes: "Generator diesel for evening floodlights power backup",
      createdAt: "2026-10-08T18:00:00Z"
    },
    {
      id: "exp-2",
      categoryId: "cat-1",
      amount: 2400,
      paymentMethod: "Cash",
      date: "2026-10-07",
      notes: "2 dozens tape balls bought from local sports shop",
      createdAt: "2026-10-07T15:00:00Z"
    }
  ],
  bookings: [
    {
      id: "bk-1",
      bookingNumber: "3X-000001",
      customerName: "Waqar Hussain",
      phone: "03174945496",
      email: "waqar105lgu.edu@gmail.com",
      courtId: "court-1",
      courtName: "Artificial Grass Court",
      sportType: "cricket",
      bookingDate: "2026-10-08",
      startTime: "20:00",
      endTime: "22:00",
      durationMinutes: 120,
      pricePerHour: 2500,
      grossAmount: 5000,
      discountType: "fixed",
      discountValue: 600,
      discountAmount: 600,
      totalAmount: 4400,
      amountPaid: 4400,
      remainingAmount: 0,
      status: "confirmed", // "confirmed" | "pending" | "cancelled"
      paymentStatus: "paid", // "paid" | "partial" | "unpaid"
      notes: "Confirmed booking - Full paid in cash",
      payments: [
        {
          id: "pm-1",
          amount: 1000,
          paymentMethod: "Cash",
          type: "advance",
          date: "2026-10-08T11:00:00Z",
          note: "Advance received in cash"
        },
        {
          id: "pm-2",
          amount: 3400,
          paymentMethod: "Cash",
          type: "remaining",
          date: "2026-10-08T20:00:00Z",
          note: "Remaining settled at desk upon arrival"
        }
      ],
      createdAt: "2026-10-08T11:13:50Z"
    },
    {
      id: "bk-2",
      bookingNumber: "3X-000002",
      customerName: "Ahmii",
      phone: "03234050809",
      email: "",
      courtId: "court-1",
      courtName: "Artificial Grass Court",
      sportType: "cricket",
      bookingDate: "2026-10-11",
      startTime: "22:00",
      endTime: "00:00",
      durationMinutes: 120,
      pricePerHour: 2500,
      grossAmount: 5000,
      discountType: "fixed",
      discountValue: 100,
      discountAmount: 100,
      totalAmount: 4900,
      amountPaid: 0,
      remainingAmount: 0, // FIXED: Cancelled booking has 0 remaining balance
      status: "cancelled",
      paymentStatus: "unpaid",
      notes: "Customer cancelled due to rain - Advance refunded in cash",
      payments: [
        {
          id: "pm-3",
          amount: 200,
          paymentMethod: "Cash",
          type: "advance",
          date: "2026-10-08T17:28:35Z",
          note: "Advance paid"
        },
        {
          id: "pm-4",
          amount: 200,
          paymentMethod: "Cash",
          type: "refund",
          date: "2026-10-08T17:31:17Z",
          note: "Full advance returned in cash"
        }
      ],
      cancellation: {
        date: "2026-10-08T17:31:17Z",
        handling: "refunded_cash",
        reason: "Rain expected"
      },
      createdAt: "2026-10-08T17:28:35Z"
    }
  ]
};

// Listeners for reactivity
const listeners = new Set();

export function getStoreData() {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Storage error:", e);
    return INITIAL_DATA;
  }
}

export function saveStoreData(newData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    listeners.forEach((fn) => fn(newData));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

export function subscribeToStore(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ================= BOOKING OPERATIONS =================

export function createBooking(bookingData) {
  const data = getStoreData();
  const nextNum = data.bookings.length + 1;
  const bookingNumber = `3X-${String(nextNum).padStart(6, "0")}`;

  const court = data.courts.find((c) => c.id === bookingData.courtId);
  const courtName = court ? court.name : "Court";

  // Payments array initialization
  const payments = [];
  if (bookingData.advanceAmount > 0) {
    payments.push({
      id: "pm-" + Date.now(),
      amount: bookingData.advanceAmount,
      paymentMethod: bookingData.paymentMethod || "Cash",
      type: "advance",
      date: new Date().toISOString(),
      note: `Advance received via ${bookingData.paymentMethod || "Cash"}`
    });
  }

  const amountPaid = bookingData.advanceAmount || 0;
  const remainingAmount = Math.max(0, bookingData.totalAmount - amountPaid);
  const paymentStatus =
    amountPaid >= bookingData.totalAmount
      ? "paid"
      : amountPaid > 0
      ? "partial"
      : "unpaid";

  const newBooking = {
    id: "bk-" + Date.now(),
    bookingNumber,
    courtName,
    ...bookingData,
    amountPaid,
    remainingAmount,
    paymentStatus,
    status: "confirmed",
    payments,
    createdAt: new Date().toISOString()
  };

  data.bookings.unshift(newBooking);
  saveStoreData(data);
  return newBooking;
}

export function updateBooking(id, updatedFields) {
  const data = getStoreData();
  const index = data.bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = data.bookings[index];
  const court = data.courts.find((c) => c.id === updatedFields.courtId || existing.courtId);

  // Re-calculate balance
  const totalAmount = updatedFields.totalAmount !== undefined ? updatedFields.totalAmount : existing.totalAmount;
  const amountPaid = existing.amountPaid || 0;
  const remainingAmount = Math.max(0, totalAmount - amountPaid);
  const paymentStatus =
    amountPaid >= totalAmount ? "paid" : amountPaid > 0 ? "partial" : "unpaid";

  data.bookings[index] = {
    ...existing,
    ...updatedFields,
    courtName: court ? court.name : existing.courtName,
    remainingAmount,
    paymentStatus,
    updatedAt: new Date().toISOString()
  };

  saveStoreData(data);
  return data.bookings[index];
}

// Record manual Cash or Online payment
export function recordBookingPayment(bookingId, { amount, paymentMethod = "Cash", note = "" }) {
  const data = getStoreData();
  const booking = data.bookings.find((b) => b.id === bookingId);
  if (!booking) return false;

  const numAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (numAmount <= 0) return false;

  const paymentRecord = {
    id: "pm-" + Date.now(),
    amount: numAmount,
    paymentMethod,
    type: "payment",
    date: new Date().toISOString(),
    note: note || `Payment received via ${paymentMethod}`
  };

  booking.payments = booking.payments || [];
  booking.payments.push(paymentRecord);

  booking.amountPaid = (booking.amountPaid || 0) + numAmount;
  booking.remainingAmount = Math.max(0, booking.totalAmount - booking.amountPaid);
  booking.paymentStatus =
    booking.amountPaid >= booking.totalAmount
      ? "paid"
      : booking.amountPaid > 0
      ? "partial"
      : "unpaid";

  saveStoreData(data);
  return booking;
}

// Cancel booking (properly zeroing remaining balance and handling advance refund)
export function cancelBooking(bookingId, { refundOption = "refund_cash", reason = "" }) {
  const data = getStoreData();
  const booking = data.bookings.find((b) => b.id === bookingId);
  if (!booking) return false;

  booking.status = "cancelled";
  booking.remainingAmount = 0; // FIXED: Zero remaining balance

  if (booking.amountPaid > 0 && refundOption === "refund_cash") {
    // Record refund payment entry
    booking.payments.push({
      id: "pm-" + Date.now(),
      amount: booking.amountPaid,
      paymentMethod: "Cash",
      type: "refund",
      date: new Date().toISOString(),
      note: `Refund of Rs ${booking.amountPaid} given back in Cash`
    });
    booking.amountPaid = 0;
    booking.paymentStatus = "unpaid";
  }

  booking.cancellation = {
    date: new Date().toISOString(),
    handling: refundOption,
    reason: reason || "Cancelled by admin"
  };

  saveStoreData(data);
  return booking;
}

// ================= COURT OPERATIONS =================

export function createCourt(courtData) {
  const data = getStoreData();
  const newCourt = {
    id: "court-" + Date.now(),
    isArchived: false,
    operatingHours: { open: "16:00", close: "02:00", hoursPerDay: 10 },
    ...courtData,
    createdAt: new Date().toISOString()
  };
  data.courts.push(newCourt);
  saveStoreData(data);
  return newCourt;
}

export function updateCourt(id, updatedFields) {
  const data = getStoreData();
  const index = data.courts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  data.courts[index] = { ...data.courts[index], ...updatedFields };
  saveStoreData(data);
  return data.courts[index];
}

export function toggleArchiveCourt(id) {
  const data = getStoreData();
  const court = data.courts.find((c) => c.id === id);
  if (!court) return false;
  court.isArchived = !court.isArchived;
  saveStoreData(data);
  return court;
}

// ================= EXPENSE OPERATIONS =================

export function createExpense(expData) {
  const data = getStoreData();
  const newExp = {
    id: "exp-" + Date.now(),
    paymentMethod: expData.paymentMethod || "Cash",
    ...expData,
    createdAt: new Date().toISOString()
  };
  data.expenses.unshift(newExp);
  saveStoreData(data);
  return newExp;
}

export function deleteExpense(id) {
  const data = getStoreData();
  data.expenses = data.expenses.filter((e) => e.id !== id);
  saveStoreData(data);
  return true;
}

export function createExpenseCategory(catData) {
  const data = getStoreData();
  const newCat = {
    id: "cat-" + Date.now(),
    isArchived: false,
    ...catData,
    createdAt: new Date().toISOString()
  };
  data.expenseCategories.push(newCat);
  saveStoreData(data);
  return newCat;
}

export function toggleArchiveCategory(id) {
  const data = getStoreData();
  const cat = data.expenseCategories.find((c) => c.id === id);
  if (!cat) return false;
  cat.isArchived = !cat.isArchived;
  saveStoreData(data);
  return cat;
}

export function deleteExpenseCategory(id) {
  const data = getStoreData();
  // Check if any expense uses this category
  const hasExpenses = data.expenses.some((e) => e.categoryId === id);
  if (hasExpenses) {
    return { success: false, error: "This category has expenses recorded. Please archive it instead of deleting." };
  }
  data.expenseCategories = data.expenseCategories.filter((c) => c.id !== id);
  saveStoreData(data);
  return { success: true };
}

// ================= CUSTOMERS DIRECTORY =================

export function getCustomersList() {
  const data = getStoreData();
  const customerMap = {};

  (data.bookings || []).forEach((b) => {
    if (!b.phone) return;
    if (!customerMap[b.phone]) {
      customerMap[b.phone] = {
        phone: b.phone,
        name: b.customerName,
        email: b.email || "",
        totalBookings: 0,
        confirmedBookings: 0,
        totalSpent: 0,
        lastBookingDate: b.bookingDate,
        bookings: []
      };
    }
    const c = customerMap[b.phone];
    c.totalBookings += 1;
    if (b.status === "confirmed") {
      c.confirmedBookings += 1;
      c.totalSpent += b.amountPaid || 0;
    }
    c.bookings.push(b);
  });

  return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
}

// ================= DASHBOARD & FINANCIAL METRICS =================

export function getDashboardMetrics() {
  const data = getStoreData();

  // 1. Revenue Calculations
  let collectedRevenue = 0;
  let cashRevenue = 0;
  let onlineRevenue = 0;
  let bookedRevenue = 0;
  let totalDiscounts = 0;
  let hoursBooked = 0;
  let confirmedBookingsCount = 0;
  let cancelledBookingsCount = 0;

  (data.bookings || []).forEach((b) => {
    if (b.status === "confirmed") {
      confirmedBookingsCount += 1;
      bookedRevenue += b.totalAmount || 0;
      totalDiscounts += b.discountAmount || 0;
      hoursBooked += (b.durationMinutes || 0) / 60;
    } else if (b.status === "cancelled") {
      cancelledBookingsCount += 1;
    }

    // Payments recorded
    (b.payments || []).forEach((p) => {
      if (p.type === "refund") {
        collectedRevenue -= p.amount || 0;
        if (p.paymentMethod === "Cash") cashRevenue -= p.amount || 0;
        else onlineRevenue -= p.amount || 0;
      } else {
        collectedRevenue += p.amount || 0;
        if (p.paymentMethod === "Cash") cashRevenue += p.amount || 0;
        else onlineRevenue += p.amount || 0;
      }
    });
  });

  // 2. Expenses
  let totalExpenses = 0;
  let cashExpenses = 0;
  let onlineExpenses = 0;

  (data.expenses || []).forEach((e) => {
    totalExpenses += Number(e.amount) || 0;
    if (e.paymentMethod === "Cash") cashExpenses += Number(e.amount) || 0;
    else onlineExpenses += Number(e.amount) || 0;
  });

  const netProfit = collectedRevenue - totalExpenses;
  const netCashInDrawer = cashRevenue - cashExpenses; // Cash in desk drawer!

  // 3. Operational Court Utilization (Realistic: 10 operating hours/day, not 24h)
  const activeCourts = (data.courts || []).filter((c) => !c.isArchived);
  const daysInMonth = 30;
  const operationalHoursPerDay = 10; // 4:00 PM to 2:00 AM
  const totalAvailableOperationalHours = activeCourts.length * daysInMonth * operationalHoursPerDay;
  const utilizationPercent =
    totalAvailableOperationalHours > 0
      ? Math.min(100, Math.round((hoursBooked / totalAvailableOperationalHours) * 100))
      : 0;

  return {
    collectedRevenue,
    cashRevenue,
    onlineRevenue,
    bookedRevenue,
    totalExpenses,
    cashExpenses,
    onlineExpenses,
    netProfit,
    netCashInDrawer,
    hoursBooked: Math.round(hoursBooked * 10) / 10,
    confirmedBookingsCount,
    cancelledBookingsCount,
    totalDiscounts,
    utilizationPercent,
    activeCourtsCount: activeCourts.length
  };
}

// Reset data to seed (useful for testing)
export function resetStoreData() {
  saveStoreData(INITIAL_DATA);
}
