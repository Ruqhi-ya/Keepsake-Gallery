
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import Envelope from './components/Envelope.jsx';
import SearchLanding from './components/SearchLanding.jsx';
import PhotoGrid from './components/PhotoGrid.jsx';
import PhotoModal from './components/PhotoModal.jsx';
import DecorativeBotanicals, {
  MiniSprig,
} from './components/DecorativeBotanicals.jsx';

import useFavourites from './hooks/useFavourites.js';
import useFetchPhotos from './hooks/useFetchPhotos.js';
import { hasAccessKey } from './services/photoApi.js';

import './App.css';

const SKELETON_RATIOS = [1.1, 0.8, 1.3, 0.9, 1, 0.75, 1.2, 0.85];

// The key is baked in at build time.
const KEY_MISSING = !hasAccessKey();

function describeError(error) {
  switch (error?.code) {
    case 'MISSING_KEY':
      return {
        title: 'The API key is missing',
        message:
          'Add your Unsplash access key to a .env file as VITE_UNSPLASH_ACCESS_KEY, then restart the dev server. The README explains each step.',
        canRetry: false,
      };

    case 'INVALID_KEY':
      return {
        title: 'Unsplash didn’t accept the key',
        message:
          'Check that VITE_UNSPLASH_ACCESS_KEY holds your Access Key (not the Secret Key), then restart the dev server.',
        canRetry: false,
      };

    case 'RATE_LIMIT':
      return {
        title: 'The hourly limit has been reached',
        message:
          'Unsplash allows a limited number of requests per hour for demo apps. Please try again a little later.',
        canRetry: true,
      };

    case 'NETWORK':
      return {
        title: 'Couldn’t reach Unsplash',
        message: 'Check your internet connection and try again.',
        canRetry: true,
      };

    default:
      return {
        title: 'Something went wrong',
        message:
          error?.message || 'The photographs couldn’t be loaded.',
        canRetry: true,
      };
  }
}

function StateCard({
  title,
  message,
  role = 'status',
  action,
}) {
  return (
    <div className="state" role={role}>
      <MiniSprig className="state__sprig" />
      <h3 className="state__title">{title}</h3>
      <p className="state__text">{message}</p>
      {action}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ul className="skeleton-grid" aria-hidden="true">
      {SKELETON_RATIOS.map((ratio, index) => (
        <li
          key={index}
          className="skeleton-card"
          style={{ '--ratio': ratio }}
        >
          <span />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  // 'welcome' means the envelope is showing.
  // 'revealed' means the envelope has opened.
  const [stage, setStage] = useState('welcome');
  const [envelopeMounted, setEnvelopeMounted] = useState(true);

  const [query, setQuery] = useState('');
  const [view, setView] = useState('results');
  const [selected, setSelected] = useState(null);

  // Custom hooks manage photo fetching and favourites.
  const { search, loading, retry } = useFetchPhotos(query);

  const {
    favourites,
    favouriteIds,
    toggleFavourite,
  } = useFavourites();

  const appRef = useRef(null);
  const scrollPositions = useRef({
    results: 0,
    favourites: 0,
  });

  const revealed = stage === 'revealed';
  const modalOpen = selected !== null;
  const compact = query !== '' || view === 'favourites';

  // Keep the background inaccessible while the envelope
  // or photo modal is active.
  useLayoutEffect(() => {
    if (appRef.current) {
      appRef.current.inert = !revealed || modalOpen;
    }
  }, [revealed, modalOpen]);

  // Restore the scroll position when switching views.
  useLayoutEffect(() => {
    window.scrollTo(
      0,
      scrollPositions.current[view] || 0,
    );
  }, [view]);

  const handleReveal = useCallback(() => {
    setStage('revealed');
  }, []);

  const handleEnvelopeDone = useCallback(() => {
    setEnvelopeMounted(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  const switchView = useCallback(
    (next) => {
      if (next === view) return;

      scrollPositions.current[view] = window.scrollY;
      setView(next);
    },
    [view],
  );

  const handleToggleFavouritesView = useCallback(() => {
    switchView(
      view === 'favourites' ? 'results' : 'favourites',
    );
  }, [switchView, view]);

  const handleSearch = useCallback(
    (keyword) => {
      // Start each new search at the top of the results.
      scrollPositions.current.results = 0;

      if (view !== 'results') {
        scrollPositions.current[view] = window.scrollY;
        setView('results');
      }

      if (
        keyword.toLowerCase() === query.toLowerCase()
      ) {
        // Retry if the same keyword previously failed.
        if (search.status === 'error') {
          retry();
        }

        return;
      }

      setQuery(keyword);
    },
    [query, search.status, view, retry],
  );

  function renderResults() {
    if (
      search.status === 'idle' ||
      search.status === 'loading'
    ) {
      return <SkeletonGrid />;
    }

    if (search.status === 'error') {
      const info = describeError(search.error);

      return (
        <StateCard
          role="alert"
          title={info.title}
          message={info.message}
          action={
            info.canRetry ? (
              <button
                type="button"
                className="btn"
                onClick={retry}
              >
                Try again
              </button>
            ) : null
          }
        />
      );
    }

    if (search.status === 'empty') {
      return (
        <StateCard
          title={`Nothing found for “${query}”`}
          message="Try a simpler or more common word, like “flowers” or “mountains”."
        />
      );
    }

    return (
      <PhotoGrid
        photos={search.photos}
        favouriteIds={favouriteIds}
        onOpen={setSelected}
        onToggleFavourite={toggleFavourite}
        label={`Photographs for ${query}`}
      />
    );
  }

  function renderResultsMeta() {
    if (
      search.status === 'loading' ||
      search.status === 'idle'
    ) {
      return 'Gathering photographs…';
    }

    if (search.status === 'success') {
      const count = search.photos.length;

      return `${count} ${
        count === 1 ? 'photograph' : 'photographs'
      }`;
    }

    return '';
  }

  return (
    <>
      {envelopeMounted && (
        <Envelope
          onReveal={handleReveal}
          onDone={handleEnvelopeDone}
        />
      )}

      <div className={`app app--${stage}`} ref={appRef}>
        <DecorativeBotanicals subdued={compact} />

        <main className="app__content">
          <SearchLanding
            compact={compact}
            loading={loading}
            query={query}
            onSearch={handleSearch}
            favouriteCount={favourites.length}
            favouritesOpen={view === 'favourites'}
            onToggleFavourites={handleToggleFavouritesView}
            keyMissing={KEY_MISSING}
            autoFocus={revealed}
          />

          {compact && (
            <section
              className="gallery"
              aria-labelledby="gallery-title"
            >
              {view === 'favourites' ? (
                <>
                  <div className="gallery__head">
                    <div>
                      <h2
                        id="gallery-title"
                        className="gallery__title"
                      >
                        Your <em>favourites</em>
                      </h2>

                      <p
                        className="gallery__meta"
                        role="status"
                      >
                        {favourites.length} saved
                      </p>
                    </div>

                    {query && (
                      <button
                        type="button"
                        className="linkbtn"
                        onClick={handleToggleFavouritesView}
                      >
                        ← Back to “{query}”
                      </button>
                    )}
                  </div>

                  {favourites.length === 0 ? (
                    <StateCard
                      title="No favourites yet"
                      message="Tap the heart on any photograph to keep it here."
                    />
                  ) : (
                    <PhotoGrid
                      photos={favourites}
                      favouriteIds={favouriteIds}
                      onOpen={setSelected}
                      onToggleFavourite={toggleFavourite}
                      label="Your favourite photographs"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="gallery__head">
                    <div>
                      <h2
                        id="gallery-title"
                        className="gallery__title"
                      >
                        Photographs for <em>“{query}”</em>
                      </h2>

                      <p
                        className="gallery__meta"
                        role="status"
                      >
                        {renderResultsMeta()}
                      </p>
                    </div>
                  </div>

                  {renderResults()}
                </>
              )}

              <p className="gallery__credit">
                Photographs come from Unsplash photographers.
                Open any photo to see its credit.
              </p>
            </section>
          )}
        </main>
      </div>

      {modalOpen && (
        <PhotoModal
          photo={selected}
          isFavourite={favouriteIds.has(selected.id)}
          onToggleFavourite={toggleFavourite}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
