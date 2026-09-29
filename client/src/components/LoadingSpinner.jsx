import React from 'react';

const LoadingSpinner = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <p className="loading-text">{text}</p>
      </div>
    );
  }
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
