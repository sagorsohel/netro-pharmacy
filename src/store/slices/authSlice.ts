import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PharmacyRole = 'owner' | 'manager' | 'pharmacist' | 'cashier' | 'staff';

export interface PharmacyOutletInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  licenseNo?: string;
  email?: string | null;
}

export interface PharmacyUser {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: PharmacyRole;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: PharmacyUser | null;
  pharmacy: PharmacyOutletInfo | null;
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
  pharmacy: null,
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
        pharmacy: PharmacyOutletInfo;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.pharmacy = action.payload.pharmacy;
      try {
        localStorage.setItem('netro_pharmacy_auth', JSON.stringify(state));
        localStorage.setItem('token', action.payload.token);
      } catch {
        // ignore
      }
    },
    updateProfile: (
      state,
      action: PayloadAction<{
        user?: Partial<PharmacyUser>;
        pharmacy?: Partial<PharmacyOutletInfo>;
      }>
    ) => {
      if (action.payload.user && state.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      if (action.payload.pharmacy && state.pharmacy) {
        state.pharmacy = { ...state.pharmacy, ...action.payload.pharmacy };
      }
      try {
        localStorage.setItem('netro_pharmacy_auth', JSON.stringify(state));
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.pharmacy = null;
      try {
        localStorage.removeItem('netro_pharmacy_auth');
        localStorage.removeItem('token');
      } catch {
        // ignore
      }
    },
  },
});

export const { loginSuccess, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;
