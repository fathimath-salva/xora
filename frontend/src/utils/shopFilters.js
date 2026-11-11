import { rupeesToCatalogUnits } from './currency.js';

export const SHOP_CATEGORIES = ['T-Shirts', 'Hoodies', 'Shirts', 'Trousers', 'Jeans', 'Jackets'];

const priceToCatalogUnits = (value, label) => {
  if (value === undefined || value === null || value === '') return undefined;
  const rupees = Number(value);
  if (!Number.isFinite(rupees) || rupees < 0) throw new Error(`${label} must be a non-negative amount.`);
  return rupeesToCatalogUnits(rupees);
};

export function buildShopProductParams({
  category,
  collection,
  colour,
  minPrice,
  maxPrice,
  search,
  size,
  sort,
  filter
}) {
  const params = { sort, gender: 'men' };

  if (search) params.search = search;
  if (collection) params.collection = collection;
  if (category && category !== 'All') params.category = category;
  if (size) params.size = size;
  if (colour) params.colour = colour;
  if (filter === 'new') params.newArrival = true;
  else if (filter === 'featured') params.featured = true;

  const minPriceUnits = priceToCatalogUnits(minPrice, 'Minimum price');
  const maxPriceUnits = priceToCatalogUnits(maxPrice, 'Maximum price');
  if (minPriceUnits !== undefined) params.minPrice = minPriceUnits;
  if (maxPriceUnits !== undefined) params.maxPrice = maxPriceUnits;
  if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
    throw new Error('Minimum price cannot exceed maximum price.');
  }

  return params;
}
