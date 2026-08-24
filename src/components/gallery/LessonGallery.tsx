'use client';
import { useState, useCallback, useEffect } from 'react';

interface LessonGalleryProps {
  /** Array of image URLs to display */
  images: string[];
  /** Alt text for accessibility — lesson title or step name */
  title: string;
}

/**
 * A swipeable image gallery with left/right navigation arrows,
 * dot indicators, and keyboard support.
 * Replaces the old YouTube video embed in the lesson player.
 */
export default function LessonGallery({ images, title }: LessonGalleryProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0) setCurrent(total - 1);
      else if (idx >= total) setCurrent(0);
      else setCurrent(idx);
    },
    [total],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  if (total === 0) return null;

  return (
    <div
      className="lesson-gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} — Image gallery`}
    >
      {/* Slide viewport */}
      <div className="lesson-gallery__viewport">
        <img
          src={images[current]}
          alt={`${title} — Slide ${current + 1} of ${total}`}
          className="lesson-gallery__img"
          draggable={false}
        />

        {/* Top Progress bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'rgba(0,0,0,0.1)',
            zIndex: 3,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((current + 1) / total) * 100}%`,
              background: '#B8962E',
              transition: 'width 0.25s ease',
            }}
          />
        </div>

        {/* Left arrow */}
        {total > 1 && (
          <button
            className="lesson-gallery__arrow lesson-gallery__arrow--left"
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {total > 1 && (
          <button
            className="lesson-gallery__arrow lesson-gallery__arrow--right"
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>
        )}

        {/* Counter badge */}
        {total > 1 && (
          <span className="lesson-gallery__counter" aria-live="polite">
            {current + 1} / {total}
          </span>
        )}
      </div>

      {/* Dot indicators / Slider */}
      {total > 1 && (
        <div
          className="lesson-gallery__dots"
          role="tablist"
          aria-label="Slide indicators"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: total > 20 ? '4px' : '7px',
            marginTop: '10px',
            flexWrap: 'wrap',
            padding: '0 8px',
          }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Go to slide ${idx + 1}`}
              className={`lesson-gallery__dot${idx === current ? ' lesson-gallery__dot--active' : ''}`}
              style={{
                width: total > 20 ? (idx === current ? '16px' : '6px') : (idx === current ? '18px' : '8px'),
                height: total > 20 ? '6px' : '8px',
                borderRadius: '4px',
                border: 'none',
                background: idx === current ? '#B8962E' : 'rgba(100, 116, 139, 0.3)',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
