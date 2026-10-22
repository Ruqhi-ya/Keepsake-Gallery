
import { useCallback, useEffect, useState } from 'react';
import { searchPhotos } from '../services/photoApi.js';

const INITIAL_SEARCH = {
  status: 'idle',
  photos: [],
  error: null,
};

export default function useFetchPhotos(query) {
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearch(INITIAL_SEARCH);
      return undefined;
    }

    const controller = new AbortController();

    setSearch({
      status: 'loading',
      photos: [],
      error: null,
    });

    searchPhotos(query, { signal: controller.signal })
      .then((photos) => {
        if (controller.signal.aborted) return;

        setSearch({
          status: photos.length > 0 ? 'success' : 'empty',
          photos,
          error: null,
        });
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          error?.name === 'AbortError'
        ) {
          return;
        }

        setSearch({
          status: 'error',
          photos: [],
          error,
        });
      });

    return () => {
      controller.abort();
    };
  }, [query, reloadKey]);

  return {
    search,
    photos: search.photos,
    loading: search.status === 'loading',
    error: search.error,
    status: search.status,
    retry,
  };
}
