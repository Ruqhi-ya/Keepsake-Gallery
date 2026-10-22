// Unsplash search service.
// Docs: https://unsplash.com/documentation#search-photos

const ENDPOINT = 'https://api.unsplash.com/search/photos';
const PLACEHOLDER_KEY = 'your_unsplash_access_key_here';

// Successful searches are remembered for this session so that repeating a
// keyword never costs another request (demo keys are limited per hour).
const cache = new Map();

export class PhotoApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'PhotoApiError';
    this.code = code;
    this.status = status;
  }
}

function getAccessKey() {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  return typeof key === 'string' ? key.trim() : '';
}

export function hasAccessKey() {
  const key = getAccessKey();
  return key !== '' && key !== PLACEHOLDER_KEY;
}

function tidy(text) {
  if (typeof text !== 'string') return '';
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : '';
}

// Unsplash asks apps to link back with these referral parameters.
function withReferral(url) {
  if (!url) return '';
  try {
    const link = new URL(url);
    link.searchParams.set('utm_source', 'keepsake_gallery');
    link.searchParams.set('utm_medium', 'referral');
    return link.toString();
  } catch {
    return '';
  }
}

// Keep only the minimum metadata the app needs (also what favourites store).
function normalisePhoto(raw) {
  if (!raw || typeof raw.id !== 'string' || !raw.urls?.small || !raw.urls?.regular) {
    return null;
  }
  const author = tidy(raw.user?.name) || 'Unknown photographer';
  const alt = tidy(raw.alt_description) || tidy(raw.description) || `Photograph by ${author}`;

  return {
    id: raw.id,
    alt,
    description: tidy(raw.description) || tidy(raw.alt_description) || '',
    thumb: raw.urls.small,
    full: raw.urls.regular,
    width: Number(raw.width) || 4,
    height: Number(raw.height) || 3,
    color: typeof raw.color === 'string' ? raw.color : '#E8D8D0',
    author,
    authorUrl: withReferral(raw.user?.links?.html),
    pageUrl: withReferral(raw.links?.html),
  };
}

async function toHttpError(response) {
  let body = '';
  try {
    body = await response.text();
  } catch {
    // ignore: the status code is enough
  }

  if (response.status === 401) {
    return new PhotoApiError('INVALID_KEY', 'Unsplash rejected the access key.', 401);
  }
  if (response.status === 429 || (response.status === 403 && /rate limit/i.test(body))) {
    return new PhotoApiError('RATE_LIMIT', 'The Unsplash rate limit was reached.', response.status);
  }
  return new PhotoApiError(
    'HTTP',
    `Unsplash responded with an error (${response.status}).`,
    response.status,
  );
}

/**
 * Search Unsplash for photos matching a keyword.
 * Pass an AbortSignal to cancel the request when it becomes obsolete.
 * Throws PhotoApiError (MISSING_KEY, INVALID_KEY, RATE_LIMIT, NETWORK, BAD_RESPONSE, HTTP)
 * or the browser's AbortError when cancelled.
 */
export async function searchPhotos(query, { signal, perPage = 20 } = {}) {
  const term = typeof query === 'string' ? query.trim() : '';
  if (!term) return [];

  if (!hasAccessKey()) {
    throw new PhotoApiError(
      'MISSING_KEY',
      'No Unsplash access key found. Set VITE_UNSPLASH_ACCESS_KEY in your .env file.',
    );
  }

  const cacheKey = term.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url = new URL(ENDPOINT);
  url.searchParams.set('query', term);
  url.searchParams.set('per_page', String(perPage));

  let response;
  try {
    response = await fetch(url, {
      signal,
      headers: {
        Authorization: `Client-ID ${getAccessKey()}`,
        'Accept-Version': 'v1',
      },
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new PhotoApiError('NETWORK', 'The network request failed.');
  }

  if (!response.ok) throw await toHttpError(response);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new PhotoApiError('BAD_RESPONSE', 'Unsplash sent a response that could not be read.');
  }

  const seen = new Set();
  const photos = (Array.isArray(data?.results) ? data.results : [])
    .map(normalisePhoto)
    .filter((photo) => photo && !seen.has(photo.id) && seen.add(photo.id));

  cache.set(cacheKey, photos);
  return photos;
}