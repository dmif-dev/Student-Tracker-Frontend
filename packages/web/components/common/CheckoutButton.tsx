'use client';

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import LoaderOne from '@/components/ui/loader-one';
import { apiClient } from '@/utils/apiClient';

interface CheckoutButtonProps {
  orderData: {
    recipientEmail: string;
    customerName: string;
    orderId: string;
    totalAmount: string;
  };
}

export default function CheckoutButton({ orderData }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const handleCheckout = async () => {
    setLoading(true);
    setStatusMessage('Processing your order...');
    setStatusType('');

    try {
      const result = await apiClient.post<any>('email/confirm-order', orderData);

      if (result.success) {
        setStatusType('success');
        setStatusMessage('Order placed! Check your Inbox for the Receipt.');
      } else {
        setStatusType('error');
        setStatusMessage('Order placed, but we had trouble sending the email.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setStatusType('error');
      setStatusMessage('Network Error. Is the Backend Server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-800 p-6 flex flex-col items-center">
      <div className="text-center mb-6">
        <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-1">Items in Cart</p>
        <h2 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">{orderData.totalAmount}</h2>
      </div>

      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className="w-full h-12 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-green-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none mb-4 font-montserrat"
      >
        {loading ? (
          <>
            <span className="scale-75 mr-2"><LoaderOne /></span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Complete Checkout</span>
          </>
        )}
      </button>

      {statusMessage && (
        <div className={`w-full p-3 rounded-xl flex items-center gap-2 text-sm ${
          statusType === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 
          statusType === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600'
        }`}>
          {statusType === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {statusType === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
