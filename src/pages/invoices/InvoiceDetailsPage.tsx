import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetPharmacyInvoiceByIdQuery } from '../../store/api/invoiceApi';
import { useAppSelector } from '../../store/hooks';
import {
  ArrowLeft,
  Printer,
  ShoppingCart,
  Store,
} from 'lucide-react';

export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pharmacy } = useAppSelector((state) => state.auth);

  const { data: response, isLoading } = useGetPharmacyInvoiceByIdQuery(id!, {
    skip: !id,
  });

  const invoice = response?.data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans text-xs pb-12">
      {/* Top Header & Actions (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Invoices List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
          <Link
            to="/pos"
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/25 transition-colors cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-3xl p-8 border border-slate-100">
          Loading invoice details...
        </div>
      ) : !invoice ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-3xl p-8 border border-slate-100">
          Invoice not found.
        </div>
      ) : (
        /* Printable Receipt Card */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Outlet Header */}
          <div className="text-center space-y-1.5 pb-6 border-b border-dashed border-slate-200">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-1 ring-emerald-500/20">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-dark tracking-tight">
              {pharmacy?.name || 'Netro Care Pharmacy'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {pharmacy?.address || 'Hospital Retail Pharmacy Branch'}
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-mono">
              <span>Phone: {pharmacy?.phone || '01711000001'}</span>
              <span>•</span>
              <span>Branch #{pharmacy?.id || '1001'}</span>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs py-2">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Invoice Information</div>
              <div className="font-mono font-black text-dark text-sm mt-0.5">
                {invoice.invoiceNo}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Date: {new Date(invoice.createdAt).toLocaleString('en-GB')}
              </div>
              <div className="inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                Payment: {invoice.status || 'PAID'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Customer Details</div>
              <div className="font-bold text-dark text-xs mt-0.5">{invoice.customerName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{invoice.phone}</div>
              {invoice.hasPrescription && (
                <div className="text-[10px] font-semibold text-emerald-700 mt-1">
                  ✓ Doctor Prescription Attached
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-t border-b border-slate-200">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {invoice.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-dark">{item.name}</td>
                    <td className="py-2.5 px-3 text-center uppercase text-[10px] text-slate-500">
                      {item.unitType || 'Pcs'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-dark">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ৳{Number(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-dark">
                      ৳{Number(item.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Amount</span>
                <span className="font-mono font-bold">৳{Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              {Number(invoice.discountAmount) > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount ({invoice.discountPercentage || 0}%)</span>
                  <span className="font-mono font-bold">
                    -৳{Number(invoice.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-black text-dark pt-2 border-t border-slate-200">
                <span>Net Payable (Paid)</span>
                <span className="font-mono text-emerald-800 text-base">
                  ৳{Number(invoice.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Receipt Footer */}
          <div className="pt-6 border-t border-dashed border-slate-200 text-center space-y-1 text-slate-400 text-[10px]">
            <p className="font-semibold text-slate-600">Thank you for choosing Netro Care Pharmacy!</p>
            <p>Please preserve this invoice copy for any medicine return or exchange within 7 days.</p>
            <div className="pt-2 font-mono text-[9px] tracking-widest text-slate-300">
              * * * POS SYSTEM GENERATED BILL * * *
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;
