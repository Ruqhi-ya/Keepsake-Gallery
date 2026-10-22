import { useEffect, useId, useRef, useState } from 'react';

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

// Stationery-styled search field. It keeps its own text while the user types and
// only reports a keyword to the parent when the form is submitted (Enter or button).
export default function SearchBar({ initialValue = '', loading = false, onSearch, autoFocus = false }) {
  const [value, setValue] = useState(initialValue);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  // Focus the field when the welcome screen finishes (skipped on touch screens,
  // where it would pop the keyboard up over the page).
  useEffect(() => {
    if (!autoFocus || isTouchDevice()) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  function handleSubmit(event) {
    event.preventDefault();
    const keyword = value.trim();

    // An empty search never reaches the API.
    if (!keyword) {
      setShowHint(true);
      inputRef.current?.focus();
      return;
    }

    setShowHint(false);
    onSearch(keyword);
    if (isTouchDevice()) inputRef.current?.blur();
  }

  function handleChange(event) {
    setValue(event.target.value);
    if (showHint) setShowHint(false);
  }

  return (
    <form className="searchbar" role="search" onSubmit={handleSubmit} aria-busy={loading}>
      <label htmlFor={inputId} className="sr-only">
        Search photographs by keyword
      </label>

      <div className="searchbar__field">
        <svg
          className="searchbar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.8-3.8" />
        </svg>

        <input
          id={inputId}
          ref={inputRef}
          className="searchbar__input"
          type="text"
          name="q"
          value={value}
          onChange={handleChange}
          placeholder="sunset, flowers, architecture…"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          aria-describedby={showHint ? hintId : undefined}
        />

        <button type="submit" className="searchbar__btn" aria-label="Search">
          {loading && <span className="spinner" aria-hidden="true" />}
          <span className="searchbar__btn-label">{loading ? 'Searching' : 'Search'}</span>
          <svg
            className="searchbar__btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {showHint && (
        <p id={hintId} className="searchbar__hint" role="status">
          Type a word to begin, for example “sunset”.
        </p>
      )}
    </form>
  );
}