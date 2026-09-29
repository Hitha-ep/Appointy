import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate, getStatusBadgeClass } from '../../utils/formatDate.js';

// Curated high quality doctor avatar presets
const PRESET_AVATARS = [
  { label: 'Dr. Sarah (Physician)', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Michael (Cardiology)', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Priya (Dermatology)', url: 'https://images.unsplash.com/photo-1594824813512-329b3922f3e0?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Rajesh (Pediatrics)', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Anita (Dentist)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Vikram (Orthopedic)', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. David (Ophthalmology)', url: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Sunita (Gynecology)', url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Arjun (ENT)', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600' },
  { label: 'Dr. Kavita (Psychiatry)', url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600' },
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SPECIALIZATIONS_LIST = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Dentist',
  'Orthopedic',
  'Neurologist',
  'Gynecologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Psychiatrist',
  'Pulmonologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Oncologist',
  'Urologist',
];

// Reusable Doctor Avatar with broken image fallback
const DoctorAvatar = ({ src, name, size = 48 }) => {
  const [error, setError] = useState(false);
  const initials = name
    ? name.replace(/^Dr\.\s*/i, '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size >= 90 ? '2.25rem' : size >= 48 ? '1rem' : '0.8rem',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Doctor list filtering & view modes
  const [doctorSearch, setDoctorSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // New Doctor State
  const initialNewDoctor = {
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General Physician',
    qualification: 'MBBS',
    experience: 5,
    consultationFee: 500,
    profileImage: PRESET_AVATARS[0].url,
    about: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTimeSlots: { startTime: '09:00', endTime: '17:00', duration: 30 },
  };
  const [newDoctor, setNewDoctor] = useState(initialNewDoctor);

  // Edit Doctor State
  const [editForm, setEditForm] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, docsRes, apptsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllDoctors(),
        adminService.getAllAppointments(),
      ]);
      setStats(dashRes.data.data || dashRes.data);
      setDoctors(docsRes.data.data || []);
      setAppointments(apptsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return;
    try {
      await adminService.deleteDoctor(id);
      if (viewingDoctor && viewingDoctor._id === id) setViewingDoctor(null);
      if (editingDoctor && editingDoctor._id === id) setEditingDoctor(null);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleToggleAvailability = async (doc) => {
    const updatedStatus = !doc.isAvailable;
    try {
      await adminService.updateDoctor(doc._id, { isAvailable: updatedStatus });
      setDoctors((prev) =>
        prev.map((d) => (d._id === doc._id ? { ...d, isAvailable: updatedStatus } : d))
      );
      if (viewingDoctor && viewingDoctor._id === doc._id) {
        setViewingDoctor((prev) => ({ ...prev, isAvailable: updatedStatus }));
      }
    } catch (err) {
      alert('Failed to update doctor availability');
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await adminService.addDoctor(newDoctor);
      setShowAddModal(false);
      setNewDoctor(initialNewDoctor);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || 'General Physician',
      qualification: doctor.qualification || '',
      experience: doctor.experience ?? 0,
      consultationFee: doctor.consultationFee ?? 500,
      profileImage: doctor.profileImage || '',
      about: doctor.about || '',
      isAvailable: doctor.isAvailable ?? true,
      availableDays: doctor.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: {
        startTime: doctor.availableTimeSlots?.startTime || '09:00',
        endTime: doctor.availableTimeSlots?.endTime || '17:00',
        duration: doctor.availableTimeSlots?.duration || 30,
      },
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await adminService.updateDoctor(editingDoctor._id, editForm);
      const updated = res.data.data || { ...editingDoctor, ...editForm };
      setDoctors((prev) => prev.map((d) => (d._id === editingDoctor._id ? updated : d)));
      if (viewingDoctor && viewingDoctor._id === editingDoctor._id) {
        setViewingDoctor(updated);
      }
      setEditingDoctor(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleDaySelection = (day, isEdit = false) => {
    if (isEdit) {
      const currentDays = editForm.availableDays || [];
      const updated = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      setEditForm({ ...editForm, availableDays: updated });
    } else {
      const currentDays = newDoctor.availableDays || [];
      const updated = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      setNewDoctor({ ...newDoctor, availableDays: updated });
    }
  };

  // Filtered Doctors List
  const filteredDoctors = doctors.filter((doc) => {
    const term = doctorSearch.toLowerCase();
    const matchesSearch =
      !term ||
      doc.name?.toLowerCase().includes(term) ||
      doc.email?.toLowerCase().includes(term) ||
      doc.specialization?.toLowerCase().includes(term) ||
      doc.qualification?.toLowerCase().includes(term) ||
      doc.phone?.includes(term);

    const matchesSpec =
      specializationFilter === 'All' || doc.specialization === specializationFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && doc.isAvailable) ||
      (statusFilter === 'Offline' && !doc.isAvailable);

    return matchesSearch && matchesSpec && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#1e293b', fontWeight: 800 }}>
              Admin Control Center
            </h1>
            <p style={{ color: '#64748b' }}>
              Complete management of doctors, patients, and platform bookings
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>➕</span> Add New Doctor
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">👨‍⚕️</div>
            <div>
              <div className="stat-number">{stats?.totalDoctors ?? doctors.length}</div>
              <div className="stat-label">Total Doctors</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">👥</div>
            <div>
              <div className="stat-number">{stats?.totalPatients ?? 2}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">📅</div>
            <div>
              <div className="stat-number">{stats?.totalAppointments ?? appointments.length}</div>
              <div className="stat-label">Appointments</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">💰</div>
            <div>
              <div className="stat-number">₹{stats?.totalRevenue ?? 1500}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 All Appointments ({appointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Manage Doctors ({doctors.length})
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching platform data..." />
        ) : activeTab === 'overview' ? (
          /* Appointments Table */
          <div className="card">
            <div className="card-header">
              <h3>System Appointments</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <p>No appointments placed yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Fee</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td>
                            <strong>{appt.patient?.name || 'Patient'}</strong>
                          </td>
                          <td>
                            Dr. {appt.doctor?.name} ({appt.doctor?.specialization})
                          </td>
                          <td>
                            {formatDate(appt.appointmentDate)} &bull; {appt.appointmentTime}
                          </td>
                          <td>₹{appt.consultationFee || appt.doctor?.consultationFee || 500}</td>
                          <td>
                            <span
                              className={`badge ${
                                appt.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
                              }`}
                            >
                              {appt.paymentMethod} - {appt.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* DOCTORS MANAGEMENT TAB */
          <div>
            {/* Filter, Search & View Switcher Bar */}
            <div
              className="card"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search doctor by name, email, spec..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    🔍
                  </span>
                </div>

                {/* Specialization Filter */}
                <select
                  className="form-select"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  style={{ width: 'auto', minWidth: '160px' }}
                >
                  <option value="All">All Specializations</option>
                  {SPECIALIZATIONS_LIST.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: 'auto', minWidth: '130px' }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Offline">Offline Only</option>
                </select>
              </div>

              {/* View Switcher & Results count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Showing <strong>{filteredDoctors.length}</strong> of {doctors.length} doctors
                </span>
                <div style={{ display: 'inline-flex' }}>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    ☰ Table
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                    title="Cards View"
                  >
                    ▦ Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors List */}
            {filteredDoctors.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                <h3>No doctors match your criteria</h3>
                <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
                  Try changing your search keywords or filter selection.
                </p>
                <button
                  onClick={() => {
                    setDoctorSearch('');
                    setSpecializationFilter('All');
                    setStatusFilter('All');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'table' ? (
              /* TABLE VIEW */
              <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Photo</th>
                          <th>Doctor Details</th>
                          <th>Specialization & Degree</th>
                          <th>Fee</th>
                          <th>Experience</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDoctors.map((doc) => (
                          <tr key={doc._id}>
                            <td>
                              <DoctorAvatar src={doc.profileImage} name={doc.name} size={48} />
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                {doc.name}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                                ✉️ {doc.email}
                              </div>
                              {doc.phone && (
                                <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                                  📞 {doc.phone}
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8125rem',
                                  fontWeight: 600,
                                  display: 'inline-block',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                {doc.specialization}
                              </span>
                              <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                                🎓 {doc.qualification || 'MBBS'}
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#1e293b' }}>₹{doc.consultationFee}</strong>
                            </td>
                            <td>{doc.experience} Years</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleAvailability(doc)}
                                className={`badge ${doc.isAvailable ? 'badge-success' : 'badge-danger'}`}
                                style={{
                                  cursor: 'pointer',
                                  border: 'none',
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                }}
                                title="Click to toggle status"
                              >
                                {doc.isAvailable ? '● Active' : '○ Offline'}
                              </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => setViewingDoctor(doc)}
                                  className="btn btn-outline btn-sm"
                                  title="View Full Details"
                                >
                                  👁️ Details
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(doc)}
                                  className="btn btn-outline btn-sm"
                                  title="Edit Doctor"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDoctor(doc._id)}
                                  className="btn btn-outline-danger btn-sm"
                                  title="Delete Doctor"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* CARDS / GRID VIEW */
              <div className="grid grid-3" style={{ gap: '1.25rem' }}>
                {filteredDoctors.map((doc) => (
                  <div key={doc._id} className="admin-doc-card">
                    {/* Top Row with Avatar & Status */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <DoctorAvatar src={doc.profileImage} name={doc.name} size={64} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '1.05rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {doc.name}
                        </div>
                        <div style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 600 }}>
                          {doc.specialization}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                          🎓 {doc.qualification || 'MBBS'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(doc)}
                        className={`badge ${doc.isAvailable ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none', flexShrink: 0 }}
                        title="Click to toggle status"
                      >
                        {doc.isAvailable ? 'Active' : 'Offline'}
                      </button>
                    </div>

                    {/* Meta info */}
                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: '#475569',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        marginBottom: '1rem',
                        flex: 1,
                      }}
                    >
                      <div>💼 <strong>{doc.experience} Years</strong> Experience</div>
                      <div>💰 Fee: <strong>₹{doc.consultationFee}</strong> / session</div>
                      <div>✉️ {doc.email}</div>
                      {doc.phone && <div>📞 {doc.phone}</div>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem' }}>
                      <button
                        onClick={() => setViewingDoctor(doc)}
                        className="btn btn-outline btn-sm"
                      >
                        👁️ Details
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        className="btn btn-primary btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Doctor"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW DOCTOR DETAILS MODAL */}
      {/* ========================================================================= */}
      {viewingDoctor && (
        <div className="modal-overlay" onClick={() => setViewingDoctor(null)}>
          <div
            className="modal"
            style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <DoctorAvatar src={viewingDoctor.profileImage} name={viewingDoctor.name} size={90} />
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {viewingDoctor.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {viewingDoctor.specialization}
                    </span>
                    <span className={`badge ${viewingDoctor.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                      {viewingDoctor.isAvailable ? 'Active for Booking' : 'Offline / Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoctor(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Quick Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.875rem',
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Qualifications
                </span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  🎓 {viewingDoctor.qualification || 'MBBS'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Experience
                </span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  💼 {viewingDoctor.experience} Years
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Consultation Fee
                </span>
                <div style={{ fontWeight: 700, color: '#059669', fontSize: '1.1rem' }}>
                  ₹{viewingDoctor.consultationFee}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Phone
                </span>
                <div style={{ fontWeight: 500, color: '#1e293b' }}>
                  📞 {viewingDoctor.phone || 'N/A'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Email Address
                </span>
                <div style={{ fontWeight: 500, color: '#1e293b' }}>
                  ✉️ {viewingDoctor.email}
                </div>
              </div>
            </div>

            {/* Schedule / Availability */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                Available Working Days
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {viewingDoctor.availableDays && viewingDoctor.availableDays.length > 0 ? (
                  viewingDoctor.availableDays.map((d) => (
                    <span key={d} className="badge badge-info" style={{ padding: '0.35rem 0.75rem' }}>
                      {d}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>No specific days set</span>
                )}
              </div>
              <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                ⏰ Working Hours:{' '}
                <strong>
                  {viewingDoctor.availableTimeSlots?.startTime || '09:00'} -{' '}
                  {viewingDoctor.availableTimeSlots?.endTime || '17:00'}
                </strong>{' '}
                ({viewingDoctor.availableTimeSlots?.duration || 30} mins per slot)
              </div>
            </div>

            {/* Biography */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                About Doctor
              </h4>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.9rem' }}>
                {viewingDoctor.about ||
                  'No detailed biography has been added for this doctor yet.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handleToggleAvailability(viewingDoctor)}
                className={`btn ${viewingDoctor.isAvailable ? 'btn-outline-danger' : 'btn-outline'} btn-sm`}
              >
                {viewingDoctor.isAvailable ? 'Deactivate Doctor' : 'Activate Doctor'}
              </button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const doc = viewingDoctor;
                    setViewingDoctor(null);
                    handleOpenEditModal(doc);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoctor(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT DOCTOR MODAL */}
      {/* ========================================================================= */}
      {editingDoctor && editForm && (
        <div className="modal-overlay" onClick={() => setEditingDoctor(null)}>
          <div
            className="modal"
            style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="modal-title">Edit Doctor: {editingDoctor.name}</h3>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {/* Doctor Photo Section */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Doctor Profile Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <DoctorAvatar src={editForm.profileImage} name={editForm.name} size={64} />
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Paste Image URL (https://...)"
                      value={editForm.profileImage}
                      onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                    Or select from preset doctor photos:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`preset-avatar-btn ${editForm.profileImage === preset.url ? 'selected' : ''}`}
                        onClick={() => setEditForm({ ...editForm, profileImage: preset.url })}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Specialization & Qualification */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. MBBS, MD"
                    value={editForm.qualification}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  />
                </div>
              </div>

              {/* Experience & Fee */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={editForm.consultationFee}
                    onChange={(e) => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Available Days */}
              <div className="form-group">
                <label className="form-label">Available Days</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {ALL_DAYS.map((day) => {
                    const isSelected = editForm.availableDays?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day, true)}
                        className={`badge ${isSelected ? 'badge-primary' : 'badge-light'}`}
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? 'none' : '1px solid #cbd5e1',
                          padding: '0.35rem 0.65rem',
                          background: isSelected ? '#2563eb' : '#fff',
                          color: isSelected ? '#fff' : '#475569',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={editForm.availableTimeSlots?.startTime || '09:00'}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        availableTimeSlots: { ...editForm.availableTimeSlots, startTime: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={editForm.availableTimeSlots?.endTime || '17:00'}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        availableTimeSlots: { ...editForm.availableTimeSlots, endTime: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Active / Offline status */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="editIsAvailable"
                  checked={editForm.isAvailable}
                  onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <label htmlFor="editIsAvailable" style={{ fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  Doctor is Active and open for bookings
                </label>
              </div>

              {/* About / Bio */}
              <div className="form-group">
                <label className="form-label">About / Biography</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={editForm.about}
                  onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingDoctor(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD DOCTOR MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal"
            style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="modal-title">Add New Doctor</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit}>
              {/* Doctor Photo Selector */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Doctor Profile Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <DoctorAvatar src={newDoctor.profileImage} name={newDoctor.name || 'New Doctor'} size={64} />
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Paste Image URL (or choose from presets below)"
                      value={newDoctor.profileImage}
                      onChange={(e) => setNewDoctor({ ...newDoctor, profileImage: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                    Quick presets:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`preset-avatar-btn ${newDoctor.profileImage === preset.url ? 'selected' : ''}`}
                        onClick={() => setNewDoctor({ ...newDoctor, profileImage: preset.url })}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Dr. John Doe"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                />
              </div>

              {/* Email & Password */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="doctor@appointy.com"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Specialization & Qualification */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Cardiologist"
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. MBBS, MD"
                    value={newDoctor.qualification}
                    onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                  />
                </div>
              </div>

              {/* Consultation Fee & Experience */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={newDoctor.consultationFee}
                    onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                />
              </div>

              {/* Available Days */}
              <div className="form-group">
                <label className="form-label">Available Days</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {ALL_DAYS.map((day) => {
                    const isSelected = newDoctor.availableDays?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day, false)}
                        className={`badge ${isSelected ? 'badge-primary' : 'badge-light'}`}
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? 'none' : '1px solid #cbd5e1',
                          padding: '0.35rem 0.65rem',
                          background: isSelected ? '#2563eb' : '#fff',
                          color: isSelected ? '#fff' : '#475569',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* About / Biography */}
              <div className="form-group">
                <label className="form-label">About / Biography</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Doctor's background, clinical expertise, and summary..."
                  value={newDoctor.about}
                  onChange={(e) => setNewDoctor({ ...newDoctor, about: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving Doctor...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
