import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionOrderStatus,
  getAllowedOrderTransitions,
  isKnownOrderStatus
} from '../src/utils/orderStatus.js';

test('confirmed orders can only move to processing or cancelled', () => {
  assert.deepEqual(getAllowedOrderTransitions('Confirmed'), ['Processing', 'Cancelled']);
});

test('terminal orders expose no further transitions', () => {
  assert.deepEqual(getAllowedOrderTransitions('Delivered'), []);
  assert.equal(canTransitionOrderStatus('Delivered', 'Cancelled'), false);
});

test('an unchanged order status remains valid', () => {
  assert.equal(canTransitionOrderStatus('Confirmed', 'Confirmed'), true);
});

test('unknown statuses are rejected', () => {
  assert.equal(isKnownOrderStatus('Unknown'), false);
  assert.equal(getAllowedOrderTransitions('Unknown').length, 0);
});
