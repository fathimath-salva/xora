const RECENTLY_VIEWED_KEY = 'yaqana_recently_viewed';
const MAX_RECENTLY_VIEWED = 8;

export function getRecentlyViewedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    return Array.isArray(saved)
      ? saved.filter((id) => typeof id === 'string').slice(0, MAX_RECENTLY_VIEWED)
      : [];
  } catch {
    return [];
  }
}

export function rememberViewedProduct(id) {
  if (!id) return;
  const productId = String(id);
  const next = [productId, ...getRecentlyViewedIds().filter((savedId) => savedId !== productId)]
    .slice(0, MAX_RECENTLY_VIEWED);
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Unable to save recently viewed products.', error);
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Unable to clear recently viewed products.', error);
  }
}
