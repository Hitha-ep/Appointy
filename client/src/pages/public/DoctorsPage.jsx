import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import DoctorCard from '../../components/DoctorCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { doctorService } from '../../services/doctorService.js';

const SPECIALIZATIONS = [
  'All',
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

const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [available, setAvailable] = useState(false);
  const [maxFee, setMaxFee] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization && specialization !== 'All') params.specialization = specialization;
      if (available) params.available = true;
      if (maxFee) params.maxFee = maxFee;

      const res = await doctorService.getDoctors(params);
      setDoctors(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, available, maxFee]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('All');
    setAvailable(false);
    setMaxFee('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '3rem 0', color: '#fff' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>Find a Doctor</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>Search from {total > 0 ? `${total}+` : 'hundreds of'} qualified doctors across all specializations.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by doctor name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="sidebar-layout">
          {/* Filter Sidebar */}
          <aside className="filter-panel" style={{ alignSelf: 'start', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Filters</h3>
              <button onClick={handleClearFilters} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <label>Specialization</label>
              <select
                className="form-select"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Max Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1000"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                min="0"
              />
            </div>

            <div className="filter-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  style={{ accentColor: '#2563eb' }}
                />
                Available Doctors Only
              </label>
            </div>
          </aside>

          {/* Doctors Grid */}
          <div>
            {loading ? (
              <LoadingSpinner text="Searching doctors..." />
            ) : error ? (
              <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <button onClick={fetchDoctors} className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#991b1b' }}>
                  Retry
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No doctors found</h3>
                <p>Try adjusting your search filters or search for a different specialization.</p>
                <button onClick={handleClearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
                  Showing <strong>{doctors.length}</strong> {doctors.length === 1 ? 'doctor' : 'doctors'}
                </p>
                <div className="grid grid-3">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorsPage;
