import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetPharmacyInvoiceByIdQuery } from '../../store/api/invoiceApi';
import { useAppSelector } from '../../store/hooks';
import {
  ArrowLeft,
  Printer,
  ShoppingCart,
} from 'lucide-react';
import { printPharmacySlip } from '../../utils/printPharmacySlip';
import logoUrl from '../../assets/logo.png';

export const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pharmacy } = useAppSelector((state) => state.auth);

  const { data: response, isLoading } = useGetPharmacyInvoiceByIdQuery(id!, {
    skip: !id,
  });

  const invoice = response?.data;

  const handlePrint = () => {
    if (!invoice) return;
    printPharmacySlip(invoice, pharmacy);
  };

  const formattedDate = invoice?.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const grandTotalNum = parseFloat(String(invoice?.grandTotal || 0));
  const subtotalNum = parseFloat(String(invoice?.subtotal || grandTotalNum));
  const discountNum = parseFloat(String(invoice?.discountAmount || 0));
  const paidNum =
    invoice?.paidAmount !== undefined && invoice?.paidAmount !== ''
      ? parseFloat(String(invoice.paidAmount))
      : invoice?.status === 'Partial'
      ? Math.max(0, grandTotalNum / 2)
      : grandTotalNum;
  const dueNum =
    invoice?.dueAmount !== undefined
      ? parseFloat(String(invoice.dueAmount))
      : Math.max(0, grandTotalNum - paidNum);

  const paymentStatus = dueNum <= 0 ? 'PAID' : 'DUE / PARTIAL';
  const paymentMethod = invoice?.paymentMethod || 'Cash at Counter';
  const items = Array.isArray(invoice?.items) ? invoice.items : [];

  return (
    <div className="max-w-4xl mx-auto space-y-4 select-none font-sans text-xs pb-12">
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
            <span>Print Cash Memo / Slip</span>
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
        /* Printable Cash Memo Card matching Reference Design */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-4 print:border-none print:shadow-none print:p-0">
          {/* Brand Header */}
          <div className="flex items-start justify-between pb-3 border-b-2 border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Netro Hospital Logo"
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    Netro Adhunik Eye Hospital
                  </h1>
                  <p className="text-[10px] font-extrabold text-[#008A3D] tracking-wider uppercase mt-1">
                    RETAIL PHARMACY & DISPENSARY CASH MEMO
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {pharmacy?.address || 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh'}
              </p>
              <p className="text-[11px] text-slate-500">
                Hotline: {pharmacy?.phone || '+880 9610-000999'} | Outlet #{pharmacy?.id || '1001'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md inline-block mb-1">
                {invoice.invoiceNo}
              </div>
              <p className="text-[10px] text-slate-500">Date: {formattedDate}</p>
              <div>
                <span className="inline-block mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  ✓ {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Billing Details Card */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs">
            <div className="space-y-1.5 border-r border-slate-200 pr-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer ID:</span>
                <span className="font-mono font-bold text-[#008A3D]">{invoice.memberId || 'CUST-WALKIN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{invoice.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-mono font-semibold text-slate-900">{invoice.phone}</span>
              </div>
            </div>

            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Items:</span>
                <span className="font-bold text-slate-900">{items.length} Item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-semibold text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span className={`font-bold ${dueNum > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Medicine Items Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#008A3D] text-white font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3 text-center w-8">#</th>
                  <th className="py-2 px-3">Medicine & Dosage Description</th>
                  <th className="py-2 px-3 text-center w-16">Unit</th>
                  <th className="py-2 px-3 text-right w-20">Rate</th>
                  <th className="py-2 px-3 text-center w-12">Qty</th>
                  <th className="py-2 px-3 text-right w-16">Disc</th>
                  <th className="py-2 px-3 text-right w-24">Total (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, idx: number) => {
                  const unitPrice = parseFloat(String(item.unitPrice || 0));
                  const qty = parseInt(String(item.quantity || 1), 10) || 1;
                  const itemDisc = parseFloat(String(item.discountAmount || 0));
                  const itemTotal = parseFloat(
                    String(item.totalPrice || item.finalAmount || unitPrice * qty - itemDisc)
                  );
                  const unitLabel = item.unitType === 'strip' ? 'Strip' : 'Piece';

                  return (
                    <tr
                      key={idx}
                      className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                    >
                      <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.generic || ''}{item.category ? ` • ${item.category}` : ''}{item.batchNo ? ` • Batch: ${item.batchNo}` : ''}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-[10px] uppercase font-semibold text-slate-600">
                        {unitLabel}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ৳{unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{qty}</td>
                      <td className="py-2 px-3 text-right text-emerald-800 font-semibold font-mono">
                        {itemDisc > 0 ? `-৳${itemDisc.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">
                        ৳{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Ledger Totals */}
            <div className="bg-slate-50/80 p-3.5 border-t border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross Amount:</span>
                <span className="font-mono font-bold text-slate-900">৳{subtotalNum.toFixed(2)}</span>
              </div>
              {discountNum > 0 && (
                <div className="flex justify-between text-[#008A3D] font-semibold">
                  <span>Special Pharmacy Discount:</span>
                  <span className="font-mono">-৳{discountNum.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-slate-300 font-black text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-[#008A3D]">৳{grandTotalNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-slate-700 font-semibold">
                <span>Paid Amount ({paymentMethod}):</span>
                <span className="font-mono text-emerald-800 font-bold">৳{paidNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 font-bold">
                <span>Remaining Balance Due:</span>
                <span className={`font-mono font-bold ${dueNum > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  ৳{dueNum.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
            <div>
              <div className="w-40 border-b border-slate-500 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Dispenser / Pharmacist / Cashier</p>
              <p className="text-[10px] text-slate-400">
                {pharmacy?.name || 'Netro Adhunik Eye Hospital Pharmacy'}
              </p>
            </div>
            <div>
              <div className="w-40 border-b border-slate-500 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Customer / Attendant Signature</p>
              <p className="text-[10px] text-slate-400">Verified & Received</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-slate-400 pt-3">
            Please preserve this cash memo for exchange or returns within 7 days with intact blister/packaging. For emergency inquiries or medicine guidance, contact +880 9610-000999.
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;
