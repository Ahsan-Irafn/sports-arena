const { calculateBookingPrice } = require('./src/lib/pricing');
const {
  formatPKR,
  formatDate,
  formatTime12,
  timeToMinutes,
  getWeekDays,
  checkSlotOverlap,
  getWhatsAppBookingUrl
} = require('./src/lib/dateUtils');

console.log("=================== RUNNING AUTOMATED COMPREHENSIVE QA ON 3X SPORTS ARENA ===================");

let failedTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName} - ${details}`);
    failedTests++;
  }
}

// 1. Pricing Engine Tests
console.log("\n--- TEST GROUP 1: Pricing Engine, Inverted Time Trap & Midnight Slots ---");

// Test 1.1: Standard 2-hour booking at Rs 2,500/hr
const p1 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "18:00",
  endTime: "20:00",
  discountType: "none",
  discountValue: 0,
  advanceAmount: 1000
});
assert(p1.isValid === true, "Standard booking is valid");
assert(p1.durationMinutes === 120, "Duration is 120 minutes (2 hrs)", `Got ${p1.durationMinutes}`);
assert(p1.grossAmount === 5000, "Gross amount is Rs 5,000", `Got ${p1.grossAmount}`);
assert(p1.totalAmount === 5000, "Total amount is Rs 5,000", `Got ${p1.totalAmount}`);
assert(p1.remainingAmount === 4000, "Remaining balance is Rs 4,000", `Got ${p1.remainingAmount}`);

// Test 1.2: Inverted time slot (The 22-Hour Trap)
const p2 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "12:00",
  endTime: "10:00"
});
assert(p2.isValid === false, "Inverted time (12:00 to 10:00) is REJECTED", "Should be invalid");
assert(p2.grossAmount === 0, "Gross amount is 0 on inverted time", `Got ${p2.grossAmount}`);
assert(p2.error && p2.error.includes("End time must be after Start time"), "Clear error message displayed on inverted time");

// Test 1.3: Midnight Booking (10:00 PM to 12:00 AM midnight)
const pMidnight = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "22:00",
  endTime: "00:00"
});
assert(pMidnight.isValid === true, "Midnight booking (22:00 to 00:00) is VALID");
assert(pMidnight.durationMinutes === 120, "Midnight duration is 120 mins", `Got ${pMidnight.durationMinutes}`);
assert(pMidnight.grossAmount === 5000, "Midnight gross amount is Rs 5,000", `Got ${pMidnight.grossAmount}`);
assert(pMidnight.spansMidnight === true, "spansMidnight flag is TRUE");

// Test 1.4: Post-Midnight Night Match (11:00 PM to 1:00 AM)
const pLate = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "23:00",
  endTime: "01:00"
});
assert(pLate.isValid === true, "Post-midnight booking (23:00 to 01:00) is VALID");
assert(pLate.durationMinutes === 120, "Post-midnight duration is 120 mins", `Got ${pLate.durationMinutes}`);
assert(pLate.grossAmount === 5000, "Post-midnight gross amount is Rs 5,000");

// Test 1.5: Equal start and end time (0 duration)
const p3 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "18:00",
  endTime: "18:00"
});
assert(p3.isValid === false, "Equal start/end time is REJECTED");

// Test 1.6: Fixed discount
const p4 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "18:00",
  endTime: "20:00",
  discountType: "fixed",
  discountValue: 600,
  advanceAmount: 2000
});
assert(p4.discountAmount === 600, "Fixed discount of Rs 600 applied", `Got ${p4.discountAmount}`);
assert(p4.totalAmount === 4400, "Total amount is Rs 4,400", `Got ${p4.totalAmount}`);
assert(p4.remainingAmount === 2400, "Remaining amount is Rs 2,400", `Got ${p4.remainingAmount}`);

// Test 1.7: Percentage discount
const p5 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "18:00",
  endTime: "20:00",
  discountType: "percentage",
  discountValue: 20 // 20%
});
assert(p5.discountAmount === 1000, "20% discount on Rs 5,000 is Rs 1,000", `Got ${p5.discountAmount}`);
assert(p5.totalAmount === 4000, "Total amount is Rs 4,000", `Got ${p5.totalAmount}`);

// Test 1.8: Overpayment / Refund Due on Edit
const p6 = calculateBookingPrice({
  pricePerHour: 2500,
  startTime: "18:00",
  endTime: "18:30", // 30 mins -> Rs 1,250
  alreadyPaid: 2000 // Customer already paid Rs 2,000
});
assert(p6.grossAmount === 1250, "Gross is Rs 1,250 for 30 mins");
assert(p6.totalAmount === 1250, "Total is Rs 1,250");
assert(p6.remainingAmount === 0, "Remaining dues is Rs 0");
assert(p6.refundDue === 750, "Refund Due is Rs 750 (Customer owed cash)", `Got ${p6.refundDue}`);

console.log("\n--- TEST GROUP 2: Slot Overlap & Conflict Detection ---");

// Adjacent slots: 20:00 to 22:00 vs 22:00 to 00:00 (Back-to-back matches, NO conflict)
const noOverlap = checkSlotOverlap(
  { startTime: "20:00", endTime: "22:00" },
  { startTime: "22:00", endTime: "00:00" }
);
assert(noOverlap === false, "Adjacent slots (20:00-22:00 and 22:00-00:00) do NOT overlap");

// Overlapping slots: 21:00 to 23:00 vs 22:00 to 00:00 (Conflict!)
const hasOverlap = checkSlotOverlap(
  { startTime: "21:00", endTime: "23:00" },
  { startTime: "22:00", endTime: "00:00" }
);
assert(hasOverlap === true, "Overlapping evening slots detected as CONFLICT");

// Midnight crossing overlap: 22:00 to 00:00 vs 23:00 to 01:00 (Conflict!)
const midnightOverlap = checkSlotOverlap(
  { startTime: "22:00", endTime: "00:00" },
  { startTime: "23:00", endTime: "01:00" }
);
assert(midnightOverlap === true, "Midnight crossing slots (22:00-00:00 vs 23:00-01:00) detected as CONFLICT");

// Adjacent midnight slots: 22:00 to 00:00 vs 00:00 to 02:00 (NO conflict!)
const adjacentMidnight = checkSlotOverlap(
  { startTime: "22:00", endTime: "00:00" },
  { startTime: "00:00", endTime: "02:00" }
);
assert(adjacentMidnight === false, "Adjacent midnight slots (22:00-00:00 and 00:00-02:00) do NOT overlap");

console.log("\n--- TEST GROUP 3: Date, Currency & WhatsApp Helpers ---");
assert(formatPKR(2500) === "Rs 2,500", "Currency formatting for 2500", formatPKR(2500));
assert(formatTime12("18:00") === "6:00 PM", "18:00 formats to 6:00 PM", formatTime12("18:00"));
assert(formatTime12("00:00") === "12:00 AM", "00:00 formats to 12:00 AM", formatTime12("00:00"));
assert(formatTime12("12:00") === "12:00 PM", "12:00 formats to 12:00 PM", formatTime12("12:00"));

const week = getWeekDays("2026-10-09");
assert(week.length === 7, "Week has 7 days");
assert(week[0].dayName === "Mon", "Week starts on Monday");

// WhatsApp URL test
const waUrl = getWhatsAppBookingUrl({
  phone: "03174945496",
  customerName: "Waqar Hussain",
  courtName: "Turf Pitch 1",
  sportType: "cricket",
  bookingDate: "2026-10-09",
  startTime: "20:00",
  endTime: "22:00",
  durationMinutes: 120,
  totalAmount: 5000,
  amountPaid: 2000,
  remainingAmount: 3000,
  bookingNumber: "3X-000001"
});
assert(waUrl.includes("wa.me/923174945496"), "WhatsApp URL contains international Pakistani format 92317...");
assert(waUrl.includes("Waqar"), "WhatsApp URL message contains customer name");

console.log(`\n=================== QA TESTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED ===================`);
if (failedTests > 0) process.exit(1);
