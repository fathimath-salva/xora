import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Intercept request to attach auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('xora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept response for unauthorized tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired session
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/account') || currentPath.startsWith('/admin')) {
        localStorage.removeItem('xora_token');
        localStorage.removeItem('xora_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data)
};

// Product Services
export const productService = {
  getProducts: (params) => API.get('/products', { params }),
  getProductById: (id) => API.get(`/products/${id}`),
  createProduct: (data) => API.post('/products', data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`)
};

// Category Services
export const categoryService = {
  getCategories: () => API.get('/categories'),
  createCategory: (data) => API.post('/categories', data),
  updateCategory: (id, data) => API.put(`/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/categories/${id}`)
};

// Order Services
export const orderService = {
  createOrder: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getOrderById: (id) => API.get(`/orders/${id}`),
  getAllOrders: (params) => API.get('/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/orders/${id}`, data)
};

// Cart Services
export const cartService = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart', data),
  updateQuantity: (data) => API.put('/cart/update', data),
  removeFromCart: (itemId) => API.delete(`/cart/${itemId}`),
  syncCart: (data) => API.post('/cart/sync', data)
};

// Wishlist Services
export const wishlistService = {
  getWishlist: () => API.get('/wishlist'),
  toggleWishlist: (data) => API.post('/wishlist', data)
};

// Address Services
export const addressService = {
  getAddresses: () => API.get('/addresses'),
  createAddress: (data) => API.post('/addresses', data),
  updateAddress: (id, data) => API.put(`/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => API.put(`/addresses/${id}/default`)
};

// Admin Services
export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getCustomers: () => API.get('/admin/customers'),
  updateCustomerStatus: (id, data) => API.put(`/admin/customers/${id}/status`, data)
};

// Upload Service
export const uploadService = {
  uploadImage: (formData) => API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default API;
