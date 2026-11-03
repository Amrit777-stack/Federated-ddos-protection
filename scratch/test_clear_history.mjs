import assert from 'assert';

const API_BASE = 'http://localhost:5000/api';

async function testClearHistory() {
  console.log('Testing Clear History functionality...');

  // Reset all to clean state
  await fetch(`${API_BASE}/alerts/reset-all`, { method: 'POST' });
  const init = await fetch(`${API_BASE}/alerts`).then(r => r.json());
  console.log(`Initial baseline alerts: ${init.count}`);

  // Inject attack on E3
  const inj1 = await fetch(`${API_BASE}/alerts/test-inject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enterpriseId: 'E3', prediction: 'DrDoS_UDP' })
  }).then(r => r.json());
  console.log(`Injected attack on E3: ${inj1.alert.id} (Status: ${inj1.alert.status})`);

  // Call clear history
  const clearRes = await fetch(`${API_BASE}/alerts/clear-history`, { method: 'POST' }).then(r => r.json());
  console.log('clear-history response:', clearRes);
  assert.strictEqual(clearRes.success, true);

  // Check remaining alerts: active alert MUST be preserved
  const afterClear = await fetch(`${API_BASE}/alerts`).then(r => r.json());
  console.log(`Alerts count after clear-history: ${afterClear.count}`);
  const activeAlert = afterClear.alerts.find(a => a.id === inj1.alert.id);
  assert(activeAlert, 'Active alert on E3 must be preserved');
  assert.strictEqual(activeAlert.status, 'ACTION REQUIRED');
  console.log('PASS: Active alert on E3 preserved after clear-history!');

  // Now resolve the alert on E3
  await fetch(`${API_BASE}/alerts/${inj1.alert.id}/restore`, { method: 'POST' });
  const afterRestore = await fetch(`${API_BASE}/alerts`).then(r => r.json());
  const restoredAlert = afterRestore.alerts.find(a => a.id === inj1.alert.id);
  assert.strictEqual(restoredAlert.status, 'RESOLVED');

  // Now call clear-history again: resolved alert should be cleared
  const clearRes2 = await fetch(`${API_BASE}/alerts/clear-history`, { method: 'POST' }).then(r => r.json());
  const afterClear2 = await fetch(`${API_BASE}/alerts`).then(r => r.json());
  console.log(`Alerts count after clearing resolved history: ${afterClear2.count}`);
  const shouldNotExist = afterClear2.alerts.find(a => a.id === inj1.alert.id);
  assert(!shouldNotExist, 'Resolved alert should be purged by clear-history');
  console.log('PASS: Resolved alert successfully purged!');

  console.log('\nAll Clear History unit tests passed!');
}

testClearHistory().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

