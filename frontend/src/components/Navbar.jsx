import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Package,
  Sparkles,
  Tag,
  Layers,
  Grid3X3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatInr } from '../utils/currency';

const SHOP_CATEGORIES = ['T-Shirts', 'Hoodies', 'Shirts', 'Trousers'];

export default function Navbar({ onOpenSearch }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShopMenuOpen(false);
  }, [location.pathname, location.search]);

  // Track scroll for subtle border/background blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close shop menu on outside click
  useEffect(() => {
    if (!shopMenuOpen) return undefined;
    const handleClick = (e) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target)) {
        setShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shopMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-xora-offwhite/95 backdrop-blur-md border-b border-xora-taupe/30 shadow-xs'
            : 'bg-xora-offwhite border-b border-xora-taupe/20'
        }`}
      >
        {/* Top Announcement Bar */}
        <div className="bg-xora-charcoal text-xora-cream text-[11px] tracking-luxury uppercase py-1.5 px-4 text-center font-light">
          Complimentary express shipping on orders over {formatInr(5000)}
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-xora-charcoal hover:text-xora-black focus:outline-none"
                aria-label="Open navigation menu"
                id="mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Navigation Links (Left) */}
            <div className="hidden lg:flex items-center space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-[12px] uppercase tracking-luxury font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-xora-charcoal font-semibold border-b border-xora-charcoal pb-0.5'
                      : 'text-xora-charcoal/75 hover:text-xora-charcoal'
                  }`
                }
              >
                Home
              </NavLink>

              {/* SHOP Mega-Menu */}
              <div className="relative" ref={shopMenuRef}>
                <button
                  type="button"
                  onClick={() => setShopMenuOpen((o) => !o)}
                  className={`flex items-center gap-1 text-[12px] uppercase tracking-luxury font-medium transition-colors duration-200 ${
                    location.pathname === '/shop' || shopMenuOpen
                      ? 'text-xora-charcoal font-semibold'
                      : 'text-xora-charcoal/75 hover:text-xora-charcoal'
                  }`}
                  id="shop-menu-trigger"
                  aria-haspopup="true"
                  aria-expanded={shopMenuOpen}
                >
                  Shop
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {shopMenuOpen && (
                  <div className="absolute left-0 top-full mt-3 w-64 bg-xora-offwhite border border-xora-taupe/30 shadow-xl py-3 z-50 animate-fade-in">
                    {/* All Products */}
                    <Link
                      to="/shop"
                      state={{ scrollToTop: true }}
                      onClick={() => setShopMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                      id="shop-dropdown-all"
                    >
                      <Grid3X3 className="w-3.5 h-3.5 text-xora-taupe-dark" />
                      <span className="uppercase tracking-luxury font-medium">All Products</span>
                    </Link>

                    {/* New Arrivals */}
                    <Link
                      to="/shop?filter=new"
                      onClick={() => setShopMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                      id="shop-dropdown-new"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-xora-gold" />
                      <span className="uppercase tracking-luxury font-medium">New Arrivals</span>
                    </Link>

                    <div className="border-t border-xora-taupe/20 my-1.5" />

                    {/* Categories label */}
                    <p className="px-4 py-1.5 text-[10px] uppercase tracking-luxury text-xora-taupe-dark font-semibold">
                      Categories
                    </p>
                    {SHOP_CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        to={`/shop?category=${encodeURIComponent(cat)}`}
                        state={{ scrollToTop: true }}
                        onClick={() => setShopMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                        id={`shop-dropdown-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Tag className="w-3.5 h-3.5 text-xora-taupe-dark" />
                        <span className="tracking-wide">{cat}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-[12px] uppercase tracking-luxury font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-xora-charcoal font-semibold border-b border-xora-charcoal pb-0.5'
                      : 'text-xora-charcoal/75 hover:text-xora-charcoal'
                  }`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-[12px] uppercase tracking-luxury font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-xora-charcoal font-semibold border-b border-xora-charcoal pb-0.5'
                      : 'text-xora-charcoal/75 hover:text-xora-charcoal'
                  }`
                }
              >
                Contact
              </NavLink>
            </div>

            {/* Brand Logo (Center) */}
            <div className="flex-1 lg:flex-initial text-center lg:text-left">
              <Link
                to="/"
                className="inline-block font-serif text-xl sm:text-3xl tracking-[0.25em] font-light uppercase text-xora-charcoal hover:opacity-90 transition-opacity"
              >
                YAQANA
              </Link>
            </div>

            {/* Icons Section (Right) */}
            <div className="flex items-center space-x-1 sm:space-x-5">
              {/* Search Icon */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="p-1.5 text-xora-charcoal/80 hover:text-xora-charcoal transition-colors"
                aria-label="Search clothing"
                id="search-trigger-btn"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Wishlist Icon */}
              <Link
                to={isAuthenticated ? '/account?tab=wishlist' : '/login'}
                className="p-1.5 text-xora-charcoal/80 hover:text-xora-charcoal transition-colors relative"
                aria-label="Wishlist"
                id="wishlist-btn"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-xora-charcoal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart */}
              <button
                type="button"
                onClick={openCart}
                className="p-1.5 text-xora-charcoal/80 hover:text-xora-charcoal transition-colors relative"
                aria-label="Open shopping bag"
                id="cart-trigger-btn"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-xora-charcoal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-1.5 p-1.5 text-xora-charcoal hover:text-xora-black transition-colors"
                      id="account-menu-button"
                    >
                      <User className="w-5 h-5 stroke-[1.5]" />
                      <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-xora-taupe-dark" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-xora-offwhite border border-xora-taupe/30 rounded-xs shadow-lg py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-xora-taupe/20">
                          <p className="text-xs text-xora-taupe-dark uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-semibold text-xora-charcoal truncate">{user?.name}</p>
                          <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-xora-sand text-xora-charcoal rounded">
                            {user?.role}
                          </span>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-medium text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                            id="admin-dashboard-link"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-xora-gold" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                          id="customer-dashboard-link"
                        >
                          <User className="w-4 h-4 mr-2 text-xora-taupe-dark" />
                          Customer Dashboard
                        </Link>

                        <Link
                          to="/account?tab=orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                          id="my-orders-link"
                        >
                          <Package className="w-4 h-4 mr-2 text-xora-taupe-dark" />
                          My Orders
                        </Link>

                        <div className="border-t border-xora-taupe/20 my-1"></div>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors"
                          id="logout-btn"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="p-1.5 text-xora-charcoal/80 hover:text-xora-charcoal transition-colors"
                    title="Sign In"
                    id="nav-login-btn"
                  >
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-xora-charcoal/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-xora-offwhite shadow-xl z-50 flex flex-col justify-between p-6 overflow-y-auto animate-fade-in">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-xora-taupe/20">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-2xl tracking-[0.25em] font-light uppercase text-xora-charcoal"
                >
                  YAQANA
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-xora-charcoal/70 hover:text-xora-charcoal"
                  id="close-mobile-menu-btn"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-col space-y-1">
                <NavLink
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm uppercase tracking-luxury font-medium py-2.5 border-b border-xora-taupe/10 transition-colors ${
                      isActive ? 'text-xora-charcoal font-bold' : 'text-xora-charcoal/70'
                    }`
                  }
                >
                  Home
                </NavLink>

                {/* Shop section */}
                <div className="border-b border-xora-taupe/10">
                  <Link
                    to="/shop"
                    state={{ scrollToTop: true }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm uppercase tracking-luxury font-medium py-2.5 text-xora-charcoal/70"
                  >
                    Shop — All Products
                  </Link>
                  <Link
                    to="/shop?filter=new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-luxury py-2 pl-2 text-xora-gold font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    New Arrivals
                  </Link>
                  <p className="text-[10px] uppercase tracking-luxury text-xora-taupe-dark pl-2 mt-1 mb-1">Categories</p>
                  {SHOP_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      state={{ scrollToTop: true }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 text-xs tracking-wide py-1.5 pl-2 text-xora-charcoal/80 hover:text-xora-charcoal"
                    >
                      <Tag className="w-3 h-3 text-xora-taupe-dark" />
                      {cat}
                    </Link>
                  ))}
                </div>

                <NavLink
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm uppercase tracking-luxury font-medium py-2.5 border-b border-xora-taupe/10 transition-colors ${
                      isActive ? 'text-xora-charcoal font-bold' : 'text-xora-charcoal/70'
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm uppercase tracking-luxury font-medium py-2.5 border-b border-xora-taupe/10 transition-colors ${
                      isActive ? 'text-xora-charcoal font-bold' : 'text-xora-charcoal/70'
                    }`
                  }
                >
                  Contact
                </NavLink>
                <Link
                  to="/policies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-luxury py-2.5 text-xora-taupe-dark"
                >
                  Store Policies
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-xora-taupe/20">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-xs text-xora-taupe-dark">
                    Signed in as <span className="font-semibold text-xora-charcoal">{user?.name}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs uppercase tracking-luxury font-medium text-xora-gold py-1"
                    >
                      Admin Dashboard →
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal py-1"
                  >
                    My Account →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="text-xs uppercase tracking-luxury font-medium text-red-600 pt-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-luxury w-full text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-luxury-outline w-full text-center"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
