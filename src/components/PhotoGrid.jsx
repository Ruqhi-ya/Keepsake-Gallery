import PhotoCard from './PhotoCard.jsx';

// Responsive grid of photo cards (columns are set in App.css:
// 2 on mobile, 3 on tablet, 4 on desktop).
export default function PhotoGrid({ photos, favouriteIds, onOpen, onToggleFavourite, label }) {
  return (
    <ul className="photo-grid" role="list" aria-label={label}>
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          isFavourite={favouriteIds.has(photo.id)}
          onOpen={onOpen}
          onToggleFavourite={onToggleFavourite}
        />
      ))}
    </ul>
  );
}