import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/CarouselYearNavigator.css";

const CarouselYearNavigator = ({
  years,
  selectedYear,
  onYearSelect,
  yearBackgrounds,
  isBatterySavingOn
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update currentIndex when selectedYear changes
  useEffect(() => {
    if (selectedYear && years.length > 0) {
      const index = years.findIndex(year => year.toString() === selectedYear.toString());
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedYear, years]);

  // Handle next button click
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % years.length;
    setCurrentIndex(nextIndex);
    onYearSelect(years[nextIndex]);
  };

  // Handle previous button click
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + years.length) % years.length;
    setCurrentIndex(prevIndex);
    onYearSelect(years[prevIndex]);
  };

  // Handle direct year selection
  const handleYearClick = (year, index) => {
    setCurrentIndex(index);
    onYearSelect(year);
  };

  if (!years || years.length === 0) {
    return null;
  }

  // Get visible years (current + 2 on each side for preview)
  const getVisibleYears = () => {
    const visible = [];
    const totalYears = years.length;

    // Show 5 years total: 2 before, active, 2 after
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + totalYears) % totalYears;
      visible.push({
        year: years[index],
        offset: i,
        index: index
      });
    }

    return visible;
  };

  const visibleYears = getVisibleYears();

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <div className="carousel-year-navigator">
      {/* Previous Button */}
      <button
        className="carousel-nav-btn prev"
        onClick={handlePrev}
        aria-label="Previous year"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Year Cards Container */}
      <div className="carousel-track">
        <AnimatePresence mode="popLayout">
          {visibleYears.map(({ year, offset, index }) => {
            const isActive = offset === 0;
            const backgroundImage = yearBackgrounds[year];

            return (
              <motion.div
                key={`${year}-${offset}-${index}`}
                className={`carousel-year-card ${isActive ? 'active' : ''} offset-${offset}`}
                variants={isBatterySavingOn ? {} : cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleYearClick(year, index)}
                style={{
                  backgroundImage: backgroundImage
                    ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`
                    : 'linear-gradient(135deg, rgba(120, 47, 64, 0.8), rgba(244, 129, 31, 0.8))'
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 1, 0.5, 1]
                }}
              >
                <div className="year-card-content">
                  <span className="year-number">{year}</span>
                  {isActive && (
                    <motion.div
                      className="active-indicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="4" fill="currentColor"/>
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <button
        className="carousel-nav-btn next"
        onClick={handleNext}
        aria-label="Next year"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Year Counter */}
      <div className="year-counter">
        <span className="current-position">{String(currentIndex + 1).padStart(2, '0')}</span>
        <span className="separator">/</span>
        <span className="total-years">{String(years.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default CarouselYearNavigator;
