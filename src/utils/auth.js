const LICENSE_KEY_NAME = 'sparkiq_license_key';

export const saveLicense = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LICENSE_KEY_NAME, key);
  }
};

export const getLicense = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LICENSE_KEY_NAME);
  }
  return null;
};

export const clearLicense = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LICENSE_KEY_NAME);
  }
};

export const hasValidLicense = () => {
  return !!getLicense();
};
