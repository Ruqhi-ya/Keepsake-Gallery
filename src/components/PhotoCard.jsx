import { memo, useEffect, useRef, useState } from 'react';
import HeartButton from './HeartButton.jsx';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// A tiny, repeatable tilt per photo (about ±0.7°) so the grid feels hand-placed.
function tiltFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 9) - 4) * 0.18;
}

function PhotoCard({ photo, index, isFavourite, onOpen, onToggleFavourite }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageRef = useRef(null);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth > 0) setLoaded(true);
  }, []);

  // Controlled masonry: each frame keeps the photo's shape, limited to a pleasant range.
  const ratio = clamp(photo.width / photo.height, 0.75, 1.4);
  const style = {
    '--tilt': `${tiltFor(photo.id).toFixed(2)}deg`,
    '--i': index,
    '--ratio': ratio.toFixed(3),
  };

  return (
    <li className="photo-card" style={style}>
      <button
        type="button"
        className="photo-card__open"
        onClick={() => onOpen(photo)}
        aria-label={`Open preview: ${photo.alt}`}
      >
        <span className="photo-card__frame">
          <span
            className={`photo-card__media${loaded ? ' is-loaded' : ''}${failed ? ' is-failed' : ''}`}
            style={{ backgroundColor: photo.color }}
          >
            {failed ? (
              <span className="photo-card__fallback">Photo unavailable</span>
            ) : (
              <img
                ref={imageRef}
                src={photo.thumb}
                srcSet={`${photo.thumb} 400w, ${photo.full} 1080w`}
                sizes="(min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
              />
            )}
          </span>
        </span>
      </button>

      {/* A sibling of the open button (not a child), so a heart click can never open the preview. */}
      <HeartButton photo={photo} isFavourite={isFavourite} onToggle={onToggleFavourite} />
    </li>
  );
}

// Memoised: toggling one heart does not re-render every other card.
export default memo(PhotoCard);