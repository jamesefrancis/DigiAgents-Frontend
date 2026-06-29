// filepath: frontend/src/utils/key-mask-utils.js
export const MASK_TOKEN = '***';

export function isMaskedValue(value) {
  return typeof value === 'string' && value.includes(MASK_TOKEN);
}

export function buildKeyUpdatePayload(values = {}, initialValues = {}) {
  const payload = {};

  Object.keys(values).forEach((key) => {
    const current = values[key];
    const initial = initialValues[key];

    if (current === initial) {
      return;
    }

    if (isMaskedValue(current)) {
      return;
    }

    payload[key] = typeof current === 'string' ? current.trim() : current;
  });

  return payload;
}
