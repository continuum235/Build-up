export const isNonEmpty = (value: string): boolean => value.trim().length > 0;

export const isValidEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  return normalized.includes("@") && normalized.includes(".");
};

export const isValidPassword = (password: string, minLength: number = 6): boolean =>
  password.length >= minLength;

export const isValidBio = (bio: string, minLength: number = 100): boolean =>
  bio.trim().length >= minLength;

export const isValidHourlyRate = (rate: string): boolean => {
  const numeric = Number(rate);
  return !Number.isNaN(numeric) && numeric > 0;
};

export const hasAtLeastOne = (items: any[]): boolean => Array.isArray(items) && items.length > 0;

interface Details {
  country: string;
  addressLine1: string;
  city: string;
}

export const isValidDetails = ({ country, addressLine1, city }: Details): boolean =>
  isNonEmpty(country || "") && isNonEmpty(addressLine1 || "") && isNonEmpty(city || "");
