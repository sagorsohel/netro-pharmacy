import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  Receipt,
  CheckCircle2,
  Pill,
  Clock,
  Printer,
  X,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useGetMedicinesQuery, type Medicine } from '../../store/api/medicineApi';
import { useCreatePharmacyInvoiceMutation } from '../../store/api/invoiceApi';
import {
  useGetPharmacyCustomersQuery,
  useCreatePharmacyCustomerMutation,
  type PharmacyCustomer,
} from '../../store/api/customerApi';
import { useAppSelector } from '../../store/hooks';

export interface CartMedicineItem {
  medicineId: string;
  name: string;
  generic: string;
  category: string;
  batchNo: string;
  expiryDate: string;
  piecePerPacket: number;
  availablePieces: number;
  unitType: 'piece' | 'strip';
  unitPrice: number; // piece price or strip price depending on unitType
  quantity: number; // quantity in chosen unitType
  discountType: 'amount' | 'percent';
  discountVal: number;
  discountAmount: number;
  finalAmount: number;
}

export const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPhone = searchParams.get('phone');
  const { pharmacy } = useAppSelector((state) => state.auth);

  // Queries & Mutations
  const { data: medicinesRes } = useGetMedicinesQuery({ limit: 200 });
  const allMedicines = useMemo(() => medicinesRes?.data || [], [medicinesRes]);

  const [customerSearchTerm, setCustomerSearchTerm] = useState(prefillPhone || '');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerSearchRef = useRef<HTMLDivElement>(null);

  const { data: customersRes, isLoading: isCustomersLoading } = useGetPharmacyCustomersQuery(
    customerSearchTerm.trim().length >= 1 ? { search: customerSearchTerm.trim(), limit: 10 } : undefined
  );
  const matchedCustomers = useMemo(() => customersRes?.data || [], [customersRes]);

  const [createInvoice, { isLoading: isSubmitting }] = useCreatePharmacyInvoiceMutation();
  const [createCustomer] = useCreatePharmacyCustomerMutation();

  // Intake Mode: 'existing' vs 'new'
  const [intakeMode, setIntakeMode] = useState<'existing' | 'new'>('existing');

  // Selected Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<PharmacyCustomer | null>(null);

  // Form State - Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [refDoctor, setRefDoctor] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('Immediate / Counter');

  // Form State - Medicine Catalog Search
  const [medSearch, setMedSearch] = useState('');
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
  const medSearchRef = useRef<HTMLDivElement>(null);

  // Form State - Cart Items
  const [cartItems, setCartItems] = useState<CartMedicineItem[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form State - POS Financials
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [whatsappSent] = useState(true);
  const [hasPrescription] = useState(false);

  // Success Notification
  const [successInfo, setSuccessInfo] = useState<{
    invoiceNo: string;
    invoiceId: string;
    customerName: string;
  } | null>(null);

  // Outside click handlers for floating dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
      if (medSearchRef.current && !medSearchRef.current.contains(event.target as Node)) {
        setIsMedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered medicines for instant search
  const filteredMedicines = useMemo(() => {
    if (!medSearch.trim()) return [];
    const term = medSearch.toLowerCase();
    return allMedicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.generic.toLowerCase().includes(term) ||
        m.batchNo.toLowerCase().includes(term)
    );
  }, [allMedicines, medSearch]);

  // Handle Pick Existing Customer
  const handlePickCustomer = (c: PharmacyCustomer) => {
    setSelectedCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerAddress(c.address || '');
    if (c.refDoctor) setRefDoctor(c.refDoctor);
    setCustomerSearchTerm(c.phone);
    setIsCustomerDropdownOpen(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setRefDoctor('');
    setCustomerSearchTerm('');
  };

  // Cart Operations
  const handleAddMedicineToCart = (medicine: Medicine) => {
    const existingIndex = cartItems.findIndex((item) => item.medicineId === medicine.id);
    const piecePrice = Number(medicine.unitSellingPrice) || 5;
    const piecesPerStrip = Number(medicine.piecePerPacket) || 10;
    const available = Number(medicine.totalPieces) || 0;

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      const pieceEquiv = item.unitType === 'strip' ? newQty * item.piecePerPacket : newQty;

      if (pieceEquiv > item.availablePieces) {
        setErrorBanner(`Insufficient stock for ${medicine.name}. Available: ${item.availablePieces} pcs`);
        return;
      }

      item.quantity = newQty;
      const lineGross = item.quantity * item.unitPrice;
      const discAmt =
        item.discountType === 'percent'
          ? (lineGross * (item.discountVal || 0)) / 100
          : item.discountVal || 0;
      item.discountAmount = discAmt;
      item.finalAmount = Math.max(0, lineGross - discAmt);
      setCartItems(updated);
    } else {
      if (available <= 0) {
        setErrorBanner(`${medicine.name} is currently out of stock.`);
        return;
      }

      const newItem: CartMedicineItem = {
        medicineId: medicine.id,
        name: medicine.name,
        generic: medicine.generic,
        category: medicine.category,
        batchNo: medicine.batchNo,
        expiryDate: medicine.expiryDate,
        piecePerPacket: piecesPerStrip,
        availablePieces: available,
        unitType: 'piece',
        unitPrice: piecePrice,
        quantity: 1,
        discountType: 'amount',
        discountVal: 0,
        discountAmount: 0,
        finalAmount: piecePrice,
      };

      setCartItems([...cartItems, newItem]);
    }
    setErrorBanner(null);
  };

  const handleUpdateUnitType = (index: number, newUnitType: 'piece' | 'strip') => {
    const updated = [...cartItems];
    const item = updated[index];
    const med = allMedicines.find((m) => m.id === item.medicineId);
    if (!med) return;

    const piecePrice = Number(med.unitSellingPrice) || 5;
    const stripPrice = Number(med.stripSellingPrice) || piecePrice * item.piecePerPacket;

    item.unitType = newUnitType;
    item.unitPrice = newUnitType === 'strip' ? stripPrice : piecePrice;

    // Check stock
    const pieceEquiv = newUnitType === 'strip' ? item.quantity * item.piecePerPacket : item.quantity;
    if (pieceEquiv > item.availablePieces) {
      item.quantity = Math.max(
        1,
        newUnitType === 'strip'
          ? Math.floor(item.availablePieces / item.piecePerPacket)
          : item.availablePieces
      );
    }

    const lineGross = item.quantity * item.unitPrice;
    const discAmt =
      item.discountType === 'percent'
        ? (lineGross * (item.discountVal || 0)) / 100
        : item.discountVal || 0;
    item.discountAmount = discAmt;
    item.finalAmount = Math.max(0, lineGross - discAmt);
    setCartItems(updated);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cartItems];
    const item = updated[index];
    const pieceEquiv = item.unitType === 'strip' ? newQty * item.piecePerPacket : newQty;

    if (pieceEquiv > item.availablePieces) {
      setErrorBanner(`Insufficient stock. Total available: ${item.availablePieces} pcs.`);
      return;
    }

    item.quantity = newQty;
    const lineGross = item.quantity * item.unitPrice;
    const discAmt =
      item.discountType === 'percent'
        ? (lineGross * (item.discountVal || 0)) / 100
        : item.discountVal || 0;
    item.discountAmount = discAmt;
    item.finalAmount = Math.max(0, lineGross - discAmt);
    setCartItems(updated);
    setErrorBanner(null);
  };

  const handleUpdateLineDiscount = (
    index: number,
    val: number,
    type: 'amount' | 'percent' = 'amount'
  ) => {
    const updated = [...cartItems];
    const item = updated[index];
    item.discountType = type;
    item.discountVal = val;
    const lineGross = item.quantity * item.unitPrice;
    const discAmt = type === 'percent' ? (lineGross * val) / 100 : val;
    item.discountAmount = discAmt;
    item.finalAmount = Math.max(0, lineGross - discAmt);
    setCartItems(updated);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setErrorBanner(null);
  };

  // Financial Calculations
  const grossSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [cartItems]);

  const lineDiscountsTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.discountAmount, 0);
  }, [cartItems]);

  const afterLineDisc = Math.max(0, grossSubtotal - lineDiscountsTotal);

  const invoiceDiscount = useMemo(() => {
    if (discountType === 'percent') {
      return (afterLineDisc * (discountVal || 0)) / 100;
    }
    return discountVal || 0;
  }, [afterLineDisc, discountType, discountVal]);

  const totalDiscount = lineDiscountsTotal + invoiceDiscount;
  const grandTotal = Math.max(0, grossSubtotal - totalDiscount);

  const parsedPaid =
    paidAmount === '' ? grandTotal : parseFloat(String(paidAmount)) || 0;
  const dueAmount = Math.max(0, grandTotal - parsedPaid);

  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const handleQuickPayment = (type: 'full' | 'half' | 'due') => {
    if (type === 'full') setPaidAmount(grandTotal);
    if (type === 'half') setPaidAmount(Math.round(grandTotal / 2));
    if (type === 'due') setPaidAmount(0);
  };

  // Submit Order & Print
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorBanner('Please add at least one medicine to the table before completing order.');
      return;
    }

    const finalCustomerName = customerName.trim() || 'Walk-in Customer';
    const finalPhone = customerPhone.trim() || '01700000000';

    try {
      // 1. If in 'new' intake mode or customer phone is provided and no customer selected, auto-register customer strictly in THIS pharmacy
      if (intakeMode === 'new' && customerPhone.trim()) {
        try {
          await createCustomer({
            name: finalCustomerName,
            phone: finalPhone,
            address: customerAddress.trim() || undefined,
            refDoctor: refDoctor.trim() || undefined,
          }).unwrap();
        } catch {
          // If already registered or minor warning, continue smoothly with invoice
        }
      }

      // 2. Prepare payload
      const invoicePayload = {
        pharmacyId: pharmacy?.id || 1001,
        customerName: finalCustomerName,
        phone: finalPhone,
        memberId: selectedCustomer?.customerCode || undefined,
        isMember: Boolean(selectedCustomer),
        hasPrescription,
        subtotal: grossSubtotal.toFixed(2),
        discountAmount: totalDiscount.toFixed(2),
        discountPercentage: (grossSubtotal > 0 ? (totalDiscount / grossSubtotal) * 100 : 0).toFixed(1),
        grandTotal: grandTotal.toFixed(2),
        status: dueAmount <= 0 ? 'Paid' : 'Partial',
        whatsappSent,
        smsSent: false,
        paymentMethod,
        refDoctor: refDoctor.trim() || undefined,
        deliveryDate,
        items: cartItems.map((item) => ({
          medicineId: item.medicineId,
          name: item.name,
          generic: item.generic,
          category: item.category,
          unitType: item.unitType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.finalAmount,
          piecePerPacket: item.piecePerPacket,
          piecesDeducted:
            item.unitType === 'strip' ? item.quantity * item.piecePerPacket : item.quantity,
        })),
      };

      const res = await createInvoice(invoicePayload).unwrap();

      if (res.success && res.data) {
        setSuccessInfo({
          invoiceNo: res.data.invoiceNo,
          invoiceId: res.data.id,
          customerName: finalCustomerName,
        });
        setCartItems([]);
        setDiscountVal(0);
        setPaidAmount('');
      }
    } catch (err: any) {
      console.error('POS Checkout error:', err);
      setErrorBanner(
        err?.data?.message || err?.data?.error || 'Failed to complete pharmacy billing.'
      );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1600px] mx-auto gap-2 select-none">
      {/* Success Notification Bar */}
      {successInfo && (
        <div className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Invoice Confirmed: <strong className="font-mono font-semibold">#{successInfo.invoiceNo}</strong> | Customer:{' '}
              <strong className="font-semibold">{successInfo.customerName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/invoices/${successInfo.invoiceId}`)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-2xs cursor-pointer transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Memo / Slip</span>
            </button>
            <button
              onClick={() => setSuccessInfo(null)}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              New Sale
            </button>
          </div>
        </div>
      )}

      {/* Error Notification Bar */}
      {errorBanner && (
        <div className="shrink-0 p-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            type="button"
            className="text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Single-Screen POS Form */}
      <form onSubmit={handleSubmitOrder} className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        {/* ================= 1. FIXED TOP COMPACT CUSTOMER & DOCTOR BAR (shrink-0) ================= */}
        {selectedCustomer ? (
          /* Ultra Compact 1-Line Loaded Customer Pill */
          <div className="shrink-0 bg-white rounded-xl p-2 sm:px-3 border border-emerald-200/90 bg-emerald-50/70 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                type="button"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 transition font-medium cursor-pointer mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-slate-300">|</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950">{selectedCustomer.name}</span>
              <span className="font-mono font-medium text-emerald-800 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                {selectedCustomer.phone}
              </span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {selectedCustomer.customerCode || 'Registered Customer'}
              </span>
              {selectedCustomer.address && (
                <span className="text-slate-500 truncate max-w-xs">• {selectedCustomer.address}</span>
              )}
              <span className="text-slate-700 font-medium pl-1 border-l border-emerald-200">
                Doc: {refDoctor || selectedCustomer.refDoctor || 'Counter Sale / Duty Doc'}
              </span>
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-emerald-200 text-emerald-950 font-semibold">
                <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="text-[11px]">Delivery:</span>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  placeholder="Immediate / Counter"
                  className="h-6 w-36 px-1.5 rounded border border-emerald-300 bg-white text-xs font-semibold text-emerald-950 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setDeliveryDate('Today 8:00 PM')}
                  className="px-1.5 h-6 rounded border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold cursor-pointer shrink-0"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryDate('Tomorrow 4:00 PM')}
                  className="px-1.5 h-6 rounded border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold cursor-pointer shrink-0"
                >
                  Tmrw
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearCustomer}
                className="text-xs text-emerald-800 hover:text-rose-600 underline font-medium cursor-pointer"
              >
                Change Customer
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => navigate('/invoices')}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-emerald-700 text-xs font-medium transition cursor-pointer"
              >
                <Receipt className="h-3 w-3 text-slate-400" />
                <span>Invoices</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs space-y-2">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 transition font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-xs text-slate-900">Pharmacy POS Terminal</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Counter #1 Active
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Outlet #{pharmacy?.id || '1001'}
                </span>
              </div>

              {/* Mode Switcher Pills & Invoice Link */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode('existing');
                      setIsCustomerDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      intakeMode === 'existing'
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Search className="h-3 w-3" />
                    <span>Existing Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeMode('new');
                      handleClearCustomer();
                      setIsCustomerDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      intakeMode === 'new'
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>+ New Patient</span>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/invoices')}
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-emerald-700 text-xs font-medium transition cursor-pointer"
                >
                  <Receipt className="h-3 w-3 text-slate-400" />
                  <span>Invoices</span>
                </button>
              </div>
            </div>

            {/* Existing Patient Search Row */}
            {intakeMode === 'existing' ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div ref={customerSearchRef} className="sm:col-span-6 relative">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 pointer-events-none" />
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      placeholder="Type phone number (017...), patient ID (P-1001), or name..."
                      className="w-full h-8.5 pl-9 pr-8 rounded-lg border border-slate-300 focus:border-emerald-500 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
                    />
                    {customerSearchTerm && (
                      <button
                        type="button"
                        onClick={handleClearCustomer}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Instant Floating Dropdown Scoped to THIS Pharmacy */}
                  {isCustomerDropdownOpen && customerSearchTerm.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-40 p-1.5 space-y-1">
                      {isCustomersLoading ? (
                        <div className="py-4 text-center text-xs text-slate-500">Searching pharmacy records...</div>
                      ) : matchedCustomers.length === 0 ? (
                        <div className="py-3 px-2 text-center text-xs text-slate-500">
                          <span>No patient found in this pharmacy matching "{customerSearchTerm}". </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIntakeMode('new');
                              setCustomerPhone(customerSearchTerm);
                              setIsCustomerDropdownOpen(false);
                            }}
                            className="text-emerald-700 font-medium hover:underline cursor-pointer"
                          >
                            + Register New
                          </button>
                        </div>
                      ) : (
                        matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handlePickCustomer(c)}
                            className="p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 mr-2">{c.name}</span>
                              <span className="font-mono text-emerald-700 font-medium mr-2">{c.phone}</span>
                              <span className="font-mono text-[10px] text-slate-500">#{c.customerCode || 'N/A'}</span>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shrink-0">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Ref Doctor Input */}
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={refDoctor}
                    onChange={(e) => setRefDoctor(e.target.value)}
                    placeholder="-- Ref Doctor --"
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>

                {/* Expected Delivery / Follow up */}
                <div className="sm:col-span-3 flex items-center gap-1.5 bg-emerald-50/70 p-1 rounded-lg border border-emerald-300 shadow-2xs">
                  <span className="text-[11px] font-bold text-emerald-950 shrink-0 flex items-center gap-1 pl-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Delivery:</span>
                  </span>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    placeholder="Immediate / Counter"
                    className="w-full h-7 px-2 rounded-md border border-emerald-300 bg-white text-xs font-semibold text-emerald-950 focus:outline-hidden focus:border-emerald-600"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeliveryDate('Today 8:00 PM')}
                      className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                        deliveryDate === 'Today 8:00 PM'
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryDate('Tomorrow 4:00 PM')}
                      className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                        deliveryDate === 'Tomorrow 4:00 PM'
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      Tmrw
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* New Customer Mode: No Age, Gender or Blood Group */
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Patient Full Name *"
                    className="sm:col-span-4 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contact Phone *"
                    className="sm:col-span-4 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Address / Location (Optional)"
                    className="sm:col-span-4 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                  <input
                    type="text"
                    value={refDoctor}
                    onChange={(e) => setRefDoctor(e.target.value)}
                    placeholder="-- Ref Doctor --"
                    className="sm:col-span-5 h-8.5 px-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <div className="sm:col-span-7 flex items-center gap-1.5 bg-emerald-50/70 p-1 rounded-lg border border-emerald-300 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-950 shrink-0 flex items-center gap-1 pl-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Delivery:</span>
                    </span>
                    <input
                      type="text"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      placeholder="Immediate / Counter"
                      className="w-full h-7 px-2 rounded-md border border-emerald-300 bg-white text-xs font-semibold text-emerald-950 focus:outline-hidden focus:border-emerald-600"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDeliveryDate('Today 8:00 PM')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === 'Today 8:00 PM'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryDate('Tomorrow 4:00 PM')}
                        className={`px-2 h-7 rounded text-[10px] font-medium transition cursor-pointer ${
                          deliveryDate === 'Tomorrow 4:00 PM'
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        Tmrw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. MIDDLE SCROLLABLE MEDICINES TABLE (flex-1 min-h-0 overflow-hidden) ================= */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-2 overflow-hidden">
          {/* Top Search & Filter Bar */}
          <div className="shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <div ref={medSearchRef} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => {
                    setMedSearch(e.target.value);
                    setIsMedDropdownOpen(true);
                  }}
                  onFocus={() => setIsMedDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredMedicines.length > 0) {
                        handleAddMedicineToCart(filteredMedicines[0]);
                        setMedSearch('');
                        setIsMedDropdownOpen(false);
                      }
                    }
                  }}
                  placeholder="Search test by code or name (e.g. CBC, USG, Lipid, ECG, Glucose, Creatinine)... [Type to search, press Enter to add]"
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-300 focus:border-emerald-500 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition shadow-2xs"
                />
                {medSearch && (
                  <button
                    type="button"
                    onClick={() => setMedSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Instant Suggestions Dropdown */}
                {isMedDropdownOpen && medSearch.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 space-y-1">
                    {filteredMedicines.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No medicines match "{medSearch}".
                      </div>
                    ) : (
                      filteredMedicines.slice(0, 10).map((m) => {
                        const inCart = cartItems.find((ci) => ci.medicineId === m.id);
                        const isOut = Number(m.totalPieces) <= 0;

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (!isOut) {
                                handleAddMedicineToCart(m);
                                setMedSearch('');
                                setIsMedDropdownOpen(false);
                              }
                            }}
                            className={`p-2 rounded-lg transition flex items-center justify-between gap-2 text-xs ${
                              isOut
                                ? 'opacity-50 cursor-not-allowed bg-slate-50'
                                : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">
                                {m.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {m.generic} • {m.category} • Batch {m.batchNo} • Exp {m.expiryDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                  isOut
                                    ? 'bg-rose-100 text-rose-700'
                                    : Number(m.totalPieces) < 50
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isOut ? 'Out of Stock' : `${m.totalPieces} pcs`}
                              </span>
                              <span className="font-bold font-mono text-emerald-700">
                                ৳{Number(m.unitSellingPrice).toFixed(1)}/pc
                              </span>
                              <button
                                type="button"
                                disabled={isOut}
                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-medium cursor-pointer"
                              >
                                {inCart ? `+ More (${inCart.quantity})` : '+ Add'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Table Status Pill */}
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shrink-0">
                {cartItems.length} Test(s) ({totalUnits} Unit)
              </span>

              {/* Clear Table Button */}
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 text-xs font-medium transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* DEDICATED SCROLLABLE TABLE CONTAINER */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200 relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] z-10 shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">DIAGNOSTIC TEST & LAB DEPARTMENT</th>
                  <th className="py-2.5 px-3 text-center w-36">UNIT TYPE</th>
                  <th className="py-2.5 px-3 text-right w-24">RATE (৳)</th>
                  <th className="py-2.5 px-3 text-center w-36">QUANTITY</th>
                  <th className="py-2.5 px-3 text-center w-40">LINE DISCOUNT</th>
                  <th className="py-2.5 px-3 text-right w-28">NET TOTAL</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Pill className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                      <p className="font-semibold text-slate-800 text-xs">No diagnostic tests in table</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Use the search bar above to add diagnostic tests.
                      </p>
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, idx) => {
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        {/* Sl Number */}
                        <td className="py-2 px-3 text-center">
                          <span className="h-5 w-5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Medicine Details */}
                        <td className="py-2 px-3 min-w-[200px]">
                          <span className="font-semibold text-slate-900 block">{item.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{item.generic}</span>
                            <span>•</span>
                            <span className="font-mono">Batch: {item.batchNo}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold font-mono">
                              Exp: {item.expiryDate}
                            </span>
                          </div>
                        </td>

                        {/* Unit Type Pill Selector */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => handleUpdateUnitType(idx, 'piece')}
                              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                                item.unitType === 'piece'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-dark'
                              }`}
                            >
                              Piece
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateUnitType(idx, 'strip')}
                              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                                item.unitType === 'strip'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-dark'
                              }`}
                            >
                              Strip ({item.piecePerPacket}p)
                            </button>
                          </div>
                        </td>

                        {/* Rate */}
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                          ৳{item.unitPrice.toFixed(1)}
                        </td>

                        {/* Quantity Counter */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden h-7">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2 h-full bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(idx, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-12 h-full text-center text-xs font-bold font-mono focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                              className="px-2 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Line Discount */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden h-7 w-32">
                            <input
                              type="number"
                              min={0}
                              value={item.discountVal || ''}
                              onChange={(e) =>
                                handleUpdateLineDiscount(
                                  idx,
                                  parseFloat(e.target.value) || 0,
                                  item.discountType
                                )
                              }
                              placeholder="0"
                              className="w-full h-full px-2 text-right font-semibold text-xs focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLineDiscount(
                                  idx,
                                  item.discountVal,
                                  item.discountType === 'amount' ? 'percent' : 'amount'
                                )
                              }
                              className="px-1.5 h-full bg-slate-100 text-[10px] font-bold text-slate-600 border-l border-slate-200 hover:bg-slate-200 cursor-pointer"
                            >
                              {item.discountType === 'amount' ? '৳' : '%'}
                            </button>
                          </div>
                        </td>

                        {/* Net Total */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-dark">
                          ৳{item.finalAmount.toFixed(1)}
                        </td>

                        {/* Trash */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            title="Remove item"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= 3. FIXED BOTTOM COMPACT FINANCIAL SETTLEMENT DOCK (shrink-0) ================= */}
        <div className="shrink-0 bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
            {/* Left Col (4 Cols): Special Invoice Discount & Payment Method */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">Inv Disc:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden flex-1 h-8">
                  <input
                    type="number"
                    min={0}
                    value={discountVal || ''}
                    onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                    className="w-full h-8 px-2 text-right font-semibold text-slate-900 text-xs focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountType(discountType === 'amount' ? 'percent' : 'amount')
                    }
                    className="px-2 h-8 bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 border-l border-slate-200 shrink-0 cursor-pointer"
                  >
                    {discountType === 'amount' ? 'BDT' : '%'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">Pay Via:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="bKash / MFS">bKash / MFS</option>
                  <option value="Nagad">Nagad MFS</option>
                  <option value="Card">Card POS</option>
                  <option value="Bank Wire">Bank Wire</option>
                </select>
              </div>
            </div>

            {/* Middle Col (4 Cols): Subtotals & Compact Grand Total Hero */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>Gross: ৳{grossSubtotal.toFixed(0)}</span>
                {totalDiscount > 0 && (
                  <span className="text-emerald-700 font-medium">
                    Disc: -৳{totalDiscount.toFixed(0)}
                  </span>
                )}
              </div>

              {/* Compact Net Payable Hero Card */}
              <div className="h-10 px-3.5 rounded-xl bg-slate-950 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400">
                    Net Payable
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  ৳{grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right Col (4 Cols): Cash Received, Due Status & Complete Button */}
            <div className="lg:col-span-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('full')}
                    className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium cursor-pointer"
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('half')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPayment('due')}
                    className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 font-medium cursor-pointer"
                  >
                    Due
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={grandTotal ? `৳${grandTotal}` : 'Paid (৳)'}
                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500 text-right"
                />
                <span
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0 ${
                    dueAmount <= 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {dueAmount <= 0 ? 'Zero Due' : `Due: ৳${dueAmount.toFixed(0)}`}
                </span>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full h-8.5 rounded-xl bg-emerald-600 text-white font-bold text-xs tracking-wide shadow-xs hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Complete & Print Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default POSPage;
