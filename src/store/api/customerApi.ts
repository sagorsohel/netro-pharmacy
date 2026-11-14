import { baseApi } from './baseApi';

export interface PharmacyCustomer {
  id: string;
  pharmacyId: number;
  customerCode?: string;
  name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string;
  bloodGroup?: string | null;
  address?: string | null;
  refDoctor?: string | null;
  totalOrders: number;
  totalSpent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: PharmacyCustomer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  refDoctor?: string;
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPharmacyCustomers: builder.query<
      CustomerListResponse,
      { search?: string; isActive?: boolean; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/pharmacy-customers',
        params: params || undefined,
      }),
      providesTags: ['Customers'],
    }),

    getPharmacyCustomerById: builder.query<{ success: boolean; data: PharmacyCustomer }, string>({
      query: (id) => `/pharmacy-customers/${id}`,
      providesTags: ['Customers'],
    }),

    createPharmacyCustomer: builder.mutation<
      { success: boolean; message: string; data: PharmacyCustomer },
      CreateCustomerPayload
    >({
      query: (body) => ({
        url: '/pharmacy-customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customers'],
    }),

    updatePharmacyCustomer: builder.mutation<
      { success: boolean; message: string; data: PharmacyCustomer },
      { id: string; data: Partial<CreateCustomerPayload> & { isActive?: boolean } }
    >({
      query: ({ id, data }) => ({
        url: `/pharmacy-customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

export const {
  useGetPharmacyCustomersQuery,
  useGetPharmacyCustomerByIdQuery,
  useCreatePharmacyCustomerMutation,
  useUpdatePharmacyCustomerMutation,
} = customerApi;

