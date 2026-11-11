import test from 'node:test';
import assert from 'node:assert/strict';
import { CUSTOMER_STATUS_OPTIONS, getAdminOrderStatusOptions } from '../src/utils/adminStatus.js';

test('customer status options match the backend account-status enum', () => {
  assert.deepEqual(CUSTOMER_STATUS_OPTIONS, ['active', 'blocked']);
});

test('order status options include only the current status and backend-approved transitions', () => {
  assert.deepEqual(
    getAdminOrderStatusOptions({ orderStatus: 'Confirmed', allowedNextStatuses: ['Processing', 'Cancelled'] }),
    ['Confirmed', 'Processing', 'Cancelled']
  );
  assert.deepEqual(
    getAdminOrderStatusOptions({ orderStatus: 'Delivered', allowedNextStatuses: [] }),
    ['Delivered']
  );
});
