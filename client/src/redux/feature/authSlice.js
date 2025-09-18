import { createSlice } from '@reduxjs/toolkit';
import { emptycartIteam } from './cartSlice';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state, action) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      // Dispatch emptycartIteam action if needed
      if (action?.meta?.arg?.dispatch) {
        action.meta.arg.dispatch(emptycartIteam());
      }
    },
    updateUserBalance: (state, action) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },
  },
});

export const { loginSuccess, logout, updateUserBalance } = authSlice.actions;
export default authSlice.reducer;
