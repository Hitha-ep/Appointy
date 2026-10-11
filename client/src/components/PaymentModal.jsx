import React, { useState } from 'react';
import { paymentService } from '../services/paymentService.js';
import { useAuth } from '../context/AuthContext.jsx';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);
  const [txnId, setTxnId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const doctorName = appointment.doctor?.name || 'Medical Specialist';
  const fee = appointment.doctor?.consultationFee || appointment.consultationFee || appointment.amount || 500;
  const appointmentId = appointment._id || appointment.appointmentId;

  const stageMessages = [
    { text: 'Connecting to Secure Payment Network...', pct: '30%' },
    { text: 'Communicating with Razorpay Gateway...', pct: '65%' },
    { text: 'Verifying Security Signature & Settling...', pct: '90%' },
    { text: 'Payment Settled! Confirming appointment...', pct: '100%' },
  ];

  // Official Razorpay Checkout Flow
  const handleRazorpayPayment = async () => {
    setError('');
    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
      }

      // Step 1: Create Order on backend
      const res = await paymentService.createOrder(appointmentId);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initialize payment with Razorpay');
      }

      const orderData = res.data.data;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Appointy Healthcare',
        description: `Consultation fee for ${doctorName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setStep('processing');
            setProcessStage(2);

            const verifyRes = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId,
            });

            if (verifyRes.data.success) {
              setTxnId(response.razorpay_payment_id);
              setStep('success');
              setTimeout(() => {
                if (onSuccess) onSuccess({ transactionId: response.razorpay_payment_id });
              }, 1800);
            } else {
              setError(verifyRes.data.message || 'Payment signature verification failed.');
              setStep('select');
            }
          } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment verification failed.');
            setStep('select');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          appointmentId: appointmentId,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was cancelled or failed.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize Razorpay.');
      setIsProcessing(false);
    }
  };

  // Instant Demo Pay Bypass
  const handleDemoPayment = async () => {
    setError('');
    setStep('processing');
    setProcessStage(0);

    setTimeout(() => setProcessStage(1), 600);
    setTimeout(() => setProcessStage(2), 1200);
    setTimeout(() => setProcessStage(3), 1800);

    try {
      const [res] = await Promise.all([
        paymentService.demoPay(appointmentId),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ]);

      const tid = res.data?.data?.transactionId || 'PAY_DEMO_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setTxnId(tid);
      setStep('success');

      setTimeout(() => {
        if (onSuccess) onSuccess({ transactionId: tid });
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo payment failed.');
      setStep('select');
    }
  };

  const handleClose = () => {
    if (step === 'processing' || isProcessing) return;
    setError('');
    setStep('select');
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes rocketFly {
          0% { transform: translateY(15px) scale(0.95); opacity: 0.9; }
          40% { transform: translateY(-5px) scale(1.05); opacity: 1; }
          75% { transform: translateY(-25px) scale(1.15) rotate(-3deg); opacity: 1; }
          100% { transform: translateY(-130px) scale(1.4) rotate(4deg); opacity: 0; }
        }

        @keyframes checkPop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes spinnerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem'
      }}>
        <div style={{
          background: '#ffffff', borderRadius: '24px', maxWidth: '440px',
          width: '100%', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.45)',
          overflow: 'hidden', position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0b192c, #1e3a8a)',
            padding: '1.25rem 1.5rem', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.35rem' }}>💳</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.2px' }}>Razorpay Checkout</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Official 256-Bit SSL Encrypted Payment</div>
              </div>
            </div>
            {step === 'select' && !isProcessing && (
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                  width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div style={{ padding: '1.75rem 1.5rem', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* 1. PROCESSING STAGE */}
            {step === 'processing' && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '3.6rem',
                    animation: processStage >= 2 ? 'rocketFly 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
                    display: 'inline-block',
                    filter: 'drop-shadow(0 8px 12px rgba(37,99,235,0.35))'
                  }}>
                    🚀
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.3rem' }}>
                  Processing ₹{fee}
                </h3>

                <div style={{ color: '#2563eb', fontSize: '0.86rem', fontWeight: 600, minHeight: '22px', marginBottom: '1.2rem' }}>
                  {stageMessages[processStage]?.text || 'Finalizing transaction...'}
                </div>

                <div style={{
                  width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px',
                  overflow: 'hidden', marginBottom: '1.4rem'
                }}>
                  <div style={{
                    height: '100%', width: stageMessages[processStage]?.pct || '70%',
                    background: 'linear-gradient(90deg, #2563eb, #10b981)',
                    borderRadius: '10px', transition: 'width 0.6s ease'
                  }}></div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: processStage >= 0 ? '#16a34a' : '#94a3b8', marginBottom: '0.35rem' }}>
                    <span>{processStage >= 1 ? '✓' : '●'}</span> Razorpay Order Gateway Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: processStage >= 1 ? '#16a34a' : '#94a3b8', marginBottom: '0.35rem' }}>
                    <span>{processStage >= 2 ? '✓' : '●'}</span> HMAC-SHA256 Cryptographic Check
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: processStage >= 3 ? '#16a34a' : '#94a3b8' }}>
                    <span>{processStage >= 3 ? '✓' : '●'}</span> Instant Appointment Confirmation
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUCCESS SCREEN */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{
                  width: '80px', height: '80px', background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '2.6rem', margin: '0 auto 1.2rem',
                  boxShadow: '0 12px 25px rgba(22,163,74,0.3)',
                  animation: 'checkPop 0.5s ease-out forwards'
                }}>
                  ✓
                </div>

                <h3 style={{ color: '#15803d', fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                  Payment Verified!
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Amount <strong>₹{fee}</strong> paid successfully.
                </p>

                <div style={{
                  background: '#f8fafc', border: '1px dashed #cbd5e1',
                  padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.84rem', color: '#475569',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Payment ID:</span>
                    <strong style={{ color: '#0f172a' }}>{txnId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                    <span>Appointment Status:</span>
                    <span>CONFIRMED</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <span>📧</span> Confirmation receipt sent to your email
                </div>
              </div>
            )}

            {/* 3. PAYMENT SELECTION & GATEWAY LAUNCH */}
            {step === 'select' && (
              <>
                {error && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                    padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.84rem',
                    marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Doctor & Fee Summary */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0',
                  borderRadius: '16px', padding: '1.1rem 1.3rem', marginBottom: '1.25rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doctor</div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{doctorName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb' }}>₹{fee}</div>
                  </div>
                </div>

                {/* Supported Payment Channels */}
                <div style={{
                  background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px',
                  padding: '0.85rem 1rem', marginBottom: '1.4rem'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🛡️</span> All Payment Modes Supported:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem' }}>
                    <span style={{ background: '#fff', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#1e3a8a' }}>📱 UPI (GPay/PhonePe/Paytm)</span>
                    <span style={{ background: '#fff', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#1e3a8a' }}>💳 Credit / Debit Cards</span>
                    <span style={{ background: '#fff', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#1e3a8a' }}>🏦 NetBanking (50+ Banks)</span>
                  </div>
                </div>

                {/* Primary Button: Razorpay Gateway */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRazorpayPayment}
                  style={{
                    width: '100%',
                    background: isProcessing ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', border: 'none',
                    padding: '0.95rem', borderRadius: '14px',
                    fontSize: '1.05rem', fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 18px rgba(37,99,235,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    transition: 'all 0.15s ease', marginBottom: '0.75rem'
                  }}
                  onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.98)')}
                  onMouseUp={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isProcessing ? (
                    <>
                      <span style={{
                        width: '18px', height: '18px', border: '2px solid #fff',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spinnerSpin 0.7s linear infinite'
                      }}></span>
                      Connecting Razorpay...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.25rem' }}>⚡</span> Pay ₹{fee} with Razorpay
                    </>
                  )}
                </button>

                {/* Secondary Option: Instant Demo Pay */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDemoPayment}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    color: '#059669', border: '1px solid #a7f3d0',
                    padding: '0.7rem', borderRadius: '12px',
                    fontSize: '0.88rem', fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ecfdf5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  <span>🧪</span> Instant Demo Pay (1-Click Test)
                </button>

                <p style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.74rem', color: '#94a3b8' }}>
                  🔒 Live Razorpay Test Keys Active • Instant HMAC Verification
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
