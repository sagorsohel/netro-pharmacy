import { baseApi } from './baseApi';

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: string;
  cartonQty: number;
  packetPerCarton: number;
  piecePerPacket: number;
  totalPieces: number;
  unitSellingPrice: string | number;
  stripSellingPrice: string | number;
  batchNo: string;
  expiryDate: string;
  minThresholdPieces: number;
  supplier: string;
  branch: string;
  createdAt?: string;
}

export interface CreateMedicinePayload {
  name: string;
  generic: string;
  category: string;
  cartonQty?: number;
  packetPerCarton?: number;
  piecePerPacket?: number;
  totalPieces?: number;
  unitSellingPrice: string | number;
  stripSellingPrice?: string | number;
  batchNo?: string;
  expiryDate?: string;
  minThresholdPieces?: number;
  supplier?: string;
  branch?: string;
}

export interface MedicineListResponse {
  success: boolean;
  data: Medicine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const medicineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query<
      MedicineListResponse,
      { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean } | void
    >({
      query: (params) => ({
        url: '/medicines',
        params: params || undefined,
      }),
      providesTags: ['Medicines'],
    }),

    getMedicineById: builder.query<{ success: boolean; data: Medicine }, string>({
      query: (id) => `/medicines/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Medicines', id }],
    }),

    createMedicine: builder.mutation<{ success: boolean; message: string; data: Medicine }, CreateMedicinePayload>({
      query: (body) => ({
        url: '/medicines',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Medicines'],
    }),

    updateMedicine: builder.mutation<{ success: boolean; message: string; data: Medicine }, { id: string; data: Partial<CreateMedicinePayload> }>({
      query: ({ id, data }) => ({
        url: `/medicines/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => ['Medicines', { type: 'Medicines', id }],
    }),

    deleteMedicine: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medicines'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
