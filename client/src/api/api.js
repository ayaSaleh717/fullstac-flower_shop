import axios from 'axios';

// Define the base URL for your API. Make sure your server is running on this port.
const API_URL = 'https://flower-shop-backend-7pay.onrender.com';

// Create an instance of axios with the base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/add', userData);
    return response.data;
  } catch (error) {
    console.log(error)
    // Re-throw a more informative error message
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/users/logout');
    // Clear local storage and token
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    return response.data;
  } catch (error) {
    // Even if the server request fails, we still want to clear the client-side state
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    throw new Error(error.response?.data?.message || 'Logged out successfully (local session cleared)');
  }
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getProducts = async (category) => {
    const url = category ? `/products/category/${category}` : '/products';
    const response = await api.get(url);
    return response.data;
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post('/products/add', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.details || error.response?.data?.error || 'Failed to add product. Please try again.');
  }
};

export const getProductsByUser = async (userId) => {
  try {
    const response = await api.get(`/products/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user products.');
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product.');
  }
};

export const getUserOrders = async (userId) => {
  try {
    console.log(`[API] Fetching orders for user: ${userId}`);
    const response = await api.get(`/orders/user/${userId}`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    
    console.log('[API] Orders response status:', response.status);
    
    if (!response.data) {
      
      throw new Error('No data received from server');
    }
    
    // Handle both response formats: { data: [...] } and direct array
    return response.data.data || response.data;
    
  } catch (error) {
    console.error('[API] Error in getUserOrders:', {
      name: error.name,
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response'
    });
    
    // Provide more specific error messages based on the error type
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your internet connection.');
    } else if (!error.response) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    } else if (error.response.status === 401) {
      // Handle unauthorized - maybe redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return [];
    } else if (error.response.status === 404) {
      // No orders found is not an error, return empty array
      return [];
    } else {
      throw new Error(error.response.data?.message || 'Failed to fetch orders. Please try again.');
    }
  }
};

export const validateCart = async (cartItems) => {
  try {
    const response = await api.post('/cart/validate', { cartItems });
    return response.data;
  } catch (error) {
    console.error('Error validating cart:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to validate cart. Please check your internet connection and try again.'
    );
  }
};

export const commitPurchase = async (purchaseData) => {
  try {
    // First validate the cart
    await validateCart(purchaseData.cart);
    
    // If validation passes, proceed with purchase
    const response = await api.post('/orders/commit', purchaseData);
    return response.data;
  } catch (error) {
    // If we have specific error data from the server, include it in the error
    if (error.response?.data?.insufficientStock) {
      throw {
        ...error.response.data,
        message: error.response.data.message || 'Some items in your cart are out of stock or have insufficient quantity.'
      };
    }
    throw new Error(
      error.response?.data?.message || 
      'Failed to complete purchase. Please try again later.'
    );
  }
};
