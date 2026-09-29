import React from 'react';
import { Link } from 'react-router-dom';
import { getStatusBadgeClass } from '../utils/formatDate.js';

const DoctorCard = ({ doctor }) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = doctor.name
    ? doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  return (
    <div className="doctor-card">
      {/* Avatar */}
      <div className="doctor-card-img">
        {doctor.profileImage && !imgError ? (
          <img
            src={doctor.profileImage}
            alt={doctor.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
            {initials}
          </div>
        )}
      </div>

      <div className="doctor-card-body">
        {/* Availability badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <div className="doctor-card-name">{doctor.name}</div>
            <div className="doctor-card-spec">{doctor.specialization}</div>
          </div>
          <span className={`badge ${doctor.isAvailable ? 'badge-success' : 'badge-danger'}`}>
            {doctor.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Info */}
        <div className="doctor-card-info">
          {doctor.qualification && (
            <div className="doctor-card-info-item">
              🎓 <span>{doctor.qualification}</span>
            </div>
          )}
          <div className="doctor-card-info-item">
            💼 <span>{doctor.experience} {doctor.experience === 1 ? 'year' : 'years'} experience</span>
          </div>
          {doctor.availableDays && doctor.availableDays.length > 0 && (
            <div className="doctor-card-info-item">
              📅 <span>{doctor.availableDays.slice(0, 3).join(', ')}{doctor.availableDays.length > 3 ? '...' : ''}</span>
            </div>
          )}
        </div>

        {/* Fee & Actions pushed to bottom */}
        <div className="doctor-card-bottom">
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <span className="doctor-card-fee">
              ₹{doctor.consultationFee} <span>/ consultation</span>
            </span>
          </div>

          <div className="doctor-card-actions">
            <Link to={`/doctors/${doctor._id}`} className="btn btn-outline btn-sm">
              View Profile
            </Link>
            <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-sm">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
