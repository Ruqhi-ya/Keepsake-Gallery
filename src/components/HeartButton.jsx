import { useState } from 'react';

export function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// Favourite toggle shared by the photo cards and the preview modal.
// The favourite state lives in useFavourites, so every copy stays in sync.
export default function HeartButton({ photo, isFavourite, onToggle, inline = false }) {
  const [pop, setPop] = useState(false);

  function handleClick(event) {
    // Never let a heart click reach a parent that opens the preview.
    event.stopPropagation();
    if (!isFavourite) setPop(true);
    onToggle(photo);
  }

  return (
    <button
      type="button"
      className={`heart${inline ? ' heart--inline' : ''}${pop ? ' heart--pop' : ''}`}
      aria-pressed={isFavourite}
      aria-label={`Favourite: ${photo.alt}`}
      onClick={handleClick}
      onAnimationEnd={() => setPop(false)}
    >
      <HeartIcon />
    </button>
  );
}