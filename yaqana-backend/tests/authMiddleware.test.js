import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../src/middleware/auth.js';

const checkAdminAccess = (user) => new Promise((resolve) => {
  requireAdmin({ user }, {}, resolve);
});

test('customer accounts are denied administrator authorization', async () => {
  const error = await checkAdminAccess({ role: 'customer' });
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, 'ADMIN_REQUIRED');
});

test('administrator accounts pass the administrator authorization middleware', async () => {
  assert.equal(await checkAdminAccess({ role: 'admin' }), undefined);
});
