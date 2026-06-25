import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./ImageCarousel.css";


import img1 from "../img/img1.jpg";
import img2 from "../img/img2.jpg";
import img3 from "../img/img3.jpg";
import img4 from "../img/img4.jpg";

import img11 from "../img/img11.jpg";
import img22 from "../img/img22.jpg";
import img33 from "../img/img33.jpg";
import img44 from "../img/img44.jpg";


const images = [img1,img11, img2,img22, img3,img33, img4,img44];

export default function ImageCarousel({ interval = 10000  }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="carousel-wrap">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`Estudante a aprender línguas ${index + 1}`}
          className="carousel-image"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* indicadores */}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}