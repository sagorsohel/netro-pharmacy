import { baseApi } from './baseApi';

export interface InvoiceItem {
  medicineId: string;
  name: string;
  generic?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitType?: string;
}

export interface PharmacyInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  memberId?: string | null;
  isMember?: boolean;
  hasPrescription?: boolean;
  subtotal: string | number;
  discountAmount?: string | number;
  discountPercentage?: string | number;
  grandTotal: string | number;
  paidAmount?: string | number | null;
  dueAmount?: string | number | null;
  paymentMethod?: string | null;
  status: string;
  whatsappSent?: boolean;
  smsSent?: boolean;
  items: InvoiceItem[];
  createdAt: string;
}

export interface CreateInvoicePayload {
  customerName: string;
  phone: string;
  memberId?: string;
  isMember?: boolean;
  hasPrescription?: boolean;
  subtotal: number | string;
  discountAmount?: number | string;
  discountPercentage?: number | string;
  grandTotal: number | string;
  paidAmount?: number | string;
  dueAmount?: number | string;
  paymentMethod?: string;
  status?: string;
  whatsappSent?: boolean;
  smsSent?: boolean;
  items: InvoiceItem[];
}

export interface InvoiceListResponse {
  success: boolean;
  data: PharmacyInvoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPharmacyInvoices: builder.query<
      InvoiceListResponse,
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/pharmacy-invoices',
        params: params || undefined,
      }),
      providesTags: ['Invoices'],
    }),

    getPharmacyInvoiceById: builder.query<{ success: boolean; data: PharmacyInvoice }, string>({
      query: (id) => `/pharmacy-invoices/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Invoices', id }],
    }),

    createPharmacyInvoice: builder.mutation<
      { success: boolean; message: string; data: PharmacyInvoice },
      CreateInvoicePayload
    >({
      query: (body) => ({
        url: '/pharmacy-invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoices', 'Medicines', 'Stats'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPharmacyInvoicesQuery,
  useGetPharmacyInvoiceByIdQuery,
  useCreatePharmacyInvoiceMutation,
} = invoiceApi;

