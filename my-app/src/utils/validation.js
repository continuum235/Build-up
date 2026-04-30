export const isNonEmpty = (value) => value.trim().length > 0;

export const isValidEmail = (email) => {
    const normalized = email.trim().toLowerCase();
    return normalized.includes("@") && normalized.includes(".");
};

export const isValidPassword = (password, minLength = 6) => password.length >= minLength;

export const isValidBio = (bio, minLength = 100) => bio.trim().length >= minLength;

export const isValidHourlyRate = (rate) => {
    const numeric = Number(rate);
    return !Number.isNaN(numeric) && numeric > 0;
};

export const hasAtLeastOne = (items) => Array.isArray(items) && items.length > 0;

export const isValidDetails = ({ country, addressLine1, city }) =>
    isNonEmpty(country || "") && isNonEmpty(addressLine1 || "") && isNonEmpty(city || "");
