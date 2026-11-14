import logoUrl from '../assets/logo.png';

export interface PrintPharmacyInvoiceData {
  id?: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  memberId?: string | null;
  subtotal: number | string;
  discountAmount?: number | string;
  discountPercentage?: number | string;
  grandTotal: number | string;
  paidAmount?: number | string | null;
  dueAmount?: number | string | null;
  status?: string;
  paymentMethod?: string | null;
  createdAt?: string | Date;
  items: Array<{
    name: string;
    generic?: string;
    category?: string;
    unitType?: string;
    unitPrice: number | string;
    quantity: number | string;
    discountAmount?: number | string;
    totalPrice?: number | string;
    finalAmount?: number | string;
    batchNo?: string;
  }>;
}

export interface PharmacyInfo {
  id?: number;
  name?: string;
  address?: string;
  phone?: string;
  email?: string | null;
}

export const printPharmacySlip = (
  invoice: PrintPharmacyInvoiceData,
  pharmacy?: PharmacyInfo | null
) => {
  if (!invoice) return;

  // Create an isolated hidden iframe for 100% reliable, pristine print preview
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const grandTotalNum = parseFloat(String(invoice.grandTotal || 0));
  const subtotalNum = parseFloat(String(invoice.subtotal || grandTotalNum));
  const discountNum = parseFloat(String(invoice.discountAmount || 0));
  const paidNum =
    invoice.paidAmount !== undefined && invoice.paidAmount !== ''
      ? parseFloat(String(invoice.paidAmount))
      : invoice.status === 'Partial'
      ? Math.max(0, grandTotalNum / 2)
      : grandTotalNum;
  const dueNum =
    invoice.dueAmount !== undefined
      ? parseFloat(String(invoice.dueAmount))
      : Math.max(0, grandTotalNum - paidNum);

  const paymentStatus = dueNum <= 0 ? 'PAID' : 'DUE / PARTIAL';
  const paymentMethod = invoice.paymentMethod || 'Cash at Counter';

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const itemRowsHtml = items
    .map((item, idx) => {
      const unitPrice = parseFloat(String(item.unitPrice || 0));
      const qty = parseInt(String(item.quantity || 1), 10) || 1;
      const itemDisc = parseFloat(String(item.discountAmount || 0));
      const itemTotal = parseFloat(
        String(item.totalPrice || item.finalAmount || unitPrice * qty - itemDisc)
      );
      const unitLabel = item.unitType
        ? item.unitType === 'strip'
          ? 'Strip'
          : 'Piece'
        : 'Piece';

      return `
      <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
        <td style="padding: 7px 8px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; text-align: center;">
          ${idx + 1}
        </td>
        <td style="padding: 7px 10px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
          ${item.name}
          <span style="font-size: 9.5px; font-weight: 500; color: #64748b; display: block; margin-top: 1px;">
            ${item.generic || ''}${item.category ? ` • ${item.category}` : ''}${item.batchNo ? ` • Batch: ${item.batchNo}` : ''}
          </span>
        </td>
        <td style="padding: 7px 8px; text-align: center; color: #475569; border-bottom: 1px solid #f1f5f9; font-size: 10px; text-transform: uppercase;">
          ${unitLabel}
        </td>
        <td style="padding: 7px 8px; text-align: right; color: #475569; border-bottom: 1px solid #f1f5f9; font-family: monospace;">
          ৳${unitPrice.toFixed(2)}
        </td>
        <td style="padding: 7px 8px; text-align: center; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
          ${qty}
        </td>
        <td style="padding: 7px 8px; text-align: right; color: #166534; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
          ${itemDisc > 0 ? `-৳${itemDisc.toFixed(2)}` : '—'}
        </td>
        <td style="padding: 7px 10px; text-align: right; font-weight: 800; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-family: monospace;">
          ৳${itemTotal.toFixed(2)}
        </td>
      </tr>`;
    })
    .join('');

  const hospitalName = 'Netro Adhunik Eye Hospital';
  const subtitle = 'RETAIL PHARMACY & DISPENSARY CASH MEMO';
  const outletAddress = pharmacy?.address || 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh';
  const hotline = `Hotline: ${pharmacy?.phone || '+880 9610-000999'} | Outlet #${pharmacy?.id || '1001'}`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cash Memo - ${invoice.invoiceNo}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 14mm 10mm 14mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 0;
            font-size: 11.5px;
            line-height: 1.35;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 12px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #e2e8f0;
          }
          .hospital-title {
            font-size: 19px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }
          .hospital-subtitle {
            font-size: 9.5px;
            font-weight: 800;
            color: #008A3D;
            letter-spacing: 0.05em;
            margin-top: 2px;
          }
          .address-info {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
            line-height: 1.3;
          }
          .voucher-badge {
            text-align: right;
          }
          .badge-no {
            background: #0f172a;
            color: #ffffff;
            font-family: monospace;
            font-size: 12px;
            font-weight: 800;
            padding: 3px 9px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 3px;
          }
          .badge-status {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
            margin-top: 3px;
          }
          .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 12px;
            font-size: 11px;
          }
          .info-col {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .info-col:first-child {
            border-right: 1px solid #e2e8f0;
            padding-right: 12px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .info-label {
            color: #64748b;
            font-weight: 500;
          }
          .info-val {
            font-weight: 700;
            color: #0f172a;
          }
          .info-val.patient-id {
            color: #008A3D;
            font-family: monospace;
            font-weight: 800;
          }
          .table-container {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th {
            background: #008A3D !important;
            color: #ffffff !important;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            padding: 8px 10px;
            text-align: left;
          }
          td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
          }
          .ledger-summary {
            background: #f8fafc;
            padding: 9px 14px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ledger-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #475569;
          }
          .grand-total-row {
            border-top: 1px solid #cbd5e1;
            padding-top: 5px;
            margin-top: 2px;
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
          }
          .grand-total-val {
            color: #008A3D;
            font-size: 16px;
            font-weight: 900;
            font-family: monospace;
          }
          .due-row {
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            font-weight: 800;
          }
          .due-val {
            color: #e11d48;
            font-weight: 900;
            font-family: monospace;
          }
          .paid-val {
            color: #166534;
            font-weight: 800;
            font-family: monospace;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 28px;
            padding-top: 14px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            font-size: 10.5px;
          }
          .signature-line {
            width: 150px;
            margin: 0 auto 3px auto;
            border-bottom: 1px solid #64748b;
          }
          .signature-title {
            font-weight: 700;
            color: #334155;
          }
          .signature-sub {
            font-size: 9px;
            color: #94a3b8;
          }
          .disclaimer {
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
            margin-top: 12px;
          }
        </style>
      </head>
      <body>
        <!-- Brand Header -->
        <div class="header">
          <div>
            <div class="brand">
              <img src="${logoUrl}" alt="Netro Hospital Logo" class="brand-logo" />
              <div>
                <h1 class="hospital-title">${hospitalName}</h1>
                <p class="hospital-subtitle">${subtitle}</p>
              </div>
            </div>
            <p class="address-info">${outletAddress}</p>
            <p class="address-info">${hotline}</p>
          </div>
          <div class="voucher-badge">
            <div class="badge-no">${invoice.invoiceNo}</div>
            <p style="font-size: 10px; color: #64748b; margin-top: 2px;">Date: ${formattedDate}</p>
            <div><span class="badge-status">✓ ${paymentStatus}</span></div>
          </div>
        </div>

        <!-- Customer & Billing Details -->
        <div class="grid-info">
          <div class="info-col">
            <div class="info-row">
              <span class="info-label">Customer ID:</span>
              <span class="info-val patient-id">${invoice.memberId || 'CUST-WALKIN'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer Name:</span>
              <span class="info-val">${invoice.customerName || 'Walk-in Customer'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact Phone:</span>
              <span class="info-val">${invoice.phone || '01700000000'}</span>
            </div>
          </div>

          <div class="info-col" style="padding-left: 12px;">
            <div class="info-row">
              <span class="info-label">Total Items:</span>
              <span class="info-val">${items.length} Item(s)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-val">${paymentMethod}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Status:</span>
              <span class="info-val" style="color: ${dueNum > 0 ? '#e11d48' : '#166534'};">${paymentStatus}</span>
            </div>
          </div>
        </div>

        <!-- Medicine Items Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 32px; text-align: center;">#</th>
                <th>Medicine & Dosage Description</th>
                <th style="text-align: center; width: 60px;">Unit</th>
                <th style="text-align: right; width: 75px;">Rate</th>
                <th style="text-align: center; width: 45px;">Qty</th>
                <th style="text-align: right; width: 65px;">Disc</th>
                <th style="text-align: right; width: 85px;">Total (BDT)</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <!-- Ledger Totals -->
          <div class="ledger-summary">
            <div class="ledger-row">
              <span>Subtotal Gross Amount:</span>
              <span style="font-weight: 700; color: #1e293b; font-family: monospace;">৳${subtotalNum.toFixed(2)}</span>
            </div>
            ${
              discountNum > 0
                ? `<div class="ledger-row" style="color: #008A3D; font-weight: 600;">
                     <span>Special Pharmacy Discount:</span>
                     <span style="font-family: monospace;">-৳${discountNum.toFixed(2)}</span>
                   </div>`
                : ''
            }
            <div class="ledger-row grand-total-row">
              <span>Grand Total:</span>
              <span class="grand-total-val">৳${grandTotalNum.toFixed(2)}</span>
            </div>
            <div class="ledger-row" style="padding-top: 3px;">
              <span>Paid Amount (${paymentMethod}):</span>
              <span class="paid-val">৳${paidNum.toFixed(2)}</span>
            </div>
            <div class="ledger-row due-row">
              <span>Remaining Balance Due:</span>
              <span class="${dueNum > 0 ? 'due-val' : 'paid-val'}">৳${dueNum.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="signatures">
          <div>
            <div class="signature-line"></div>
            <p class="signature-title">Dispenser / Pharmacist / Cashier</p>
            <p class="signature-sub">${pharmacy?.name || 'Netro Adhunik Eye Hospital Pharmacy'}</p>
          </div>
          <div>
            <div class="signature-line"></div>
            <p class="signature-title">Customer / Attendant Signature</p>
            <p class="signature-sub">Verified & Received</p>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="disclaimer">
          Please preserve this cash memo for exchange or returns within 7 days with intact blister/packaging. For emergency inquiries or medicine guidance, contact +880 9610-000999.
        </p>
      </body>
    </html>
  `);
  doc.close();

  // Print with default margins & timing
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1200);
  }, 300);
};
