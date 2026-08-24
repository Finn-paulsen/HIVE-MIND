function isValidCoordinate(lat, lon) {
  return Number.isFinite(lat)
    && Number.isFinite(lon)
    && lat >= -90
    && lat <= 90
    && lon >= -180
    && lon <= 180;
}

function normalizeDecimal(value, hemisphere) {
  const numeric = Math.abs(Number(value));

  if (!Number.isFinite(numeric)) {
    return Number.NaN;
  }

  if (hemisphere === 'S' || hemisphere === 'W') {
    return -numeric;
  }

  return numeric;
}

function convertDms(degrees, minutes = 0, seconds = 0, hemisphere) {
  const decimal = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600;
  return normalizeDecimal(decimal, hemisphere);
}

function parseDirectionalDecimal(input) {
  const matches = [...input.toUpperCase().matchAll(/([NSEW])\s*(-?\d+(?:\.\d+)?)/g)];

  if (matches.length !== 2) {
    return null;
  }

  const first = matches[0];
  const second = matches[1];
  const lat = first[1] === 'N' || first[1] === 'S' ? normalizeDecimal(first[2], first[1]) : Number.NaN;
  const lon = second[1] === 'E' || second[1] === 'W' ? normalizeDecimal(second[2], second[1]) : Number.NaN;

  if (!isValidCoordinate(lat, lon)) {
    return null;
  }

  return { lat, lon };
}

function parseDms(input) {
  const normalized = input
    .replace(/[′’]/g, "'")
    .replace(/[″“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  const pattern = /(\d{1,3})°\s*(\d{1,2})(?:'\s*(\d{1,2}(?:\.\d+)?)")?\s*'?\s*([NS])(?:\s|,)+?(\d{1,3})°\s*(\d{1,2})(?:'\s*(\d{1,2}(?:\.\d+)?)")?\s*'?\s*([EW])/;
  const match = normalized.match(pattern);

  if (!match) {
    return null;
  }

  const lat = convertDms(match[1], match[2], match[3] || 0, match[4]);
  const lon = convertDms(match[5], match[6], match[7] || 0, match[8]);

  if (!isValidCoordinate(lat, lon)) {
    return null;
  }

  return { lat, lon };
}

function parseDecimalPair(input) {
  const cleaned = input.trim().replace(/,/g, ' ');
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length !== 2) {
    return null;
  }

  const lat = Number(parts[0]);
  const lon = Number(parts[1]);

  if (!isValidCoordinate(lat, lon)) {
    return null;
  }

  return { lat, lon };
}

export function parseCoordinates(input) {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  return parseDms(trimmed) || parseDirectionalDecimal(trimmed) || parseDecimalPair(trimmed);
}

export function isCoordinateQuery(input) {
  return parseCoordinates(input) !== null;
}
