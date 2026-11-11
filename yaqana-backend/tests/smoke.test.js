import test from 'node:test';
import assert from 'node:assert/strict';

test('backend foundation includes the intended API prefix and health routes', async () => {
  const appSource = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../src/app.js', import.meta.url), 'utf8'));
  const healthSource = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../src/routes/healthRoutes.js', import.meta.url), 'utf8'));
  assert.match(appSource, /app\.use\('\/api\/health', healthRoutes\)/);
  assert.match(healthSource, /router\.get\('\/live'/);
  assert.match(healthSource, /router\.get\('\/ready'/);
});
