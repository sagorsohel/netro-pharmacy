import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMedicinesQuery } from '../../store/api/medicineApi';
import { useCreatePharmacyInvoiceMutation } from '../../store/api/invoiceApi';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Receipt,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
  medicineId: string;
  name: string;
  generic: string;
  category: string;
  unitType: 'piece' | 'strip';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  piecePerPacket: number;
  availableStock: number;
}

export const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Customer Form State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [phone, setPhone] = useState('01700000000');
  const [memberId, setMemberId] = useState('');
  const [hasPrescription, setHasPrescription] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'bKash'>('Cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [whatsappSent, setWhatsappSent] = useState(true);
  const [smsSent, setSmsSent] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const { data: medicinesRes, isLoading } = useGetMedicinesQuery();
  const [createInvoice, { isLoading: isSubmitting }] = useCreatePharmacyInvoiceMutation();

  const allMedicines = medicinesRes?.data || [];

  // Filter medicines
  const filteredMedicines = useMemo(() => {
    return allMedicines.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [allMedicines, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allMedicines.forEach((m) => set.add(m.category));
    return ['All', ...Array.from(set)];
  }, [allMedicines]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Cart Operations
  const handleAddToCart = (medicine: any) => {
    const existingIndex = cart.findIndex((i) => i.medicineId === medicine.id);
    const piecePrice = Number(medicine.unitSellingPrice) || 5;
    const piecesPerStrip = Number(medicine.piecePerPacket) || 10;

    if (existingIndex > -1) {
      const updated = [...cart];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      const pieceEquiv = item.unitType === 'strip' ? newQty * item.piecePerPacket : newQty;

      if (pieceEquiv > item.availableStock) {
        setErrorBanner(`Insufficient stock for ${medicine.name}. Total available: ${item.availableStock} pcs`);
        return;
      }

      item.quantity = newQty;
      item.totalPrice = item.quantity * item.unitPrice;
      setCart(updated);
    } else {
      if (medicine.totalPieces <= 0) {
        setErrorBanner(`${medicine.name} is currently out of stock.`);
        return;
      }

      setCart([
        ...cart,
        {
          medicineId: medicine.id,
          name: medicine.name,
          generic: medicine.generic,
          category: medicine.category,
          unitType: 'piece',
          quantity: 1,
          unitPrice: piecePrice,
          totalPrice: piecePrice,
          piecePerPacket: piecesPerStrip,
          availableStock: Number(medicine.totalPieces),
        },
      ]);
    }
    setErrorBanner(null);
  };

  const handleUpdateUnitType = (index: number, newType: 'piece' | 'strip') => {
    const updated = [...cart];
    const item = updated[index];
    const med = allMedicines.find((m) => m.id === item.medicineId);
    if (!med) return;

    const piecePrice = Number(med.unitSellingPrice) || 5;
    const stripPrice = Number(med.stripSellingPrice) || piecePrice * item.piecePerPacket;

    item.unitType = newType;
    item.unitPrice = newType === 'strip' ? stripPrice : piecePrice;
    item.totalPrice = item.quantity * item.unitPrice;
    setCart(updated);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    const pieceEquiv = item.unitType === 'strip' ? newQty * item.piecePerPacket : newQty;
    if (pieceEquiv > item.availableStock) {
      setErrorBanner(`Cannot exceed available stock (${item.availableStock} pcs).`);
      return;
    }

    item.quantity = newQty;
    item.totalPrice = item.quantity * item.unitPrice;
    setCart(updated);
    setErrorBanner(null);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, idx) => idx !== index));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setErrorBanner('Please add at least one medicine to the cart.');
      return;
    }
    if (!customerName.trim()) {
      setErrorBanner('Customer name is required.');
      return;
    }

    setErrorBanner(null);

    const formattedItems = cart.map((item) => ({
      medicineId: item.medicineId,
      name: item.name,
      generic: item.generic,
      category: item.category,
      unitType: item.unitType,
      quantity: item.unitType === 'strip' ? item.quantity * item.piecePerPacket : item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    try {
      const response = await createInvoice({
        customerName: customerName.trim(),
        phone: phone.trim() || '01700000000',
        memberId: memberId.trim() || undefined,
        isMember: Boolean(memberId.trim()),
        hasPrescription,
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        discountPercentage: discountPercent.toString(),
        grandTotal: grandTotal.toFixed(2),
        status: 'Paid',
        whatsappSent,
        smsSent,
        items: formattedItems,
      }).unwrap();

      if (response.success && response.data?.id) {
        navigate(`/invoices/${response.data.id}`);
      } else {
        navigate('/invoices');
      }
    } catch (err: any) {
      setErrorBanner(err?.data?.message || 'Failed to complete sale transaction.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none text-xs">
      {/* Top POS Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-dark tracking-tight flex items-center gap-2">
              POS Billing Counter
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Sales
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Fast counter dispensing, barcode/name search, multi-unit strip & piece sales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="h-9 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Cart ({cart.length})
            </button>
          )}
        </div>
      </div>

      {errorBanner && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-medium animate-in fade-in shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Main 2-Column POS Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Medicine Catalog (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-4 flex flex-col min-h-0 overflow-hidden">
          {/* Search & Category Filter */}
          <div className="space-y-3 pb-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine brand, generic name or batch number..."
                className="w-full h-9 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medicines Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar pt-3 space-y-2">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400">Loading catalog...</div>
            ) : filteredMedicines.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No medicines found matching criteria.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredMedicines.map((med) => {
                  const isOutOfStock = med.totalPieces <= 0;
                  return (
                    <div
                      key={med.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-2xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-dark text-xs truncate max-w-[180px]">
                            {med.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700'
                                : med.totalPieces <= med.minThresholdPieces
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : `${med.totalPieces} pcs`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{med.generic}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Exp: {med.expiryDate}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                        <div>
                          <span className="font-black text-dark text-xs">
                            ৳{Number(med.unitSellingPrice).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-400"> /pc</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(med)}
                          disabled={isOutOfStock}
                          className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Bill Ticket & Cart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-4 flex flex-col min-h-0 overflow-hidden">
          {/* Customer & Prescription Details */}
          <div className="space-y-2.5 pb-3 border-b border-slate-100 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Customer Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Phone (SMS / WA)</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <input
                  type="text"
                  placeholder="Member ID (Optional)"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full h-7 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPrescription}
                  onChange={(e) => setHasPrescription(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700 text-[11px]">Rx Attached</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappSent}
                    onChange={(e) => setWhatsappSent(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-700 text-[11px]">WA</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsSent}
                    onChange={(e) => setSmsSent(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-700 text-[11px]">SMS</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2 min-h-0">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="h-8 w-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-500">Cart is Empty</p>
                <p className="text-[11px]">Select medicines from the left to begin billing.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.medicineId}-${item.unitType}`}
                  className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden flex-1">
                    <h5 className="font-bold text-dark text-xs truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Unit Selector (Piece / Strip) */}
                      <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleUpdateUnitType(index, 'piece')}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                            item.unitType === 'piece' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          Pcs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateUnitType(index, 'strip')}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                            item.unitType === 'strip' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          Strip
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        @ ৳{item.unitPrice.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(index, -1)}
                      className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(index, 1)}
                      className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right pl-2">
                    <div className="font-black text-xs text-dark">৳{item.totalPrice.toFixed(1)}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-[10px] text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary & Checkout */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5 shrink-0 bg-white">
            <div className="space-y-1 text-slate-600 text-xs">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-dark">৳{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-12 h-6 px-1 text-center font-bold rounded border border-slate-200 text-xs"
                  />
                  <span>%</span>
                </span>
                <span className="font-bold text-emerald-700">-৳{discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-dark pt-1 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-emerald-700 text-base">৳{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Pills */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['Cash', 'Card', 'bKash'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Complete Sale Button */}
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isSubmitting || cart.length === 0}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Sale...</span>
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  <span>Complete Sale & Print Slip (৳{grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
