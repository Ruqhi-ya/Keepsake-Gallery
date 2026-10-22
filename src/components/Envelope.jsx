import { useEffect, useRef, useState } from 'react';
import { Flower, MiniSprig } from './DecorativeBotanicals.jsx';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Welcome screen: a burgundy envelope built from HTML and CSS shapes.
//
// phase: 'closed' -> 'opening' (seal fades, flap turns, letter rises)
//        -> 'leaving' (screen fades away, onReveal fires so the search screen can appear)
// onDone fires once the fade has finished, so the parent can unmount this screen.
export default function Envelope({ onReveal, onDone }) {
  const [phase, setPhase] = useState('closed');
  const startedRef = useRef(false); // blocks repeated clicks from restarting the animation
  const timersRef = useRef([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Focus the envelope so keyboard users can press Enter or Space straight away.
    buttonRef.current?.focus({ preventScroll: true });

    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  function openEnvelope() {
    if (startedRef.current) return;
    startedRef.current = true;
    setPhase('opening');

    const reduced = prefersReducedMotion();
    timersRef.current.push(
      setTimeout(
        () => {
          setPhase('leaving');
          onReveal();
        },
        reduced ? 200 : 1350,
      ),
      setTimeout(() => onDone(), reduced ? 400 : 1850),
    );
  }

  return (
    <section className={`welcome welcome--${phase}`} aria-label="Welcome">
      <div className="welcome__stage">
        <div className="envelope">
          <div className="envelope__art" aria-hidden="true">
            <div className="env__back" />

            <div className="env__letter">
              <div className="env__letter-inner">
                <MiniSprig className="env__sprig" />
                <span className="env__letter-title">Keepsake</span>
                <span className="env__letter-sub">a small collection of photographs</span>
              </div>
            </div>

            <div className="env__pocket" />

            <div className="env__flap-shadow">
              <span />
            </div>

            <div className="env__flap">
              <span className="env__flap-face env__flap-front" />
              <span className="env__flap-face env__flap-back" />
            </div>

            <div className="env__seal">
              <svg
                viewBox="-20 -20 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <Flower s={0.95} r={8} />
              </svg>
            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            className="envelope__hit"
            onClick={openEnvelope}
            aria-label="Open your letter"
            aria-disabled={phase !== 'closed'}
          />
        </div>

        <p className="welcome__hint">
          <span className="welcome__hint-title">A little something awaits</span>
          <span className="welcome__hint-sub">Open your letter</span>
        </p>
      </div>
    </section>
  );
}