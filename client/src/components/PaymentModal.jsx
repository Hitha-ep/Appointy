import React, { useState } from 'react';
import { paymentService } from '../services/paymentService.js';

const PaymentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('patient@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8821 9912 3456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const doctorName = appointment.doctor?.name || 'Medical Specialist';
  const fee = appointment.doctor?.consultationFee || appointment.amount || 500;
  const appointmentId = appointment._id || appointment.appointmentId;

  const handlePay = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const res = await paymentService.demoPay(appointmentId);
      if (res.data.success) {
        setTxnId(res.data.data?.transactionId || 'PAY_' + Math.random().toString(36).substring(2, 8).toUpperCase());
        setIsSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.data);
        }, 1800);
      } else {
        setError('Payment verification failed.');
      }
    } catch (err) {
      setTxnId('PAY_DEMO_' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess({ transactionId: 'PAY_DEMO_OK' });
      }, 1800);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          padding: '1.25rem 1.5rem', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔒</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Razorpay Demo Checkout</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Secure 256-Bit SSL Payment Simulation</div>
            </div>
          </div>
          {!isProcessing && !isSuccess && (
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        <div style={{ padding: '1.75rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '70px', height: '70px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1rem' }}>✓</div>
              <h3 style={{ color: '#166534', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Payment Successful!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Your payment of <strong>₹{fee}</strong> was received successfully.</p>
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                Transaction ID: <strong style={{ color: '#0f172a' }}>{txnId}</strong>
              </div>
            </div>
          ) : isProcessing ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <div style={{ width: '48px', height: '48px', border: '4px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 1.25rem', animation: 'spin 0.8s linear infinite' }}></div>
              <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Processing Payment...</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Connecting with bank & confirming appointment...</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Consultation with</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{doctorName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Fee</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>₹{fee}</div>
                </div>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Payment Option</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { id: 'upi', label: '📱 UPI / QR' },
                    { id: 'card', label: '💳 Card' },
                    { id: 'netbanking', label: '🏦 NetBank' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        padding: '0.625rem 0.25rem',
                        border: selectedMethod === m.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: selectedMethod === m.id ? '#eff6ff' : '#ffffff',
                        color: selectedMethod === m.id ? '#1e40af' : '#475569',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {selectedMethod === 'upi' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Enter UPI ID (e.g. GPay / PhonePe)</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }} />
                  </div>
                )}
                {selectedMethod === 'card' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Card Number</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.5rem' }} />
                  </div>
                )}
                {selectedMethod === 'netbanking' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', background: '#fff' }}>🏦 HDFC Bank</div>
                      <div style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', background: '#fff' }}>🏦 State Bank of India</div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handlePay}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>💳</span> Pay ₹{fee} (Instant Demo Pay)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
