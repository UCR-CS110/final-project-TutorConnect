export const SUBJECT_OPTIONS = [
  'Math',
  'English',
  'Science',
  'History',
  'Foreign Languages',
  'Humanities'
];

export const formatSubject = (subject) => {
  const subjectText = String(subject || '').trim();
  if (!subjectText) return '';

  return SUBJECT_OPTIONS.find((option) => option.toLowerCase() === subjectText.toLowerCase())
    || subjectText.replace(/\b\w/g, (letter) => letter.toUpperCase());
};
