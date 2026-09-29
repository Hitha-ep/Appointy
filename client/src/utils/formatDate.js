export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date, time) => {
  if (!date) return 'N/A';
  return `${formatDate(date)}${time ? ', ' + time : ''}`;
};

export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
};

export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    rescheduled: 'badge-secondary',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-warning',
    cash: 'badge-secondary',
    online: 'badge-primary',
  };
  return map[status] || 'badge-secondary';
};
