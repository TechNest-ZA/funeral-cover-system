export interface SaIdCheck {
  valid: boolean;
  dateOfBirth: Date | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Validates the Luhn checksum on a 13-digit SA ID number and extracts date of birth. */
export function checkSaId(id: string): SaIdCheck {
  if (!/^\d{13}$/.test(id)) {
    return { valid: false, dateOfBirth: null };
  }

  const digits = id.split('').map(Number);

  let oddSum = 0;
  for (let i = 0; i < 12; i += 2) oddSum += digits[i];

  const evenConcat = [1, 3, 5, 7, 9, 11].map((i) => digits[i]).join('');
  const doubledEven = String(Number(evenConcat) * 2);
  const evenSum = doubledEven.split('').reduce((sum, d) => sum + Number(d), 0);

  const checkDigit = (10 - (oddSum + evenSum) % 10) % 10;
  const checksumValid = checkDigit === digits[12];

  const yy = Number(id.slice(0, 2));
  const month = Number(id.slice(2, 4));
  const day = Number(id.slice(4, 6));
  const currentYy = new Date().getFullYear() % 100;
  const century = yy <= currentYy ? 2000 : 1900;

  const dateOfBirth = new Date(century + yy, month - 1, day);
  const dateValid =
    dateOfBirth.getFullYear() === century + yy &&
    dateOfBirth.getMonth() === month - 1 &&
    dateOfBirth.getDate() === day;

  return {
    valid: checksumValid && dateValid,
    dateOfBirth: dateValid ? dateOfBirth : null,
  };
}

export function formatDateOfBirth(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}
