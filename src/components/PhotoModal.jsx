import { useCallback, useEffect, useRef, useState } from 'react';
import HeartButton from './HeartButton.jsx';

const CLOSE_MS = 200;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Large preview shown over the (blurred) gallery.
// Closes with the close button, a click on the backdrop, or the Escape key.
export default function PhotoModal({ photo, isFavourite, onToggleFavourite, onClose }) {
  const [closing, setClosing] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);
  const pressStartedOnBackdrop = useRef(false);

  // Plays the exit animation, then tells the parent to unmount the modal.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = setTimeout(onClose, prefersReducedMotion() ? 0 : CLOSE_MS);
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // Stop the page behind from scrolling while the modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Move focus into the dialog, and give it back to the opener when the dialog closes.
  useEffect(() => {
    const opener = document.activeElement;
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      if (opener && opener.isConnected && typeof opener.focus === 'function') {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialogRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [requestClose]);

  // Only close when the press AND the release both happened on the backdrop itself,
  // so dragging a selection out of the dialog does not close it.
  function handleBackdropMouseDown(event) {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && pressStartedOnBackdrop.current) {
      requestClose();
    }
    pressStartedOnBackdrop.current = false;
  }

  const title = photo.description || photo.alt;

  return (
    <div
      className={`modal${closing ? ' modal--closing' : ''}`}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
        ref={dialogRef}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal__close"
          onClick={requestClose}
          aria-label="Close preview"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="modal__media" style={{ backgroundColor: photo.color }}>
          {imageFailed ? (
            <p className="modal__fallback">This photograph couldn’t be loaded.</p>
          ) : (
            <img
              className="modal__img"
              src={photo.full}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="modal__caption">
          <div className="modal__caption-text">
            <h2 id="photo-modal-title" className="modal__title">
              {title}
            </h2>
            {photo.author && (
              <p className="modal__credit">
                Photo by{' '}
                {photo.authorUrl ? (
                  <a href={photo.authorUrl} target="_blank" rel="noopener noreferrer">
                    {photo.author}
                  </a>
                ) : (
                  photo.author
                )}{' '}
                on{' '}
                <a
                  href={photo.pageUrl || 'https://unsplash.com/?utm_source=keepsake_gallery&utm_medium=referral'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unsplash
                </a>
              </p>
            )}
          </div>

          <HeartButton photo={photo} isFavourite={isFavourite} onToggle={onToggleFavourite} inline />
        </div>
      </div>
    </div>
  );
}