import crypto from 'crypto';
import Razorpay from 'razorpay';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ✅ Payment confirmation email template
const generatePaymentEmailTemplate = ({ patientName, doctorName, fee, date, time, txnId }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmation - Appointy</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8fafc; margin:0; padding:0; }
    .container { max-width:580px; margin:30px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0; }
    .header { background:linear-gradient(135deg,#1e3a8a,#2563eb); padding:30px; text-align:center; color:#fff; }
    .header h1 { margin:0; font-size:26px; font-weight:800; }
    .header p { margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px; }
    .content { padding:35px 30px; color:#1e293b; }
    .success-badge { background:#dcfce7; color:#166534; border-radius:50px; padding:8px 20px; display:inline-block; font-weight:700; font-size:14px; margin-bottom:20px; }
    .detail-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:14px; }
    .detail-row:last-child { border-bottom:none; }
    .detail-label { color:#64748b; }
    .detail-value { font-weight:600; color:#1e293b; }
    .amount-highlight { font-size:22px; font-weight:800; color:#2563eb; }
    .txn-box { background:#eff6ff; border:1px dashed #93c5fd; border-radius:8px; padding:12px 16px; margin:16px 0; font-size:13px; color:#1e40af; }
    .footer { background:#f8fafc; padding:20px 30px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Appointy Healthcare</h1>
      <p>Payment Confirmation</p>
    </div>
    <div class="content">
      <div class="success-badge">✅ Payment Successful</div>
      <p style="font-size:16px; margin-bottom:20px;">Hello <strong>${patientName}</strong>, your payment has been confirmed and your appointment is now <strong>confirmed</strong>!</p>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Doctor</span>
          <span class="detail-value">${doctorName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Appointment Date</span>
          <span class="detail-value">${date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Paid</span>
          <span class="detail-value amount-highlight">₹${fee}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method</span>
          <span class="detail-value">Razorpay (Online)</span>
        </div>
      </div>

      <div class="txn-box">
        🔖 Transaction ID: <strong>${txnId}</strong>
      </div>

      <p style="font-size:14px; color:#64748b;">Please arrive 10 minutes early for your appointment. Carry this confirmation email or note the Transaction ID for reference.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Appointy Healthcare Inc. All rights reserved.<br/>
      Need help? Contact <a href="mailto:support@appointy.com" style="color:#2563eb;">support@appointy.com</a>
    </div>
  </div>
</body>
</html>
`;

// GET /api/payments/key
export const getRazorpayKey = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || '',
  });
};

// POST /api/payments/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Support both populated and unpopulated patient field
    const patientId = appointment.patient?._id
      ? appointment.patient._id.toString()
      : appointment.patient.toString();

    if (patientId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate consultationFee
    const fee = appointment.doctor?.consultationFee;
    if (!fee || isNaN(fee) || fee <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid consultation fee for this doctor' });
    }

    const amount = Math.round(fee * 100); // Convert to paise (must be integer)

    const razorpay = getRazorpay();

    let order;
    try {
      order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `rcpt_${appointmentId}`.substring(0, 40),
      });
    } catch (razorErr) {
      console.error('❌ Razorpay order create error:', razorErr.error || razorErr.message);
      return res.status(502).json({
        success: false,
        message: razorErr.error?.description || razorErr.message || 'Razorpay order creation failed',
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        appointmentId,
        doctorName: appointment.doctor.name,
        consultationFee: appointment.doctor.consultationFee,
      },
    });
  } catch (error) {
    console.error('❌ createOrder error:', error.message);
    next(error);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      appointmentId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    // Verify Razorpay signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name consultationFee')
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'paid';
    appointment.paymentId = razorpayPaymentId;
    appointment.status = 'confirmed';
    await appointment.save();

    await Payment.create({
      appointment: appointmentId,
      patient: appointment.patient._id || appointment.patient,
      doctor: appointment.doctor._id,
      amount: appointment.doctor.consultationFee,
      paymentMethod: 'online',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid',
    });

    // ✅ Send payment confirmation email to patient
    try {
      const patientEmail = appointment.patient?.email;
      const patientName = appointment.patient?.name || 'Patient';
      const doctorName = appointment.doctor?.name || 'Doctor';
      const fee = appointment.doctor?.consultationFee;
      const date = appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'N/A';
      const time = appointment.appointmentTime || 'N/A';

      if (patientEmail) {
        await sendEmail({
          to: patientEmail,
          subject: '✅ Payment Confirmed - Appointy Appointment Confirmed',
          html: generatePaymentEmailTemplate({
            patientName,
            doctorName,
            fee,
            date,
            time,
            txnId: razorpayPaymentId,
          }),
        });
        console.log(`📧 Payment confirmation email sent to ${patientEmail}`);
      }
    } catch (emailErr) {
      // Don't fail payment if email fails
      console.error('⚠️ Payment email send failed:', emailErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified and appointment confirmed',
      data: { appointmentId },
    });
  } catch (error) {
    console.error('❌ verifyPayment error:', error.message);
    next(error);
  }
};

// POST /api/payments/demo-pay
export const demoPay = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name consultationFee')
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const txnId = 'PAY_DEMO_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    appointment.paymentStatus = 'paid';
    appointment.paymentId = txnId;
    appointment.status = 'confirmed';
    await appointment.save();

    await Payment.create({
      appointment: appointmentId,
      patient: appointment.patient._id || appointment.patient,
      doctor: appointment.doctor._id,
      amount: appointment.doctor.consultationFee,
      paymentMethod: 'online',
      razorpayPaymentId: txnId,
      status: 'paid',
    });

    res.json({
      success: true,
      message: 'Demo payment completed successfully',
      data: {
        appointmentId,
        transactionId: txnId,
        amount: appointment.doctor.consultationFee,
        status: 'paid',
      },
    });
  } catch (error) {
    next(error);
  }
};
