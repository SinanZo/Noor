'use client';
import { useEffect, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';

type Props = {
  projectId: string;
  amount: number; // USD
  onSuccess?: (piId: string) => void;
};

export default function CheckoutForm({ projectId, amount, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setClientSecret(null);
    setError('');
  }, [projectId, amount]);

  const createIntent = async () => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const r = await axios.post(`${api}/donations/intent`, {
        projectId,
        amountCents: Math.round(amount * 100),
        currency: 'USD',
        donorInfo: {
          name: 'Anonymous',
          email: '',
          anonymous: true
        }
      });
      
      if (r.data.mock) {
        // Mock mode - simulate success
        setError('');
        setTimeout(() => onSuccess?.('mock_payment_' + Date.now()), 500);
        return null;
      }
      
      setClientSecret(r.data.data.clientSecret);
      return r.data.data.clientSecret as string;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payment intent');
      throw err;
    }
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    
    try {
      const secret = clientSecret || await createIntent();
      
      // If mock mode was triggered, return early
      if (!secret) {
        setLoading(false);
        return;
      }
      
      const card = elements.getElement(CardElement);
      if (!card) {
        setError('Card element not found');
        setLoading(false);
        return;
      }
      
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(secret, {
        payment_method: { card }
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }
      
      if (paymentIntent?.status === 'succeeded') {
        setError('');
        onSuccess?.(paymentIntent.id);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-3 bg-white dark:bg-gray-800">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#1a202c',
                '::placeholder': {
                  color: '#a0aec0',
                },
              },
              invalid: {
                color: '#e53e3e',
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
      
      <button
        disabled={!stripe || loading}
        onClick={handlePay}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 px-5 py-3 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
      </button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Secured by Stripe • Your payment information is encrypted
      </p>
    </div>
  );
}
