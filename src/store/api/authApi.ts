import { baseApi } from './baseApi';
import type { PharmacyUser } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: PharmacyUser;
}

export interface UserProfileResponse {
  success: boolean;
  data: PharmacyUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<UserProfileResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
} = authApi;
