import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOP_CATEGORIES, buildShopProductParams } from '../src/utils/shopFilters.js';

test('shop navigation includes Jeans and Jackets alongside existing categories', () => {
  assert.deepEqual(SHOP_CATEGORIES, ['T-Shirts', 'Hoodies', 'Shirts', 'Trousers', 'Jeans', 'Jackets']);
});

test('catalog requests include category, colour, and INR price filters', () => {
  const params = buildShopProductParams({
    category: 'Jeans',
    collection: '',
    colour: 'Indigo',
    minPrice: '2899',
    maxPrice: '3400',
    search: 'straight',
    size: '32',
    sort: 'price-asc',
    filter: ''
  });

  assert.deepEqual(
    { ...params, minPricePaise: Math.round(params.minPrice * 8300), maxPricePaise: Math.round(params.maxPrice * 8300) },
    {
      category: 'Jeans',
      colour: 'Indigo',
      gender: 'men',
      maxPrice: params.maxPrice,
      maxPricePaise: 340000,
      minPrice: params.minPrice,
      minPricePaise: 289900,
      search: 'straight',
      size: '32',
      sort: 'price-asc'
    }
  );
});

test('catalog requests omit empty price bounds and reject invalid ranges', () => {
  const unfiltered = buildShopProductParams({
    category: 'All',
    collection: '',
    colour: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    size: '',
    sort: 'newest',
    filter: ''
  });
  assert.deepEqual(unfiltered, { sort: 'newest', gender: 'men' });

  assert.throws(() => buildShopProductParams({
    category: 'All', collection: '', colour: '', minPrice: '-1', maxPrice: '', search: '', size: '', sort: 'newest', filter: ''
  }), /non-negative/);
  assert.throws(() => buildShopProductParams({
    category: 'All', collection: '', colour: '', minPrice: '3500', maxPrice: '3000', search: '', size: '', sort: 'newest', filter: ''
  }), /minimum price cannot exceed maximum price/i);
});
