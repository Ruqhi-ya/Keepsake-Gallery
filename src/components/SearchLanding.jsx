import { useEffect, useRef } from 'react';
import SearchBar from './SearchBar.jsx';
import { HeartIcon } from './HeartButton.jsx';

function FavouritesButton({ count, pressed, onClick }) {
  return (
    <button
      type="button"
      className="favbtn"
      aria-pressed={pressed}
      aria-label={`Favourites, ${count} saved`}
      onClick={onClick}
    >
      <HeartIcon />
      <span className="favbtn__label">Favourites</span>
      <span className="favbtn__count" aria-hidden="true">
        {count}
      </span>
    </button>
  );
}

// The search header. It is one persistent element in two states:
//  - centred on the page, with the editorial intro (landing)
//  - compact at the top, with a favourites control beside it (after a search)
// CSS transitions between the two, so the search bar glides upward.
export default function SearchLanding({
  compact,
  loading,
  query,
  onSearch,
  favouriteCount,
  favouritesOpen,
  onToggleFavourites,
  keyMissing,
  autoFocus,
}) {
  const introRef = useRef(null);

  // While the intro is collapsed, keep its contents out of reach of keyboard and screen readers.
  // (Set through the DOM property so it behaves the same in React 18 and 19.)
  useEffect(() => {
    if (introRef.current) introRef.current.inert = compact;
  }, [compact]);

  return (
    <section className={`landing${compact ? ' landing--compact' : ''}`} aria-label="Search">
      <h1 className="sr-only">Keepsake Gallery</h1>

      <div className="landing__intro" ref={introRef}>
        <p className="landing__kicker" aria-hidden="true">
          Keepsake Gallery
        </p>
        <h2 className="landing__title">
          Find something <em>beautiful</em>
        </h2>
        <svg
          className="landing__scribble"
          viewBox="0 0 220 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 10 C30 2 52 14 80 7 S130 3 156 9 S196 6 216 9" />
        </svg>
        <p className="landing__lede">
          Search a single word and gather the photographs you love into a little collection of your
          own.
        </p>

        {keyMissing && (
          <p className="landing__notice" role="status">
            No Unsplash API key found. Add <code>VITE_UNSPLASH_ACCESS_KEY</code> to your{' '}
            <code>.env</code> file and restart the dev server.
          </p>
        )}

        {favouriteCount > 0 && (
          <button type="button" className="linkbtn" onClick={onToggleFavourites}>
            View your {favouriteCount} saved {favouriteCount === 1 ? 'keepsake' : 'keepsakes'}
          </button>
        )}
      </div>

      <div className="landing__bar">
        <SearchBar
          key="search"
          initialValue={query}
          loading={loading}
          onSearch={onSearch}
          autoFocus={autoFocus}
        />
        {compact && (
          <FavouritesButton
            count={favouriteCount}
            pressed={favouritesOpen}
            onClick={onToggleFavourites}
          />
        )}
      </div>
    </section>
  );
}