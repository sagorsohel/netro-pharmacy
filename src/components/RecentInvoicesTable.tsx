import React, { useState } from 'react';
import { Tag, Plus, Send, MessageSquare, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { markWhatsAppSent, markSmsSent } from '../store/slices/posSlice';
import { Button } from './ui/button';

interface RecentInvoicesTableProps {
  onOpenPos: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({ onOpenPos }) => {
  const dispatch = useAppDispatch();
  const invoices = useAppSelector((state) => state.pos.invoices);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendWhatsApp = (invId: string, phone: string, invoiceNo: string) => {
    dispatch(markWhatsAppSent(invId));
    showToast(`WhatsApp ডিজিটাল PDF ইনভয়েস পাঠানো হয়েছে: ${phone} (${invoiceNo})`);
  };

  const handleSendSms = (invId: string, phone: string, invoiceNo: string) => {
    dispatch(markSmsSent(invId));
    showToast(`SMS বিল সামারি সফলভাবে পাঠানো হয়েছে: ${phone} (${invoiceNo})`);
  };

  const handlePrint = (invoiceNo: string) => {
    showToast(`রসিদ প্রিন্টারে পাঠানো হয়েছে: ${invoiceNo}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-secondary border border-secondary/20 mb-1">
            <Tag className="h-3 w-3" />
            <span>Section 3.2 Counter Billing & Messaging</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            কাউন্টার POS বিক্রয় ও ডিজিটাল ইনভয়েস হিস্ট্রি
          </h3>
          <p className="text-xs text-slate-500">
            প্রতিটি বিক্রির পর সরাসরি কাস্টমারের WhatsApp-এ PDF ইনভয়েস অথবা SMS বিল সামারি পাঠানোর সুবিধা।
          </p>
        </div>
        <Button
          onClick={onOpenPos}
          className="bg-secondary hover:bg-secondary-hover text-white text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>নতুন কাউন্টার সেলস (POS)</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-6">ইনভয়েস নং</th>
              <th className="py-3.5 px-6">কাস্টমার ও মোবাইল</th>
              <th className="py-3.5 px-6">মেম্বারশিপ</th>
              <th className="py-3.5 px-6">প্রেসক্রিপশন</th>
              <th className="py-3.5 px-6">আইটেম ও ডিসকাউন্ট</th>
              <th className="py-3.5 px-6">মোট বিল</th>
              <th className="py-3.5 px-6 text-center">ডিজিটাল ডেলিভারি অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">
                  {sale.invoiceNo}
                  <div className="text-[10px] font-normal text-slate-400">{sale.createdAt}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900">{sale.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{sale.phone}</div>
                </td>
                <td className="py-4 px-6">
                  {sale.isMember ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="h-3 w-3" />
                      {sale.memberId} (১০% ছাড়)
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">সাধারণ গ্রাহক</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {sale.hasPrescription ? (
                    <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      সংযুক্ত আছে
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">ওটিসি / নেই</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-800">
                    {sale.items.length} টি মেডিসিন
                  </div>
                  {sale.discountAmount > 0 && (
                    <div className="text-[11px] text-emerald-600 font-medium">
                      -৳ {sale.discountAmount} ছাড় ({sale.discountPercentage}%)
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="font-black text-sm text-slate-900">৳ {sale.grandTotal}</div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {sale.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        handleSendWhatsApp(sale.id, sale.phone, sale.invoiceNo)
                      }
                      title="কাস্টমারের হোয়াটসঅ্যাপে PDF ইনভয়েস পাঠান"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Send className="h-3.5 w-3.5 text-primary" />
                      <span>WhatsApp PDF</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSendSms(sale.id, sale.phone, sale.invoiceNo)
                      }
                      title="SMS বিল সামারি পাঠান"
                      className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-secondary" />
                      <span>SMS</span>
                    </button>
                    <button
                      onClick={() => handlePrint(sale.invoiceNo)}
                      title="থার্মাল রসিদ প্রিন্ট করুন"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
