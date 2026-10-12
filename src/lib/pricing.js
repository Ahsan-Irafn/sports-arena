/**
 * Pricing & Calculation Engine for 3X Sports Arena
 *
 * Yahan tamam calculations clear aur bug-free hain:
 * 1. Inverted time bug fix: End time lazmi Start time ke baad hona chahiye.
 * 2. Proper duration calculation (Minutes aur Hours).
 * 3. Discount calculation (Percentage ya Fixed Rupees).
 * 4. Advance payment & Remaining dues.
 * 5. Overpayment on edit handling: Agar customer pehle zyada paise de chuka ho to Refund Due calculate hota hai.
 */

import { timeToMinutes } from "./dateUtils.js";

export function calculateBookingPrice({
  pricePerHour = 0,
  startTime = "18:00",
  endTime = "19:00",
  discountType = "none", // "none" | "percentage" | "fixed"
  discountValue = 0,
  advanceAmount = 0,
  alreadyPaid = 0, // Previously recorded payments (when editing existing booking)
  minDurationMinutes = 30, // Minimum booking duration
  maxDurationHours = 6 // Maximum single booking duration
}) {
  const rate = Math.max(0, Number(pricePerHour) || 0);
  const startMins = timeToMinutes(startTime);
  let endMins = timeToMinutes(endTime);

  // Handle midnight & post-midnight night slots (e.g. 22:00 to 00:00 or 23:00 to 01:00)
  // If start is afternoon/evening (>= 12:00 PM) and end is midnight/early morning (<= 6:00 AM)
  let spansMidnight = false;
  if (endMins <= startMins && startMins >= 12 * 60 && endMins <= 6 * 60) {
    endMins += 1440;
    spansMidnight = true;
  }

  // VALIDATION 1: End time must be strictly after start time
  if (endMins <= startMins) {
    return {
      isValid: false,
      error: "End time must be after Start time (e.g., 6:00 PM to 8:00 PM, or 10:00 PM to 12:00 AM).",
      durationMinutes: 0,
      grossAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      remainingAmount: 0,
      refundDue: 0,
      spansMidnight: false
    };
  }

  const durationMinutes = endMins - startMins;

  // VALIDATION 2: Minimum slot duration check
  if (durationMinutes < minDurationMinutes) {
    return {
      isValid: false,
      error: `Minimum booking duration is ${minDurationMinutes} minutes.`,
      durationMinutes,
      grossAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      remainingAmount: 0,
      refundDue: 0,
      spansMidnight
    };
  }

  // VALIDATION 3: Maximum slot duration check (Prevents accidental inverted 22-hour slots)
  if (durationMinutes > maxDurationHours * 60) {
    return {
      isValid: false,
      error: `Maximum single booking duration is ${maxDurationHours} hours. Please check slot timings.`,
      durationMinutes,
      grossAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      remainingAmount: 0,
      refundDue: 0,
      spansMidnight
    };
  }

  // 1. Calculate Gross Subtotal
  // Example: Rs 2,500/hr * (120 mins / 60) = Rs 5,000
  const grossAmount = Math.round(rate * (durationMinutes / 60));

  // 2. Calculate Discount
  let discountAmount = 0;
  const numDiscountValue = Math.max(0, Number(discountValue) || 0);

  if (discountType === "percentage") {
    // 1% to 100%
    const pct = Math.min(100, numDiscountValue);
    discountAmount = Math.round((grossAmount * pct) / 100);
  } else if (discountType === "fixed") {
    // Cannot exceed grossAmount
    discountAmount = Math.min(grossAmount, Math.round(numDiscountValue));
  }

  // 3. Net Total Amount
  const totalAmount = Math.max(0, grossAmount - discountAmount);

  // 4. Advance & Payments Calculation
  const numAdvance = Math.max(0, Math.round(Number(advanceAmount) || 0));
  const numAlreadyPaid = Math.max(0, Math.round(Number(alreadyPaid) || 0));
  const totalPaidSoFar = numAdvance + numAlreadyPaid;

  let remainingAmount = 0;
  let refundDue = 0;

  if (totalPaidSoFar > totalAmount) {
    // Agar customer ne pehle zyada de diya aur ab booking choti hui
    refundDue = totalPaidSoFar - totalAmount;
    remainingAmount = 0;
  } else {
    remainingAmount = totalAmount - totalPaidSoFar;
    refundDue = 0;
  }

  return {
    isValid: true,
    error: null,
    ratePerHour: rate,
    durationMinutes,
    grossAmount,
    discountType,
    discountValue: numDiscountValue,
    discountAmount,
    totalAmount,
    advanceAmount: numAdvance,
    alreadyPaid: numAlreadyPaid,
    remainingAmount,
    refundDue,
    spansMidnight
  };
}
