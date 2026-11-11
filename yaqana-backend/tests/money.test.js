import test from 'node:test';
import assert from 'node:assert/strict';
import {
  catalogUnitsToPaise,
  paiseToCatalogUnits,
  paiseToRupees,
  rupeesToPaise
} from '../src/utils/money.js';

test('one frontend catalogue unit equals 8,300 paise at the agreed factor of 83', () => {
  assert.equal(catalogUnitsToPaise(1), 8300);
  assert.equal(paiseToCatalogUnits(8300), 1);
});

test('admin rupee prices convert to and from backend paise without drift', () => {
  assert.equal(rupeesToPaise(2499), 249900);
  assert.equal(paiseToRupees(catalogUnitsToPaise(2499 / 83)), 2499);
});
