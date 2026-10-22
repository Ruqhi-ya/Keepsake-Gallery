
import { useCallback, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'keepsake-gallery.favourites.v1';

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

function readStoredFavourites() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return [];

    const seen = new Set();

    return data
      .filter(
        (photo) =>
          isValidPhoto(photo) &&
          !seen.has(photo.id) &&
          seen.add(photo.id)
      )
      .map(toStoredPhoto);
  } catch {
    return [];
  }
}

// useReducer manages changes to the favourites list.
function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const alreadyFavourite = state.some(
        (photo) => photo.id === action.photo.id
      );

      if (alreadyFavourite) {
        return state.filter(
          (photo) => photo.id !== action.photo.id
        );
      }

      return [toStoredPhoto(action.photo), ...state];
    }

    default:
      return state;
  }
}

export default function useFavourites() {
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    readStoredFavourites
  );

  // Save favourites whenever the list changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favourites)
      );
    } catch {
      // The app can still work if storage is unavailable.
    }
  }, [favourites]);

  // Quickly check whether a photo is a favourite.
  const favouriteIds = useMemo(
    () => new Set(favourites.map((photo) => photo.id)),
    [favourites]
  );

  // Dispatch an action to add or remove a favourite.
  const toggleFavourite = useCallback((photo) => {
    dispatch({ type: 'TOGGLE', photo });
  }, []);

  return { favourites, favouriteIds, toggleFavourite };
}
