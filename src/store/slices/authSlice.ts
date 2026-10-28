import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PharmacyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  branchName?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: PharmacyUser | null;
}

const savedAuth = (() => {
  try {
    const raw = localStorage.getItem('netro_pharmacy_auth');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
})();

const initialState: AuthState = savedAuth || {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: PharmacyUser;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      try {
        localStorage.setItem('netro_pharmacy_auth', JSON.stringify(state));
        localStorage.setItem('token', action.payload.token);
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem('netro_pharmacy_auth');
        localStorage.removeItem('token');
      } catch {
        // ignore
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
