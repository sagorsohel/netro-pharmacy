import { baseApi } from './baseApi';

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: string;
  unitType: string;
  cartonQuantity: number;
  packetsPerCarton: number;
  piecesPerPacket: number;
  totalPieces: number;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  unitSellingPrice: number;
  stripSellingPrice: number;
  boxSellingPrice: number;
  minThresholdPieces: number;
  supplier: string;
  branch: string;
}

export interface PharmacyStats {
  totalMedicines: number;
  totalPiecesInStock: number;
  totalStockValuation: number;
  lowStockCount: number;
  nearExpiryCount: number;
}

export interface CreateInvoicePayload {
  customerName: string;
  phone?: string;
  memberId?: string;
  isMember?: boolean;
  hasPrescription?: boolean;
  paymentMethod?: string;
  subtotal?: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal?: number;
  items: Array<{
    medicineId: string;
    name: string;
    unitType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const pharmacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query<{ success: boolean; data: Medicine[]; count: number }, { search?: string; lowStock?: boolean } | void>({
      query: (params) => ({
        url: '/pharmacy/medicines',
        params: params || undefined,
      }),
      providesTags: ['Medicines'],
    }),
    getPharmacyStats: builder.query<{ success: boolean; data: PharmacyStats }, void>({
      query: () => '/pharmacy/stats',
      providesTags: ['Stats'],
    }),
    createInvoice: builder.mutation<{ success: boolean; data: any; message: string }, CreateInvoicePayload>({
      query: (body) => ({
        url: '/pharmacy/invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Medicines', 'Invoices', 'Stats'],
    }),
    getInvoices: builder.query<{ success: boolean; data: any[]; count: number }, void>({
      query: () => '/pharmacy/invoices',
      providesTags: ['Invoices'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicinesQuery,
  useGetPharmacyStatsQuery,
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
} = pharmacyApi;
