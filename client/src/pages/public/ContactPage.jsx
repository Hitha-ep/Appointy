import React, { useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '4rem 0', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Have questions or need help? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '3.5rem 1.5rem', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Get In Touch</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Fill out the form and our support team will respond within 24 business hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📍</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Location</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Kaloor, Ernakulam, Kerala, India</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✉️</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Email Us</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>support@appointy.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📞</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Call Us</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>+91 90000 00000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            {submitted ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#166534' }}>Thank you!</h3>
                <p>Your message has been sent successfully. We will get back to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    required
                    rows="4"
                    className="form-textarea"
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
