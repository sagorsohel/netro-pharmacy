import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PharmacyUser {
  id: string;
  name: string;
  email: string;
  role: 'Chief Pharmacist' | 'Pharmacy Admin' | 'Cashier';
  avatar: string;
  branchName: string;
}

interface AuthState {
  isAuthenticated: boolean;
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
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        email: string;
        name?: string;
        role?: PharmacyUser['role'];
        branchName?: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        id: 'usr-pharma-01',
        name: action.payload.name || 'Dr. Sohel Sagor',
        email: action.payload.email,
        role: action.payload.role || 'Chief Pharmacist',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        branchName: action.payload.branchName || 'Main Hospital Pharmacy (Branch #1)',
      };
      try {
        localStorage.setItem('netro_pharmacy_auth', JSON.stringify(state));
      } catch {
        // ignore
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      try {
        localStorage.removeItem('netro_pharmacy_auth');
      } catch {
        // ignore
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
