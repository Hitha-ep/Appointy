import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getStatusBadgeClass } from '../utils/formatDate.js';

const AppointmentCard = ({ appointment, onCancel, onReschedule, showDoctorInfo = true }) => {
  const { _id, doctor, patient, appointmentDate, appointmentTime, status, paymentStatus, paymentMethod, reason } = appointment;

  const canCancel = ['pending', 'confirmed'].includes(status);
  const canReschedule = ['pending', 'confirmed'].includes(status);

  const displayName = showDoctorInfo
    ? (doctor?.name || 'Doctor')
    : (patient?.name || 'Patient');

  const displaySpec = showDoctorInfo ? doctor?.specialization : patient?.email;

  return (
    <div className="appt-card">
      <div className="appt-card-header">
        <div>
          <div className="appt-doctor-name">{displayName}</div>
          <div className="appt-spec">{displaySpec}</div>
          {reason && <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>Reason: {reason}</div>}
        </div>
        <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
      </div>

      <div className="appt-meta">
        <div className="appt-meta-item">📅 <span>{formatDate(appointmentDate)}</span></div>
        <div className="appt-meta-item">🕐 <span>{appointmentTime}</span></div>
        <div className="appt-meta-item">
          💳 <span className={`badge ${getStatusBadgeClass(paymentStatus)}`}>{paymentStatus}</span>
        </div>
        <div className="appt-meta-item">
          <span className={`badge ${getStatusBadgeClass(paymentMethod)}`}>{paymentMethod}</span>
        </div>
      </div>

      <div className="appt-actions">
        <Link to={`/patient/appointments/${_id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
        {canReschedule && onReschedule && (
          <button onClick={() => onReschedule(_id)} className="btn btn-ghost btn-sm">
            Reschedule
          </button>
        )}
        {canCancel && onCancel && (
          <button onClick={() => onCancel(_id)} className="btn btn-outline-danger btn-sm">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
