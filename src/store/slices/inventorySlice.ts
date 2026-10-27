import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface MedicineItem {
  id: string;
  name: string;
  generic: string;
  category: string;
  cartonQty: number;
  packetPerCarton: number;
  piecePerPacket: number;
  totalPieces: number;
  batchNo: string;
  expiryDate: string;
  unitSellingPrice: number; // price per piece
  stripSellingPrice: number;
  minThresholdPieces: number;
  supplier: string;
  branch: string;
}

interface InventoryState {
  medicines: MedicineItem[];
  searchQuery: string;
  filterStatus: 'all' | 'low-stock' | 'near-expiry';
}

const initialMedicines: MedicineItem[] = [
  {
    id: 'med-101',
    name: 'Napa Extra 500mg',
    generic: 'Paracetamol + Caffeine',
    category: 'Analgesic',
    cartonQty: 12,
    packetPerCarton: 10,
    piecePerPacket: 10,
    totalPieces: 1200,
    batchNo: 'NP-2026-X1',
    expiryDate: '2026-11-15',
    unitSellingPrice: 3.5,
    stripSellingPrice: 35.0,
    minThresholdPieces: 300,
    supplier: 'Beximco Pharma Ltd',
    branch: 'Main Hospital Pharmacy',
  },
  {
    id: 'med-102',
    name: 'Seclo 20mg Capsule',
    generic: 'Omeprazole BP',
    category: 'Gastroenterology',
    cartonQty: 25,
    packetPerCarton: 10,
    piecePerPacket: 10,
    totalPieces: 2500,
    batchNo: 'SEC-8821',
    expiryDate: '2027-12-20',
    unitSellingPrice: 6.0,
    stripSellingPrice: 60.0,
    minThresholdPieces: 400,
    supplier: 'Square Pharmaceuticals',
    branch: 'Main Hospital Pharmacy',
  },
  {
    id: 'med-103',
    name: 'Azithromycin 500mg',
    generic: 'Azithromycin Dihydrate',
    category: 'Antibiotic',
    cartonQty: 2,
    packetPerCarton: 10,
    piecePerPacket: 3,
    totalPieces: 60,
    batchNo: 'AZ-1140',
    expiryDate: '2027-02-10',
    unitSellingPrice: 35.0,
    stripSellingPrice: 105.0,
    minThresholdPieces: 100,
    supplier: 'Incepta Pharmaceuticals',
    branch: 'Main Hospital Pharmacy',
  },
  {
    id: 'med-104',
    name: 'Monas 10mg Tablet',
    generic: 'Montelukast Sodium',
    category: 'Respiratory',
    cartonQty: 15,
    packetPerCarton: 5,
    piecePerPacket: 10,
    totalPieces: 750,
    batchNo: 'MON-440',
    expiryDate: '2027-08-18',
    unitSellingPrice: 17.5,
    stripSellingPrice: 175.0,
    minThresholdPieces: 200,
    supplier: 'Acme Laboratories',
    branch: 'Main Hospital Pharmacy',
  },
  {
    id: 'med-105',
    name: 'Ciprocin 500mg',
    generic: 'Ciprofloxacin',
    category: 'Antibiotic',
    cartonQty: 8,
    packetPerCarton: 10,
    piecePerPacket: 10,
    totalPieces: 800,
    batchNo: 'CIP-990',
    expiryDate: '2026-11-28',
    unitSellingPrice: 14.0,
    stripSellingPrice: 140.0,
    minThresholdPieces: 200,
    supplier: 'Square Pharmaceuticals',
    branch: 'Main Hospital Pharmacy',
  },
];

const initialState: InventoryState = {
  medicines: initialMedicines,
  searchQuery: '',
  filterStatus: 'all',
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addStockIn: (
      state,
      action: PayloadAction<{
        name: string;
        generic: string;
        category: string;
        cartonQty: number;
        packetPerCarton: number;
        piecePerPacket: number;
        batchNo: string;
        expiryDate: string;
        unitSellingPrice: number;
        stripSellingPrice: number;
        supplier: string;
        branch: string;
      }>
    ) => {
      const totalPieces =
        action.payload.cartonQty *
        action.payload.packetPerCarton *
        action.payload.piecePerPacket;

      const newItem: MedicineItem = {
        id: `med-${Date.now()}`,
        ...action.payload,
        totalPieces,
        minThresholdPieces: Math.max(100, Math.floor(totalPieces * 0.15)),
      };
      state.medicines.unshift(newItem);
    },
    deductStock: (
      state,
      action: PayloadAction<{ medicineId: string; piecesToDeduct: number }>
    ) => {
      const item = state.medicines.find((m) => m.id === action.payload.medicineId);
      if (item) {
        item.totalPieces = Math.max(0, item.totalPieces - action.payload.piecesToDeduct);
        const piecesPerCarton = item.packetPerCarton * item.piecePerPacket;
        if (piecesPerCarton > 0) {
          item.cartonQty = +(item.totalPieces / piecesPerCarton).toFixed(1);
        }
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterStatus: (
      state,
      action: PayloadAction<'all' | 'low-stock' | 'near-expiry'>
    ) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { addStockIn, deductStock, setSearchQuery, setFilterStatus } =
  inventorySlice.actions;
export default inventorySlice.reducer;
