import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogUnitsToRupees, formatInr, rupeesToCatalogUnits } from '../src/utils/currency.js';

test('catalog prices round-trip through the rupee display using the existing factor', () => {
  const catalogPrice = rupeesToCatalogUnits(2499);
  assert.equal(catalogUnitsToRupees(catalogPrice), 2499);
  assert.equal(formatInr(catalogPrice), '₹2,499');
});
