import React from 'react';
import { Sparkles, Plus, CalendarClock, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilterStatus } from '../store/slices/inventorySlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface InventoryTableProps {
  onOpenStockIn: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ onOpenStockIn }) => {
  const dispatch = useAppDispatch();
  const { medicines, searchQuery, filterStatus } = useAppSelector(
    (state) => state.inventory
  );

  const filtered = medicines.filter((m) => {
    // Search
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'low-stock') {
      return m.totalPieces <= m.minThresholdPieces;
    }

    if (filterStatus === 'near-expiry') {
      const exp = new Date(m.expiryDate).getTime();
      const now = new Date('2026-10-27').getTime();
      return (exp - now) / (1000 * 3600 * 24) <= 60;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-primary border border-primary/20 mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Section 3.1 Multi-Unit Stock & FEFO Expiry</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            মাল্টি-ইউনিট ইনভেন্টরি স্টক (কার্টুন ➔ প্যাকেট/পাতা ➔ পিস)
          </h3>
          <p className="text-xs text-slate-500">
            সিস্টেমে একই ওষুধ স্বয়ংক্রিয়ভাবে কার্টুন, প্যাকেট ও পিস ইউনিটে হিসাব রাখে এবং বিক্রি অনুযায়ী কনভার্ট করে।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => dispatch(setFilterStatus('all'))}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              সব ({medicines.length})
            </button>
            <button
              onClick={() => dispatch(setFilterStatus('low-stock'))}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'low-stock'
                  ? 'bg-white text-red-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              লো-স্টক
            </button>
            <button
              onClick={() => dispatch(setFilterStatus('near-expiry'))}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'near-expiry'
                  ? 'bg-white text-amber-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              FEFO মেয়াদ
            </button>
          </div>

          <Button
            onClick={onOpenStockIn}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>স্টক-ইন এন্ট্রি</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-6">ওষুধ ও জেনেরিক নাম</th>
              <th className="py-3.5 px-6">ব্যাচ ও মেয়াদ (FEFO)</th>
              <th className="py-3.5 px-6">কার্টুন সংখ্যা</th>
              <th className="py-3.5 px-6">প্যাকেট / পাতা</th>
              <th className="py-3.5 px-6">মোট পিস (Live Stock)</th>
              <th className="py-3.5 px-6">বিক্রয় মূল্য / পিস</th>
              <th className="py-3.5 px-6">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const isLow = item.totalPieces <= item.minThresholdPieces;
              const exp = new Date(item.expiryDate).getTime();
              const now = new Date('2026-10-27').getTime();
              const isNearExpiry = (exp - now) / (1000 * 3600 * 24) <= 60;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.generic} • <span className="text-slate-400">{item.category}</span></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-slate-800 font-medium">{item.batchNo}</div>
                    <div className={`text-[11px] flex items-center gap-1 ${isNearExpiry ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                      <CalendarClock className="h-3 w-3" /> {item.expiryDate}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.cartonQty} কার্টুন
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900">
                      {item.cartonQty * item.packetPerCarton} প্যাকেট
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({item.packetPerCarton} প্যাকেট/কার্টুন)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`font-black text-sm ${isLow ? 'text-red-600' : 'text-primary'}`}>
                      {item.totalPieces.toLocaleString()} পিস
                    </div>
                    <span className="text-[10px] text-slate-400">
                      (স্বয়ংক্রিয় কনভার্সন)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900">৳ {item.unitSellingPrice.toFixed(2)} / পিস</div>
                    <div className="text-[10px] text-slate-500">৳ {item.stripSellingPrice.toFixed(2)} / পাতা</div>
                  </td>
                  <td className="py-4 px-6">
                    {isLow ? (
                      <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" /> লো-স্টক এলার্ট
                      </Badge>
                    ) : isNearExpiry ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold flex items-center gap-1 w-fit">
                        <CalendarClock className="h-3 w-3" /> FEFO মেয়াদোত্তীর্ণ
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold w-fit">
                        পর্যাপ্ত স্টক
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
