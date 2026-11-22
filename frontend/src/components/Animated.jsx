import { useEffect, useRef, useState } from 'react';

const BLOBS = [
  { color: 'rgba(99,102,241,0.45)', size: 460, top: '-12%', left: '-8%', delay: '0s', duration: '19s' },
  { color: 'rgba(168,85,247,0.35)', size: 380, top: '55%', left: '-12%', delay: '-6s', duration: '23s' },
  { color: 'rgba(14,165,233,0.35)', size: 420, top: '8%', left: '62%', delay: '-3s', duration: '21s' },
  { color: 'rgba(16,185,129,0.25)', size: 340, top: '68%', left: '68%', delay: '-9s', duration: '25s' },
];

/** Animated gradient mesh that reacts to the mouse (JS parallax + CSS drift). */
export function AnimatedBackground() {
  const layer = useRef(null);

  useEffect(() => {
    let frame;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 46;
      ty = (e.clientY / window.innerHeight - 0.5) * 46;
    };

    const loop = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      if (layer.current) {
        layer.current.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#080b1c]">
      <div ref={layer} className="absolute inset-[-10%]">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="animate-blob absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              top: b.top,
              left: b.left,
              background: b.color,
              filter: 'blur(90px)',
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080b1c]/80" />
    </div>
  );
}

/** Card with JS-driven 3D tilt on mouse move. */
export function TiltCard({ children, className = '' }) {
  const card = useRef(null);

  const onMove = (e) => {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-5px)`;
  };

  const onLeave = () => {
    if (card.current) card.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
  };

  return (
    <div
      ref={card}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/** Cycles through words with a small JS-driven fade. */
export function useRotatingWord(words, interval = 2400) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  return words[index];
}
