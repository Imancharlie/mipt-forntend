import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type ReceiptKind = 'image' | 'text';

export const BillingPage: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToastContext();
  const [balance, setBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptKind, setReceiptKind] = useState<ReceiptKind>('image');
  const [receiptText, setReceiptText] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const payNumber = '+255 712 345 678';
  const whatsappNumber = '+255 712 345 678';

  useEffect(() => {
    // Minimal fetch; if it fails, show placeholder
    const run = async () => {
      try {
        const resp = await fetch('/api/billing/balance/');
        if (!resp.ok) throw new Error('failed');
        const data = await resp.json();
        setBalance(Number(data?.balance ?? 0));
      } catch {
        setBalance(0);
      }
    };
    run();
  }, []);

  const submitReceipt = async () => {
    try {
      setIsSubmitting(true);
      const online = navigator.onLine;
      const formData = new FormData();
      formData.append('kind', receiptKind);
      if (receiptKind === 'image' && receiptFile) formData.append('file', receiptFile);
      if (receiptKind === 'text' && receiptText.trim()) formData.append('text', receiptText.trim());

      if (!online) {
        // Queue offline
        const payload: any = {
          url: '/api/billing/receipts/',
          method: 'POST',
          body: { kind: receiptKind, text: receiptText },
          file: receiptKind === 'image' ? { name: receiptFile?.name, type: receiptFile?.type, size: receiptFile?.size } : undefined,
        };
        (window as any).__miptQueue?.add?.(payload);
        showInfo('Offline: receipt queued. It will be sent automatically when online.');
        setIsSubmitting(false);
        setReceiptText('');
        setReceiptFile(null);
        return;
      }

      const resp = await fetch('/api/billing/receipts/', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error('submit failed');
      showSuccess('Receipt submitted successfully');
      setReceiptText('');
      setReceiptFile(null);
    } catch (e: any) {
      showError('Failed to submit receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className={`text-2xl font-bold text-${theme}-600`}>Billing</h1>
      <div className="card">
        <p className="text-sm text-gray-600 mb-2">Current Balance</p>
        {balance === null ? (
          <LoadingSpinner inline />
        ) : (
          <p className="text-3xl font-semibold">{balance.toFixed(2)} TZS</p>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Pay To</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Number</span>
          <code className="px-2 py-1 bg-gray-100 rounded">{payNumber}</code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">WhatsApp</span>
          <a className={`text-${theme}-600 underline`} href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g,'')}`} target="_blank" rel="noreferrer">Chat</a>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Submit Receipt</h2>
        <div className="flex gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" className="accent-orange-600" checked={receiptKind==='image'} onChange={()=>setReceiptKind('image')} /> Image
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" className="accent-orange-600" checked={receiptKind==='text'} onChange={()=>setReceiptKind('text')} /> Text
          </label>
        </div>
        {receiptKind==='image' ? (
          <input type="file" accept="image/*" onChange={(e)=>setReceiptFile(e.target.files?.[0]||null)} className="text-sm" />
        ) : (
          <textarea value={receiptText} onChange={(e)=>setReceiptText(e.target.value)} className="input-field text-sm" rows={3} placeholder="Paste receipt text here..." />
        )}
        <button disabled={isSubmitting} onClick={submitReceipt} className="btn-primary w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Receipt'}
        </button>
      </div>

      <div className="text-xs text-gray-500">
        Tip: When offline, your receipt will queue and send automatically when you reconnect.
      </div>
    </div>
  );
};

export default BillingPage;



