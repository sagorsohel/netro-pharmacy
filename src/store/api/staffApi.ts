import { baseApi } from './baseApi';
import type { PharmacyRole, PharmacyUser } from '../slices/authSlice';

export type { PharmacyRole, PharmacyUser };

export interface CreateStaffPayload {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: PharmacyRole;
}

export interface UpdateStaffPayload {
  name?: string;
  phone?: string;
  email?: string | null;
  role?: PharmacyRole;
  isActive?: boolean;
}

export interface StaffListResponse {
  success: boolean;
  data: (PharmacyUser & { isActive: boolean; createdAt: string; lastLoginAt?: string })[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPharmacyStaff: builder.query<
      StaffListResponse,
      { pharmacyId: number; search?: string; role?: string; isActive?: boolean; page?: number; limit?: number }
    >({
      query: ({ pharmacyId, ...params }) => ({
        url: `/pharmacies/${pharmacyId}/users`,
        params: params || undefined,
      }),
      providesTags: ['Staff'],
    }),

    getStaffById: builder.query<{ success: boolean; data: any }, { pharmacyId: number; userId: string }>({
      query: ({ pharmacyId, userId }) => `/pharmacies/${pharmacyId}/users/${userId}`,
      providesTags: (_res, _err, { userId }) => [{ type: 'Staff', id: userId }],
    }),

    createStaff: builder.mutation<{ success: boolean; message: string; data: any }, { pharmacyId: number; data: CreateStaffPayload }>({
      query: ({ pharmacyId, data }) => ({
        url: `/pharmacies/${pharmacyId}/users`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),

    updateStaff: builder.mutation<
      { success: boolean; message: string; data: any },
      { pharmacyId: number; userId: string; data: UpdateStaffPayload }
    >({
      query: ({ pharmacyId, userId, data }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),

    resetStaffPassword: builder.mutation<
      { success: boolean; message: string },
      { pharmacyId: number; userId: string; newPassword: string }
    >({
      query: ({ pharmacyId, userId, newPassword }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
      invalidatesTags: ['Staff'],
    }),

    deleteStaff: builder.mutation<{ success: boolean; message: string }, { pharmacyId: number; userId: string }>({
      query: ({ pharmacyId, userId }) => ({
        url: `/pharmacies/${pharmacyId}/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPharmacyStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useResetStaffPasswordMutation,
  useDeleteStaffMutation,
} = staffApi;
