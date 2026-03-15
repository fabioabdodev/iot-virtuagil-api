export function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidCpfOrCnpj(value: string) {
  const digits = normalizeDigits(value);

  if (digits.length === 11) {
    return isValidCpf(digits);
  }

  if (digits.length === 14) {
    return isValidCnpj(digits);
  }

  return false;
}

export function isValidPhone(value: string) {
  const digits = normalizeDigits(value);
  return digits.length === 10 || digits.length === 11;
}

export function normalizeClientDocument(value?: string) {
  if (!value) return undefined;
  return normalizeDigits(value.trim());
}

export function normalizeClientPhone(value?: string) {
  if (!value) return undefined;
  return normalizeDigits(value.trim());
}

function isValidCpf(value: string) {
  if (/^(\d)\1+$/.test(value)) return false;

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(value[index]) * (10 - index);
  }

  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(value[9])) return false;

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(value[index]) * (11 - index);
  }

  check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === Number(value[10]);
}

function isValidCnpj(value: string) {
  if (/^(\d)\1+$/.test(value)) return false;

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, ...firstWeights];

  const firstDigit = calculateCnpjCheckDigit(value.slice(0, 12), firstWeights);
  if (firstDigit !== Number(value[12])) return false;

  const secondDigit = calculateCnpjCheckDigit(
    value.slice(0, 12) + String(firstDigit),
    secondWeights,
  );

  return secondDigit === Number(value[13]);
}

function calculateCnpjCheckDigit(value: string, weights: number[]) {
  const sum = value
    .split('')
    .reduce((accumulator, digit, index) => accumulator + Number(digit) * weights[index], 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
