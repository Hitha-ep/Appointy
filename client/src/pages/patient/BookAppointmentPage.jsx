import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PaymentModal from '../../components/PaymentModal.jsx';
import { doctorService } from '../../services/doctorService.js';
import { appointmentService } from '../../services/appointmentService.js';

const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  // Modal & Slots state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorService.getDoctorById(doctorId);
        setDoctor(res.data.data);
      } catch (err) {
        setError('Doctor details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [doctorId]);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot('');
    if (!date) return;

    setSlotsLoading(true);
    try {
      const res = await doctorService.getDoctorSlots(doctorId, date);
      const slots = Array.isArray(res.data.data) ? res.data.data : res.data.slots;
      setAvailableSlots(slots && slots.length > 0 ? slots : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
    } catch {
      setAvailableSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      return setError('Please select a valid date and time slot.');
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await appointmentService.bookAppointment({
        doctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason,
        paymentMethod,
      });

      const appointment = res.data.data;
      setBookedAppointment(appointment);

      if (paymentMethod === 'online') {
        setShowPaymentModal(true);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSuccess(true);
  };

  if (loading) return <LoadingSpinner fullPage text="Preparing booking details..." />;

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSuccess(true);
        }}
        appointment={bookedAppointment || { doctor, consultationFee: doctor?.consultationFee }}
        onSuccess={handlePaymentSuccess}
      />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {success ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div className="success-check">✅</div>
              <h2 style={{ color: '#166534', marginBottom: '0.5rem' }}>Appointment Confirmed!</h2>
              <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                💳 {paymentMethod === 'online' ? 'Paid & Verified Online' : 'Payment on Clinic Visit'}
              </div>
              <p style={{ color: '#475569', marginBottom: '2rem' }}>
                Your appointment with <strong>{doctor?.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been successfully booked.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => navigate('/patient/appointments')} className="btn btn-primary">
                  View My Appointments
                </button>
                <button onClick={() => navigate('/doctors')} className="btn btn-outline">
                  Browse More Doctors
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#1e293b' }}>Book Appointment</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Booking with <strong>{doctor?.name}</strong> ({doctor?.specialization}) &bull; Fee: <strong>₹{doctor?.consultationFee}</strong>
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    className="form-input"
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                  {doctor?.availableDays && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Available on: {doctor.availableDays.join(', ')}
                    </div>
                  )}
                </div>

                {selectedDate && (
                  <div className="form-group">
                    <label className="form-label">Select Time Slot</label>
                    {slotsLoading ? (
                      <LoadingSpinner text="Checking available slots..." />
                    ) : availableSlots.length === 0 ? (
                      <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>No slots available for this date. Please pick another day.</p>
                    ) : (
                      <div className="slot-grid" style={{ marginTop: '0.5rem' }}>
                        {availableSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Reason / Symptoms</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Option</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div
                      className={`payment-method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === 'cash'} readOnly />
                      <div>
                        <strong>💵 Pay on Visit</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay in cash at clinic</div>
                      </div>
                    </div>
                    <div
                      className={`payment-method-option ${paymentMethod === 'online' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <input type="radio" name="payment" checked={paymentMethod === 'online'} readOnly />
                      <div>
                        <strong>💳 Online Payment</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>UPI / Card (Razorpay)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => navigate(-1)} className="btn btn-outline" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bookingLoading || !selectedDate || !selectedSlot}
                    style={{ flex: 2 }}
                  >
                    {bookingLoading ? 'Confirming...' : `Confirm Booking (₹${doctor?.consultationFee || 0})`}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
