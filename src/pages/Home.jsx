import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    '/images/slide1.png',
    '/images/slide2.jpg',
    '/images/slide3.jpeg',
    '/images/slide4.jpeg',
    '/images/slide5.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBookClick = () => navigate('/movies');

  return (
    <div className="home-container">
      <Navbar />
      <div className="slideshow">
        <img
          src={images[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="slide-image"
        />
        <div className="overlay">
          <h1 className="cta-text">Book Tickets Now!</h1>
          <button className="cta-button" onClick={handleBookClick}>
            Explore Shows
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
