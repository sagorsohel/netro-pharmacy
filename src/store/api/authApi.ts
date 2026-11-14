import { baseApi } from './baseApi';
import type { PharmacyOutletInfo, PharmacyUser } from '../slices/authSlice';

export interface PharmacyLoginRequest {
  pharmacyId: number;
  phone: string;
  password: string;
}

export interface PharmacyLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: PharmacyUser;
  pharmacy: PharmacyOutletInfo;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    pharmacyLogin: builder.mutation<PharmacyLoginResponse, PharmacyLoginRequest>({
      query: (credentials) => ({
        url: '/pharmacy-auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    getPharmacyMe: builder.query<{ success: boolean; data: { user: PharmacyUser; pharmacy: PharmacyOutletInfo } }, void>({
      query: () => '/pharmacy-auth/me',
      providesTags: ['Auth'],
    }),

    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/pharmacy-auth/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  usePharmacyLoginMutation,
  useGetPharmacyMeQuery,
  useChangePasswordMutation,
} = authApi;
