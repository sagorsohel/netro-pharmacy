import React, { useState } from 'react';
import { Trash2, ShoppingCart, Send, User, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart,
  removeFromCart,
  setCustomerInfo,
  checkout,
} from '../store/slices/posSlice';
import { deductStock } from '../store/slices/inventorySlice';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface PosCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleSuccess: (msg: string) => void;
}

export const PosCounterModal: React.FC<PosCounterModalProps> = ({
  isOpen,
  onClose,
  onSaleSuccess,
}) => {
  const dispatch = useAppDispatch();
  const medicines = useAppSelector((state) => state.inventory.medicines);
  const { cart, customerName, customerPhone, isMember, memberId, hasPrescription } =
    useAppSelector((state) => state.pos);

  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [unitType, setUnitType] = useState<'piece' | 'strip' | 'carton'>('strip');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const currentMed = medicines.find((m) => m.id === selectedMedId) || medicines[0];

  const getUnitPrice = () => {
    if (!currentMed) return 0;
    if (unitType === 'piece') return currentMed.unitSellingPrice;
    if (unitType === 'strip') return currentMed.stripSellingPrice;
    if (unitType === 'carton') {
      return (
        currentMed.stripSellingPrice * currentMed.packetPerCarton
      );
    }
    return currentMed.unitSellingPrice;
  };

  const handleAddItem = () => {
    if (!currentMed) return;
    dispatch(
      addToCart({
        medicineId: currentMed.id,
        name: currentMed.name,
        unitType,
        unitPrice: getUnitPrice(),
        quantity,
      })
    );
    setQuantity(1);
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const discountAmount = isMember ? +(subtotal * 0.1).toFixed(2) : 0;
  const grandTotal = +(subtotal - discountAmount).toFixed(2);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি ওষুধ কার্টে যুক্ত করুন!');
      return;
    }

    // Deduct stock for each item in cart
    cart.forEach((item) => {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) return;

      let pieces = item.quantity;
      if (item.unitType === 'strip') {
        pieces = item.quantity * med.piecePerPacket;
      } else if (item.unitType === 'carton') {
        pieces = item.quantity * med.packetPerCarton * med.piecePerPacket;
      }

      dispatch(deductStock({ medicineId: item.medicineId, piecesToDeduct: pieces }));
    });

    dispatch(checkout());
    onClose();
    onSaleSuccess(
      `বিক্রি সফল! ৳ ${grandTotal} বিল তৈরি হয়েছে এবং কাস্টমারের WhatsApp-এ PDF পাঠানো হয়েছে।`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                পয়েন্ট অব সেল (POS) কাউন্টার বিলিং
              </h3>
              <p className="text-xs text-slate-500">
                ওষুধ নির্বাচন, মাল্টি-ইউনিট প্রাইসিং এবং স্বয়ংক্রিয় WhatsApp PDF ইনভয়েসিং।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Customer Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-400" /> কাস্টমার নাম
            </label>
            <Input
              value={customerName}
              onChange={(e) => dispatch(setCustomerInfo({ customerName: e.target.value }))}
              placeholder="e.g. জনাব আহমেদ"
              className="h-9 bg-white text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" /> মোবাইল (WhatsApp ইনভয়েসের জন্য)
            </label>
            <Input
              value={customerPhone}
              onChange={(e) => dispatch(setCustomerInfo({ customerPhone: e.target.value }))}
              placeholder="+8801XXXXXXXXX"
              className="h-9 bg-white text-xs rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> মেম্বার আইডি (১০% অটো ছাড়)
            </label>
            <div className="flex gap-2">
              <Input
                value={memberId}
                onChange={(e) => {
                  const val = e.target.value;
                  dispatch(setCustomerInfo({ memberId: val, isMember: val.trim().length > 0 }));
                }}
                placeholder="e.g. MEM-772"
                className="h-9 bg-white text-xs rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Medicine Picker & Multi-Unit Selector */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            ওষুধ যোগ করুন
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="text-xs text-slate-600 block mb-1 font-medium">মেডিসিন বাছাই</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.totalPieces} pcs স্টকে আছে)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs text-slate-600 block mb-1 font-medium">বিক্রয় ইউনিট</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary"
              >
                <option value="strip">পাতা / স্ট্রিপ (৳ {currentMed?.stripSellingPrice})</option>
                <option value="piece">খুচরা পিস (৳ {currentMed?.unitSellingPrice})</option>
                <option value="carton">কার্টুন (৳ {currentMed ? currentMed.stripSellingPrice * currentMed.packetPerCarton : 0})</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-600 block mb-1 font-medium">পরিমাণ</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                onClick={handleAddItem}
                className="w-full h-9 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                কার্টে যোগ
              </Button>
            </div>
          </div>
        </div>

        {/* Section 3: Cart Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">মেডিসিন</th>
                <th className="py-2.5 px-4">ইউনিট</th>
                <th className="py-2.5 px-4">একক দাম</th>
                <th className="py-2.5 px-4">পরিমাণ</th>
                <th className="py-2.5 px-4">মোট</th>
                <th className="py-2.5 px-4 text-center">রিমুভ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    কার্টে কোনো ওষুধ যুক্ত করা হয়নি। উপরের ড্রপডাউন থেকে সিলেক্ট করুন।
                  </td>
                </tr>
              ) : (
                cart.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item.unitType === 'strip' ? 'পাতা' : item.unitType === 'piece' ? 'পিস' : 'কার্টুন'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">৳ {item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-4 font-black text-slate-900">৳ {item.totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => dispatch(removeFromCart(idx))}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: Checkout Total & Prescription Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={hasPrescription}
              onChange={(e) => dispatch(setCustomerInfo({ hasPrescription: e.target.checked }))}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>প্রেসক্রিপশন দেখে ওষুধ বিক্রি করা হয়েছে</span>
          </label>

          <div className="text-right space-y-1">
            <div className="text-xs text-slate-500">
              সাবটোটাল: <span className="font-semibold text-slate-800">৳ {subtotal.toFixed(2)}</span>
            </div>
            {isMember && (
              <div className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                <Sparkles className="h-3 w-3" /> মেম্বারশিপ ছাড় (১০%): -৳ {discountAmount.toFixed(2)}
              </div>
            )}
            <div className="text-base font-black text-slate-900">
              সর্বমোট বিল: <span className="text-primary text-xl">৳ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs h-10 px-5 cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            onClick={handleCompleteSale}
            className="rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 px-6 gap-2 shadow-lg shadow-primary/25 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>বিল সম্পন্ন ও WhatsApp-এ ইনভয়েস পাঠান</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
