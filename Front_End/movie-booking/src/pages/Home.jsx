import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKDROPS, shuffle } from '../utils/stills';
import '../styles/Home.css';

const SLIDE_MS = 6000;
const TITLE = 'Book Tickets Now!';
const GENRES = ['Action', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi', 'Horror', 'Animation', 'Drama'];

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [images] = useState(() => shuffle(BACKDROPS));

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [currentSlide, images.length]);

  return (
    <div className="home-container">
      <div className="slideshow">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`slide-image ${i === currentSlide ? 'active' : ''}`}
          />
        ))}

        <div className="vignette" />
        <div className="beam beam-left" />
        <div className="beam beam-right" />
        <div className="grain" />

        <div className="overlay">
          <p className="eyebrow">★ Now Showing at CineBook ★</p>

          <div className="marquee">
            <h1 className="cta-text" aria-label={TITLE}>
              {[...TITLE].map((ch, i) => (
                <span key={i} className="letter" style={{ '--i': i }} aria-hidden="true">
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </h1>
          </div>

          <p className="tagline">
            Blockbusters, premieres &amp; late-night shows. Grab the best seats before they're gone.
          </p>

          <button className="cta-button" onClick={() => navigate('/movies')}>
            <span className="cta-label">Explore Shows</span>
            <span className="cta-stub" aria-hidden="true">→</span>
          </button>
        </div>

        <div className="slide-progress">
          {images.map((src, i) => (
            <button
              key={src}
              className={`progress-bar ${i === currentSlide ? 'active' : ''} ${i < currentSlide ? 'done' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Show slide ${i + 1}`}
            >
              <span key={i === currentSlide ? currentSlide : 'idle'} />
            </button>
          ))}
        </div>

        <div className="film-strip" aria-hidden="true">
          <div className="film-track">
            {[...GENRES, ...GENRES].map((g, i) => (
              <span key={i}>{g}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
