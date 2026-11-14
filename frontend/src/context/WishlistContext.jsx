import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const wasAuthenticated = useRef(isAuthenticated);

  // Sync with backend on login
  useEffect(() => {
    if (isAuthenticated) {
      loadBackendWishlist(wishlist);
    } else if (wasAuthenticated.current) {
      setWishlist([]);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem('xora_local_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const loadBackendWishlist = async (guestWishlist = []) => {
    try {
      const res = await wishlistService.getWishlist();
      if (res.data.success && Array.isArray(res.data.wishlist)) {
        let mergedWishlist = res.data.wishlist;
        const existingIds = new Set(mergedWishlist.map((product) => product?._id).filter(Boolean));
        const guestProducts = guestWishlist.filter((product) =>
          product && typeof product === 'object' && product._id && !product.isDemoOnly && !existingIds.has(product._id)
        );

        for (const product of guestProducts) {
          try {
            const syncRes = await wishlistService.toggleWishlist({ productId: product._id });
            if (syncRes.data?.success && Array.isArray(syncRes.data.wishlist)) {
              mergedWishlist = syncRes.data.wishlist;
            } else {
              mergedWishlist = [...mergedWishlist, product];
            }
          } catch {
            mergedWishlist = [...mergedWishlist, product];
          }
          existingIds.add(product._id);
        }

        setWishlist(mergedWishlist);
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
