/**
 * Date and Time utilities for 3X Sports Arena
 * Simple, easy-to-understand helper functions
 */

// Format time from 24h "HH:mm" to 12h "hh:mm AM/PM"
export function formatTime12(time24) {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// Convert "HH:mm" to total minutes from start of day (e.g., "14:30" => 870)
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Convert total minutes to "HH:mm"
export function minutesToTime(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Format duration minutes into readable text (e.g. 90 => "1 hr 30 mins")
export function formatDuration(durationMinutes) {
  if (!durationMinutes || durationMinutes <= 0) return "0 min";
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr`;
  return `${mins} min`;
}

// Format a date string "YYYY-MM-DD" into human readable (e.g. "Thu, 09 Oct 2026")
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-PK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Get today's date formatted as "YYYY-MM-DD" in local time
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate the 7 days of the week starting from Monday for a given date
export function getWeekDays(startDateStr) {
  const base = startDateStr ? new Date(startDateStr) : new Date();
  // Get Monday of current week
  const dayOfWeek = base.getDay(); // 0 is Sunday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    days.push({
      dateStr,
      dayName: d.toLocaleDateString("en-PK", { weekday: "short" }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("en-PK", { month: "short" }),
      isToday: dateStr === getTodayDateString()
    });
  }
  return days;
}

// Currency formatter for Pakistani Rupees (PKR / Rs.)
export function formatPKR(amount) {
  const num = Math.round(Number(amount) || 0);
  return "Rs " + num.toLocaleString("en-PK");
}

// Normalized time range for arena night shifts (handles post-midnight slots gracefully)
export function getSlotTimeRange(startTime, endTime) {
  let startM = timeToMinutes(startTime);
  let endM = timeToMinutes(endTime);

  // If slot starts post-midnight (00:00 to 06:00) on arena night shift
  if (startM < 6 * 60) {
    startM += 1440;
  }

  // If slot ends post-midnight or at midnight (00:00 is 12:00 AM)
  if (endM <= startM) {
    if (endM <= 6 * 60) {
      endM += 1440;
    }
  }

  return { startM, endM };
}

// Check if two slots overlap (boundary times like 20:00-22:00 and 22:00-00:00 do NOT overlap)
export function checkSlotOverlap(slotA, slotB) {
  const a = getSlotTimeRange(slotA.startTime, slotA.endTime);
  const b = getSlotTimeRange(slotB.startTime, slotB.endTime);
  return a.startM < b.endM && a.endM > b.startM;
}

// Format WhatsApp link for quick match confirmation in Pakistan
export function getWhatsAppBookingUrl(booking) {
  if (!booking || !booking.phone) return "";
  let cleanPhone = String(booking.phone).replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "92" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("92")) {
    cleanPhone = "92" + cleanPhone;
  }

  const message =
`Assalam-o-Alaikum ${booking.customerName}!
Your court booking at *3X Sports Arena* is confirmed:

🏟 *Court:* ${booking.courtName} (${booking.sportType})
📅 *Date:* ${formatDate(booking.bookingDate)}
⏰ *Timing:* ${formatTime12(booking.startTime)} – ${formatTime12(booking.endTime)} (${booking.durationMinutes} mins)
💰 *Total Bill:* ${formatPKR(booking.totalAmount)}
💵 *Paid:* ${formatPKR(booking.amountPaid)}
${booking.remainingAmount > 0 ? `⚠️ *Remaining Balance:* ${formatPKR(booking.remainingAmount)}` : `✅ *Status:* Full Paid`}

Booking Ref: ${booking.bookingNumber}
Location: 3X Sports Arena, Lahore
Please arrive 10 mins prior to your match. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Format WhatsApp chat link for customer profile
export function getWhatsAppCustomerUrl(customer) {
  if (!customer || !customer.phone) return "";
  let cleanPhone = String(customer.phone).replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "92" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("92")) {
    cleanPhone = "92" + cleanPhone;
  }

  const message = `Assalam-o-Alaikum ${customer.name}! Contacting from 3X Sports Arena reception desk.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Universal zero-dependency CSV export for browser
export function exportToCSV(filename, headers, rows) {
  if (typeof window === "undefined") return;
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(","))
  ].join("\r\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

