import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetPharmacyInvoicesQuery } from '../../store/api/invoiceApi';
import {
  Receipt,
  Search,
  ShoppingCart,
  Phone,
  Eye,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: response, isLoading } = useGetPharmacyInvoicesQuery({
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const invoices = response?.data || [];

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-dark flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              <span>Sales & Counter Invoices</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {invoices.length} Invoices Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit sales receipts, digital WhatsApp / SMS slips, member discounts, and payment methods.
          </p>
        </div>

        <Link
          to="/pos"
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>New POS Sale</span>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, customer name or phone..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'Paid', 'Due'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Payments' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Invoices List Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Receipt className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-dark text-sm">No sales invoices found</p>
            <p className="text-slate-400 text-xs">
              Open the POS counter to create your first sales transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4 text-center">Items Sold</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Digital Slip</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Invoice # */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {inv.invoiceNo}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(inv.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-dark">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{inv.phone}</span>
                      </div>
                    </td>

                    {/* Items Sold */}
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {inv.items?.length || 1} items
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      ৳{Number(inv.subtotal).toFixed(2)}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-4 text-right font-mono font-black text-dark text-xs">
                      ৳{Number(inv.grandTotal).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.status || 'Paid'}
                      </span>
                    </td>

                    {/* Digital Slip Status */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {inv.whatsappSent && (
                          <span
                            title="WhatsApp Bill Sent"
                            className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200"
                          >
                            WA
                          </span>
                        )}
                        {inv.smsSent && (
                          <span
                            title="SMS Bill Sent"
                            className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-200"
                          >
                            SMS
                          </span>
                        )}
                        {!inv.whatsappSent && !inv.smsSent && (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Slip</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
