import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  medicineId: string;
  name: string;
  unitType: 'piece' | 'strip' | 'carton';
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  grandTotal: number;
  isMember: boolean;
  memberId?: string;
  hasPrescription: boolean;
  prescriptionImageRef?: string;
  createdAt: string;
  status: 'Paid' | 'Due';
  sentWhatsApp: boolean;
  sentSms: boolean;
}

interface PosState {
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  isMember: boolean;
  memberId: string;
  hasPrescription: boolean;
  invoices: InvoiceRecord[];
}

const initialInvoices: InvoiceRecord[] = [
  {
    id: 'inv-101',
    invoiceNo: 'NETRO-PH-0891',
    customerName: 'MD Mobarok Hossain',
    phone: '+8801712345678',
    items: [
      {
        medicineId: 'med-101',
        name: 'Napa Extra 500mg',
        unitType: 'strip',
        unitPrice: 35.0,
        quantity: 2,
        totalPrice: 70.0,
      },
      {
        medicineId: 'med-102',
        name: 'Seclo 20mg Capsule',
        unitType: 'strip',
        unitPrice: 60.0,
        quantity: 1,
        totalPrice: 60.0,
      },
    ],
    subtotal: 130.0,
    discountPercentage: 10,
    discountAmount: 13.0,
    grandTotal: 117.0,
    isMember: true,
    memberId: 'MEM-772',
    hasPrescription: true,
    createdAt: 'Today, 02:45 PM',
    status: 'Paid',
    sentWhatsApp: true,
    sentSms: true,
  },
  {
    id: 'inv-102',
    invoiceNo: 'NETRO-PH-0892',
    customerName: 'Nasrin Sultana',
    phone: '+8801819876543',
    items: [
      {
        medicineId: 'med-104',
        name: 'Monas 10mg Tablet',
        unitType: 'strip',
        unitPrice: 175.0,
        quantity: 2,
        totalPrice: 350.0,
      },
    ],
    subtotal: 350.0,
    discountPercentage: 0,
    discountAmount: 0,
    grandTotal: 350.0,
    isMember: false,
    hasPrescription: true,
    createdAt: 'Today, 03:15 PM',
    status: 'Paid',
    sentWhatsApp: false,
    sentSms: true,
  },
];

const initialState: PosState = {
  cart: [],
  customerName: 'Walk-in Customer',
  customerPhone: '+88017',
  isMember: false,
  memberId: '',
  hasPrescription: false,
  invoices: initialInvoices,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        medicineId: string;
        name: string;
        unitType: 'piece' | 'strip' | 'carton';
        unitPrice: number;
        quantity: number;
      }>
    ) => {
      const existing = state.cart.find(
        (i) =>
          i.medicineId === action.payload.medicineId &&
          i.unitType === action.payload.unitType
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.totalPrice = +(existing.quantity * existing.unitPrice).toFixed(2);
      } else {
        state.cart.push({
          ...action.payload,
          totalPrice: +(action.payload.quantity * action.payload.unitPrice).toFixed(2),
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart.splice(action.payload, 1);
    },
    clearCart: (state) => {
      state.cart = [];
      state.customerName = 'Walk-in Customer';
      state.customerPhone = '+88017';
      state.isMember = false;
      state.memberId = '';
      state.hasPrescription = false;
    },
    setCustomerInfo: (
      state,
      action: PayloadAction<{
        customerName?: string;
        customerPhone?: string;
        isMember?: boolean;
        memberId?: string;
        hasPrescription?: boolean;
      }>
    ) => {
      if (action.payload.customerName !== undefined)
        state.customerName = action.payload.customerName;
      if (action.payload.customerPhone !== undefined)
        state.customerPhone = action.payload.customerPhone;
      if (action.payload.isMember !== undefined)
        state.isMember = action.payload.isMember;
      if (action.payload.memberId !== undefined)
        state.memberId = action.payload.memberId;
      if (action.payload.hasPrescription !== undefined)
        state.hasPrescription = action.payload.hasPrescription;
    },
    checkout: (state) => {
      if (state.cart.length === 0) return;

      const subtotal = state.cart.reduce((acc, curr) => acc + curr.totalPrice, 0);
      const discountPercentage = state.isMember ? 10 : 0;
      const discountAmount = +(subtotal * (discountPercentage / 100)).toFixed(2);
      const grandTotal = +(subtotal - discountAmount).toFixed(2);

      const newInvoice: InvoiceRecord = {
        id: `inv-${Date.now()}`,
        invoiceNo: `NETRO-PH-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: state.customerName || 'Walk-in Customer',
        phone: state.customerPhone || 'N/A',
        items: [...state.cart],
        subtotal,
        discountPercentage,
        discountAmount,
        grandTotal,
        isMember: state.isMember,
        memberId: state.memberId,
        hasPrescription: state.hasPrescription,
        createdAt: 'Just now',
        status: 'Paid',
        sentWhatsApp: true,
        sentSms: true,
      };

      state.invoices.unshift(newInvoice);
      state.cart = [];
      state.customerName = 'Walk-in Customer';
      state.customerPhone = '+88017';
      state.isMember = false;
      state.memberId = '';
      state.hasPrescription = false;
    },
    markWhatsAppSent: (state, action: PayloadAction<string>) => {
      const inv = state.invoices.find((i) => i.id === action.payload);
      if (inv) inv.sentWhatsApp = true;
    },
    markSmsSent: (state, action: PayloadAction<string>) => {
      const inv = state.invoices.find((i) => i.id === action.payload);
      if (inv) inv.sentSms = true;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  setCustomerInfo,
  checkout,
  markWhatsAppSent,
  markSmsSent,
} = posSlice.actions;
export default posSlice.reducer;
