const baseUrl = 'http://localhost:3000';

const pagesToTest = [
  { url: '/', expectStatus: 200, name: 'Root Redirect' },
  { url: '/login', expectStatus: 200, name: 'Login Page' },
  { url: '/dashboard', expectStatus: 200, name: 'Dashboard Page' },
  { url: '/bookings', expectStatus: 200, name: 'Bookings Calendar & Table Page' },
  { url: '/courts', expectStatus: 200, name: 'Courts & Rates Page' },
  { url: '/expense-categories', expectStatus: 200, name: 'Expense Categories Page' },
  { url: '/expenses', expectStatus: 200, name: 'Expenses & Cash Outflow Page' },
  { url: '/customers', expectStatus: 200, name: 'Customer CRM Page' },
  { url: '/receipt/bk-1', expectStatus: 200, name: 'Printable Thermal Slip Receipt' }
];

async function runE2E() {
  console.log("=================== RUNNING E2E HTTP QA AUDIT ===================");
  let failed = 0;
  let passed = 0;

  for (const page of pagesToTest) {
    try {
      const res = await fetch(baseUrl + page.url);
      const text = await res.text();
      if (res.status === page.expectStatus) {
        console.log(`✅ [${res.status}] ${page.name} (${page.url}) - Size: ${text.length} bytes`);
        passed++;
      } else {
        console.error(`❌ [${res.status}] ${page.name} (${page.url}) - Expected ${page.expectStatus}`);
        failed++;
      }
    } catch (e) {
      console.error(`❌ ERROR connecting to ${page.url}:`, e.message);
      failed++;
    }
  }

  console.log(`\n=================== E2E AUDIT: ${passed} PASSED, ${failed} FAILED ===================`);
  if (failed > 0) process.exit(1);
}

runE2E();
