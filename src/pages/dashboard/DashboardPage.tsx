import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useGetMedicinesQuery } from '../../store/api/medicineApi';
import { useGetPharmacyInvoicesQuery } from '../../store/api/invoiceApi';
import { useGetPharmacyStaffQuery } from '../../store/api/staffApi';
import {
  Pill,
  ShoppingCart,
  PlusCircle,
  Receipt,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, pharmacy } = useAppSelector((state) => state.auth);
  const pharmacyId = pharmacy?.id || 1001;

  const { data: medicinesRes } = useGetMedicinesQuery();
  const { data: lowStockRes } = useGetMedicinesQuery({ lowStock: true });
  const { data: invoicesRes } = useGetPharmacyInvoicesQuery({ limit: 6 });
  const { data: staffRes } = useGetPharmacyStaffQuery(
    { pharmacyId },
    { skip: !pharmacyId }
  );

  const totalMedicines = medicinesRes?.pagination?.total || 0;
  const lowStockCount = lowStockRes?.pagination?.total || 0;
  const totalInvoices = invoicesRes?.pagination?.total || 0;
  const totalStaff = staffRes?.pagination?.total || 1;

  const recentInvoices = invoicesRes?.data || [];
  const lowStockItems = lowStockRes?.data || [];

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      {/* 1. Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xs mb-2 text-emerald-200">
            <Pill className="h-3.5 w-3.5" />
            <span>Branch #{pharmacyId} Operational</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Pharmacist'}!
          </h2>
          <p className="text-emerald-100 text-xs mt-1 max-w-xl">
            {pharmacy?.name || 'Netro Care Pharmacy'} • Multi-Unit Inventory, Counter POS Billing & Fast Expiry Tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            className="h-10 px-4 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Open POS Counter</span>
          </Link>
          <Link
            to="/inventory/stock-in"
            className="h-10 px-4 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Stock-In</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Medicines
            </div>
            <div className="text-2xl font-black text-dark mt-0.5">{totalMedicines}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active catalog items</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Pill className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Low Stock Alerts
            </div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{lowStockCount}</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Below reorder threshold</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Total Invoices
            </div>
            <div className="text-2xl font-black text-dark mt-0.5">{totalInvoices}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Counter POS transactions</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Branch Staff
            </div>
            <div className="text-2xl font-black text-dark mt-0.5">{totalStaff}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Assigned to this branch</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Columns: Recent Invoices */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-dark">Recent Sales & Invoices</h3>
            </div>
            <Link
              to="/invoices"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Invoices</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              No recent counter sales recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">
                  <tr>
                    <th className="py-2">Invoice #</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Items</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-emerald-700">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-2.5 font-medium text-dark">
                        {inv.customerName}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {inv.items?.length || 1} items
                      </td>
                      <td className="py-2.5 text-right font-bold text-dark">
                        ৳{Number(inv.grandTotal).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          View Slip
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-dark">Low Stock Watchlist</h3>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Stock</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-10 text-center space-y-2 text-slate-400">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-600">Stock Levels Healthy</p>
              <p className="text-[11px]">All items are currently above minimum threshold.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.slice(0, 5).map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-dark text-xs">{med.name}</h5>
                    <p className="text-[11px] text-slate-400">{med.generic}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-700">
                      {med.totalPieces} pcs
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Min: {med.minThresholdPieces}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
