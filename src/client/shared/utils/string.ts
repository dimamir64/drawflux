export function capitalizeFirstLetter(string: string) {
  if (typeof string !== 'string') {
    throw new Error('The provided input must be a string');
  }

  if (!string.length) {
    return '';
  }

  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

export const getKeyTitle = (name: string, keys: string[]) => {
  if (typeof name !== 'string') {
    throw new Error('The provided name must be a string');
  }

  const capitalizedName = name.length ? capitalizeFirstLetter(name) : '';

  if (keys.length === 1) {
    return `${capitalizedName} — ${capitalizeFirstLetter(`${keys[0]}`)}`;
  }

  return `${capitalizedName} — ${keys
    .map((key) => capitalizeFirstLetter(`${key}`))
    .join(' + ')}`;
};

export function isJsonString(string: string) {
  if (typeof string !== 'string') {
    return false;
  }

  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
}
