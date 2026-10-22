import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'keepsake-gallery.favourites.v1';

// Only these fields are stored: the minimum needed to render a saved photo.
function toStoredPhoto(photo) {
  return {
    id: photo.id,
    alt: photo.alt,
    description: photo.description || '',
    thumb: photo.thumb,
    full: photo.full,
    width: Number(photo.width) || 4,
    height: Number(photo.height) || 3,
    color: photo.color || '#E8D8D0',
    author: photo.author || '',
    authorUrl: photo.authorUrl || '',
    pageUrl: photo.pageUrl || '',
  };
}

function isValidPhoto(photo) {
  return (
    photo !== null &&
    typeof photo === 'object' &&
    typeof photo.id === 'string' &&
    typeof photo.alt === 'string' &&
    typeof photo.thumb === 'string' &&
    typeof photo.full === 'string'
  );
}

// Reads saved favourites; corrupt or unexpected data falls back to an empty list.
function readStoredFavourites() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    const seen = new Set();
    return data
      .filter((photo) => isValidPhoto(photo) && !seen.has(photo.id) && seen.add(photo.id))
      .map(toStoredPhoto);
  } catch {
    return [];
  }
}

export default function useFavourites() {
  const [favourites, setFavourites] = useState(readStoredFavourites);

  // Persist after every change. Storage can fail (private mode, quota), so ignore errors.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // The session still works; favourites just will not survive a refresh.
    }
  }, [favourites]);

  const favouriteIds = useMemo(() => new Set(favourites.map((photo) => photo.id)), [favourites]);

  // Newest favourite first. Stable identity so memoised cards do not re-render.
  const toggleFavourite = useCallback((photo) => {
    setFavourites((current) =>
      current.some((item) => item.id === photo.id)
        ? current.filter((item) => item.id !== photo.id)
        : [toStoredPhoto(photo), ...current],
    );
  }, []);

  return { favourites, favouriteIds, toggleFavourite };
}