/**
 * Generate time slots between startTime and endTime with given duration
 * @param {string} startTime - '09:00' (24h)
 * @param {string} endTime - '17:00' (24h)
 * @param {number} duration - minutes per slot
 * @returns {string[]} - ['09:00 AM', '09:30 AM', ...]
 */
export const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  const endTotalMins = endHour * 60 + endMin;

  while (currentHour * 60 + currentMin < endTotalMins) {
    const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const ampm = currentHour < 12 ? 'AM' : 'PM';
    const displayMin = String(currentMin).padStart(2, '0');
    slots.push(`${displayHour}:${displayMin} ${ampm}`);

    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

/**
 * Get the day name from a Date object
 * @param {Date|string} date
 * @returns {string} - 'Monday', 'Tuesday', etc.
 */
export const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(date);
  return days[d.getDay()];
};

/**
 * Check if a date string is in the past (before today)
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};
