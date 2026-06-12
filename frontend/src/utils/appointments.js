const getDateParts = (date) => {
  if (!date) return null;

  if (typeof date === 'string') {
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      return {
        year: Number(dateMatch[1]),
        month: Number(dateMatch[2]) - 1,
        day: Number(dateMatch[3])
      };
    }
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth(),
    day: parsedDate.getDate()
  };
};

const getTimeParts = (time) => {
  if (!time) return null;

  const [hours, minutes] = String(time).split(':').map(Number);
  if ([hours, minutes].some(Number.isNaN)) return null;

  return { hours, minutes };
};

const getAppointmentDateTime = (appointment, timeField) => {
  const dateParts = getDateParts(appointment.date);
  const timeParts = getTimeParts(appointment[timeField]);

  if (!dateParts || !timeParts) return null;

  return new Date(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes
  );
};

export const getAppointmentStartDateTime = (appointment) => getAppointmentDateTime(appointment, 'startTime');

export const getAppointmentEndDateTime = (appointment) => getAppointmentDateTime(appointment, 'endTime');

export const isUpcomingAppointment = (appointment) => {
  const endDateTime = getAppointmentEndDateTime(appointment);
  if (!endDateTime) return true;

  return endDateTime.getTime() > Date.now();
};

export const isCompletedConfirmedAppointment = (appointment) => (
  Boolean(appointment.confirmed || appointment.availability) && !isUpcomingAppointment(appointment)
);

export const getDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatStoredDate = (date, fallback = 'No date') => {
  const dateParts = getDateParts(date);
  if (!dateParts) return fallback;

  return `${dateParts.month + 1}/${dateParts.day}/${dateParts.year}`;
};

export const getStoredDateInputValue = (date) => {
  const dateParts = getDateParts(date);
  if (!dateParts) return '';

  const year = dateParts.year;
  const month = String(dateParts.month + 1).padStart(2, '0');
  const day = String(dateParts.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateTimeValidationError = (appointment, label = 'Session') => {
  const startDateTime = getAppointmentStartDateTime(appointment);
  const endDateTime = getAppointmentEndDateTime(appointment);

  if (!startDateTime || !endDateTime) {
    return 'Please choose a valid date, start time, and end time.';
  }

  if (endDateTime.getTime() <= startDateTime.getTime()) {
    return 'End time must be after start time.';
  }

  if (startDateTime.getTime() <= Date.now()) {
    return `${label} must be for a future date and time. Please choose another date.`;
  }

  return '';
};

export const compareAppointmentsByStart = (first, second) => {
  const firstStart = getAppointmentStartDateTime(first);
  const secondStart = getAppointmentStartDateTime(second);

  if (!firstStart && !secondStart) return 0;
  if (!firstStart) return 1;
  if (!secondStart) return -1;

  return firstStart.getTime() - secondStart.getTime();
};
