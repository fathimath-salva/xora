import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const formatCartItems = (items = []) => items
  .filter((item) => item.product)
  .map((item) => ({
    _id: item._id,
    productId: item.product._id,
    name: item.product.name,
    price: item.product.discountPrice || item.product.price,
    originalPrice: item.product.price,
    image: item.product.images?.[0] || '',
    size: item.size,
    colour: item.colour,
    quantity: item.quantity,
    stock: item.product.stock
  }));

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('xora_local_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // When user logs in, fetch backend cart and sync
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      loadBackendCart();
    } else {
      setItems((currentItems) => currentItems.filter((item) => String(item._id).startsWith('temp-')));
    }
  }, [isAuthenticated, authLoading]);

  // Persist guest cart locally
  useEffect(() => {
    try {
      localStorage.setItem('xora_local_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const loadBackendCart = async () => {
    try {
      setLoading(true);
      const guestItems = items.filter((item) => String(item._id).startsWith('temp-'));
      if (guestItems.length > 0) {
        const syncRes = await cartService.syncCart({
          items: guestItems.map(({ productId, size, colour, quantity }) => ({
            productId,
            size,
            colour,
            quantity
          }))
        });
        if (syncRes.data.success && syncRes.data.cart?.items) {
          setItems(formatCartItems(syncRes.data.cart.items));
          return;
        }
      }

      const res = await cartService.getCart();
      if (res.data.success && res.data.cart?.items) {
        setItems(formatCartItems(res.data.cart.items));
      }
    } catch (err) {
      console.warn('Failed to fetch user cart from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, size, colour, quantity = 1) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
    const selectedColour =
      colour || (product.colours && product.colours[0]?.name) || 'Default';
    const effectivePrice = product.discountPrice || product.price;
    const image = product.images?.[0] || '';

    const addLocalItem = () => setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product._id &&
          item.size === selectedSize &&
          item.colour === selectedColour
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity
        };
        return next;
      } else {
        return [
          ...prev,
          {
            _id: `temp-${Date.now()}-${Math.random()}`,
            productId: product._id,
            name: product.name,
            price: effectivePrice,
            originalPrice: product.price,
            image,
            size: selectedSize,
            colour: selectedColour,
            quantity,
            stock: product.stock
          }
        ];
      }
    });

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart({
          productId: product._id,
          size: selectedSize,
          colour: selectedColour,
          quantity
        });
        if (res.data.success && res.data.cart?.items) {
          setItems(formatCartItems(res.data.cart.items));
        } else {
          addLocalItem();
        }
      } catch (err) {
        console.warn('Error syncing addToCart with backend:', err);
        addLocalItem();
      }
    } else {
      addLocalItem();
    }

    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (isAuthenticated && !itemId.toString().startsWith('temp-')) {
      try {
        const res = await cartService.updateQuantity({ itemId, quantity });
        if (res.data.success && res.data.cart?.items) {
          setItems(formatCartItems(res.data.cart.items));
        }
      } catch (err) {
        console.warn('Failed to update quantity on backend', err);
        await loadBackendCart();
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated && !itemId.toString().startsWith('temp-')) {
      try {
        const res = await cartService.removeFromCart(itemId);
        if (res.data.success && res.data.cart?.items) {
          setItems(formatCartItems(res.data.cart.items));
        }
      } catch (err) {
        console.warn('Failed to remove item on backend', err);
        await loadBackendCart();
      }
      return;
    }

    setItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('xora_local_cart');
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = subtotal + shippingFee + estimatedTax;

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loading,
        totalCount,
        subtotal,
        shippingFee,
        estimatedTax,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
