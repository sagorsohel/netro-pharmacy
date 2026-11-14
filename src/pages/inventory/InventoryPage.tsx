import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetMedicinesQuery,
  useDeleteMedicineMutation,
} from '../../store/api/medicineApi';
import {
  Pill,
  Search,
  PlusCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data: response, isLoading } = useGetMedicinesQuery({
    search: search.trim() || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    lowStock: lowStockOnly ? true : undefined,
  });

  const [deleteMedicine] = useDeleteMedicineMutation();
  const medicines = response?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from inventory?`)) return;
    try {
      await deleteMedicine(id).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete medicine.');
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-dark flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600" />
              <span>Medicine Inventory & Stock</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {medicines.length} Items Listed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-unit packaging (Cartons ➔ Strips ➔ Pieces), FEFO expiry tracking, and threshold alerts.
          </p>
        </div>

        <Link
          to="/inventory/stock-in"
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Stock-In New Medicine</span>
        </Link>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, generic name, batch or supplier..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Formats / Dosage</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Drop">Drop / Eyedrop</option>
            <option value="Ointment">Ointment / Cream</option>
            <option value="Saline">Saline / Infusion</option>
          </select>

          {/* Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              lowStockOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* 3. Medicines Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading stock inventory...</div>
        ) : medicines.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Pill className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-dark text-sm">No medicines found</p>
            <p className="text-slate-400 text-xs">
              Click "Stock-In New Medicine" above to record a new medicine batch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Medicine & Generic</th>
                  <th className="py-3 px-4">Packaging Breakdown</th>
                  <th className="py-3 px-4 text-center">Total Pieces</th>
                  <th className="py-3 px-4">Selling Prices</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med) => {
                  const isLowStock = med.totalPieces <= med.minThresholdPieces;
                  const isOut = med.totalPieces <= 0;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Generic */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-dark text-xs">{med.name}</div>
                        <div className="text-[11px] text-slate-400">{med.generic}</div>
                        <span className="text-[9px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 mt-1 inline-block">
                          {med.category}
                        </span>
                      </td>

                      {/* Multi-unit breakdown */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div>
                          <span className="font-bold text-dark">{med.cartonQty}</span> Cartons
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {med.packetPerCarton} pkts/ctn • {med.piecePerPacket} pcs/pkt
                        </div>
                      </td>

                      {/* Total Pieces In Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl font-mono ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {Number(med.totalPieces).toLocaleString()} pcs
                        </span>
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-dark text-xs">
                          ৳{Number(med.unitSellingPrice).toFixed(1)}{' '}
                          <span className="text-[10px] font-normal text-slate-400">/pc</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ৳{Number(med.stripSellingPrice).toFixed(1)}{' '}
                          <span className="text-[9px] text-slate-400">/strip</span>
                        </div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3 px-4 text-[11px]">
                        <div className="font-mono text-slate-700 font-semibold">{med.batchNo}</div>
                        <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-slate-300" />
                          <span>Exp: {med.expiryDate}</span>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/inventory/edit/${med.id}`}
                            title="Edit Stock & Pricing"
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(med.id, med.name)}
                            title="Remove Medicine"
                            className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
