# Keepsake Gallery

A small photo gallery built to feel like opening a personal envelope full of photographs. It is a React + Vite app with a handmade-stationery look: warm ivory paper, burgundy details, and tiny botanical doodles.

## What it does

1. **Envelope welcome screen.** An envelope built from HTML and CSS opens with a short animation: the seal fades, the flap swings back, and the letter rises.
2. **Search screen.** A single search bar sits in the middle of a calm, uncluttered page.
3. **Gallery.** Submitting a keyword (for example `sunset` or `flowers`) searches Unsplash. The search bar glides up to the top and the matching photographs appear in a responsive grid.
4. **Favourites.** Every photo has a heart. Favourites are saved in your browser's `localStorage`, so they are still there after a refresh.
5. **Preview.** Clicking a photo opens a large preview over the blurred gallery. It closes with the close button, a click on the backdrop, or the Escape key.

## Tech stack

- React 18 or 19 (whichever your Vite project uses)
- Vite
- Plain JavaScript and CSS (CSS variables for the theme)
- The browser Fetch API
- `localStorage`

There are no UI libraries, no backend and no database.

## Setup

### 1. Install dependencies

From the project folder:

```bash
npm install
```

### 2. Get an Unsplash API key

1. Create a free account at <https://unsplash.com/developers>.
2. Open **Your apps** and choose **New Application**.
3. Accept the terms and give the app a name.
4. Copy the **Access Key**. Do not use the Secret Key.

### 3. Add the key to a `.env` file

In the project root (the folder that contains `package.json`), create a file named exactly `.env`:

```
VITE_UNSPLASH_ACCESS_KEY=paste_your_access_key_here
```

`.env.example` shows the same variable with a placeholder. The `.env` file is listed in `.gitignore`, so it will not be committed. **Never commit a real key.**

> **Restart the dev server after creating or editing `.env`.** Vite reads environment variables only when it starts.

Vite embeds `VITE_` variables in the code sent to the browser, so the Access Key is visible to anyone who inspects the site. That is normal for Unsplash Access Keys, but it is another reason to keep your Secret Key out of this project entirely.

### 4. Start the development server

```bash
npm run dev
```

Open the address shown in the terminal (usually <http://localhost:5173>).

### 5. Build for production

```bash
npm run build
```

The finished site is written to the `dist/` folder. To look at the production build locally:

```bash
npm run preview
```

If you deploy the site, set `VITE_UNSPLASH_ACCESS_KEY` in your host's environment settings before building.

## Project structure

```
src/
  components/
    DecorativeBotanicals.jsx   Corner sprigs, flowers and bow; also exports Flower and MiniSprig
    Envelope.jsx               The animated welcome envelope
    SearchLanding.jsx          The search header (centred, then compact) and favourites button
    SearchBar.jsx              The stationery-styled search field
    PhotoGrid.jsx              Responsive grid of photo cards
    PhotoCard.jsx              One photo, with its favourite heart
    HeartButton.jsx            Favourite toggle used by cards and the modal
    PhotoModal.jsx             Preview dialog with a blurred backdrop
  hooks/
    useFavourites.js           Favourite state, saved safely to localStorage
  services/
    photoApi.js                Unsplash search, errors and in-session cache
  App.jsx                      Ties the screens together
  App.css                      Component styles
  index.css                    Colour palette, fonts, paper texture, base styles
  main.jsx                     Entry point
```

## How it works

**Search.** `App.jsx` holds the submitted keyword. Whenever it changes, an effect calls `searchPhotos` in `photoApi.js`. Each request gets an `AbortController`; when a newer search starts, the older request is cancelled, so a slow response can never replace newer results. Empty searches never reach the API, and a keyword you have already searched this session is served from a small in-memory cache. Loading, empty, error and missing-key states each show their own message instead of a blank screen.

**Favourites.** `useFavourites` stores the minimum needed to redraw a saved photo (id, image URLs, size, text and credit). It is written to `localStorage` after every change. If the stored data is missing or corrupted, the app quietly starts with an empty list. Because the grid, the favourites view and the modal all read the same state, a heart is always in sync everywhere. The heart button sits beside the card's open button rather than inside it, so clicking it never opens the preview.

**Preview modal.** The modal is a custom accessible dialog. It moves keyboard focus into the dialog, keeps Tab inside it, and returns focus to the photo you opened when it closes. While it is open, the page behind it cannot scroll and cannot be reached by keyboard or screen reader. Closing it returns you to the same results (or favourites) and the same scroll position.

**Envelope and search transition.** The flap turns with CSS 3D transforms (`perspective`, `transform-origin`, `backface-visibility`), and `z-index` changes halfway through so the flap folds behind the letter. Repeated clicks are ignored once the animation starts. The search header is one persistent element: after a search, CSS shrinks its height so the centred search bar glides to the top while the heading collapses.

## Accessibility and motion

- Semantic landmarks, labelled controls and visible keyboard focus.
- The envelope, search, hearts and modal all work from the keyboard.
- With `prefers-reduced-motion` turned on, animations are reduced to instant changes, and everything still works.
- The grid, header and modal adapt to desktop, tablet and mobile widths.

## Troubleshooting

- **"No Unsplash API key found."** Check that `.env` is in the project root, that the variable name is exactly `VITE_UNSPLASH_ACCESS_KEY`, and that you restarted `npm run dev`.
- **"Unsplash didn't accept the key."** Make sure you copied the Access Key, not the Secret Key.
- **"The hourly limit has been reached."** Unsplash demo applications are limited to a small number of requests per hour. Wait a while and try again.
- **Fonts look different.** The fonts (Cormorant Garamond and DM Sans) load from Google Fonts. Offline, the app falls back to Georgia and system fonts.

## Credits

Photographs are provided by [Unsplash](https://unsplash.com/?utm_source=keepsake_gallery&utm_medium=referral) photographers. Each photo's preview links to its photographer and its Unsplash page.