import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('xora_local_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with backend on login
  useEffect(() => {
    if (isAuthenticated) {
      loadBackendWishlist();
    }
  }, [isAuthenticated]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem('xora_local_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const loadBackendWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      if (res.data.success && Array.isArray(res.data.wishlist)) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.warn('Failed to load wishlist from server:', err);
    }
  };

  const toggleWishlist = async (product) => {
    const isExisting = wishlist.some((item) => (item._id || item) === (product._id || product));

    if (isExisting) {
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== (product._id || product)));
    } else {
      setWishlist((prev) => [...prev, product]);
    }

    if (isAuthenticated) {
      try {
        await wishlistService.toggleWishlist({ productId: product._id || product });
      } catch (err) {
        console.warn('Failed to sync wishlist toggle on server:', err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
    if (isAuthenticated) {
      try {
        await wishlistService.toggleWishlist({ productId });
      } catch (err) {
        console.warn('Failed to sync remove from wishlist', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        count: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
