import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
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
    if (isAuthenticated) {
      loadBackendCart();
    }
  }, [isAuthenticated]);

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
      const res = await cartService.getCart();
      if (res.data.success && res.data.cart?.items) {
        // Map backend format to uniform cart item structure
        const formatted = res.data.cart.items.map((i) => ({
          _id: i._id,
          productId: i.product._id,
          name: i.product.name,
          price: i.product.discountPrice || i.product.price,
          originalPrice: i.product.price,
          image: i.product.images?.[0] || '',
          size: i.size,
          colour: i.colour,
          quantity: i.quantity,
          stock: i.product.stock
        }));
        setItems(formatted);
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

    // Check if item already exists with matching id, size, and colour
    setItems((prev) => {
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

    setIsCartOpen(true);

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        await cartService.addToCart({
          productId: product._id,
          size: selectedSize,
          colour: selectedColour,
          quantity
        });
      } catch (err) {
        console.warn('Error syncing addToCart with backend:', err);
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity } : item))
    );

    if (isAuthenticated && !itemId.toString().startsWith('temp-')) {
      try {
        await cartService.updateQuantity({ itemId, quantity });
      } catch (err) {
        console.warn('Failed to update quantity on backend', err);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));

    if (isAuthenticated && !itemId.toString().startsWith('temp-')) {
      try {
        await cartService.removeFromCart(itemId);
      } catch (err) {
        console.warn('Failed to remove item on backend', err);
      }
    }
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
