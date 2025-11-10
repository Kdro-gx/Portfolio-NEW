import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../../services/variants";
import { fetchTimeline, fetchTimelineYears } from "../../services/timelineService";
import CarouselYearNavigator from "./CarouselYearNavigator";
import CanvasTimelineView from "./CanvasTimelineView";
import "../../styles/HorizontalJourneyTimeline.css";

const HorizontalJourneyTimeline = ({ isBatterySavingOn }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch timeline data from API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);

        const [eventsData, yearsData] = await Promise.all([
          fetchTimeline(),
          fetchTimelineYears()
        ]);

        setTimelineEvents(eventsData);

        // Sort years in ASCENDING order (earliest first: 2021, 2022, 2023, etc.)
        const sortedYears = yearsData
          .map(year => year === 'Current' ? new Date().getFullYear() : parseInt(year))
          .sort((a, b) => a - b)
          .map(year => year.toString());

        setAvailableYears(sortedYears);

        // Set EARLIEST year as default if available
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
      } catch (error) {
        console.error("Error fetching timeline data:", error);
        console.warn("Falling back to static timeline data");
        // Fallback to static data if API fails
        setTimelineEvents(fallbackEvents);
        // Sort fallback years in ASCENDING order
        setAvailableYears(['2021', '2022', '2023', '2024', '2025']);
        setSelectedYear('2021'); // Set earliest year as default
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  // Fallback static data with connections
  const fallbackEvents = [
    {
      year: 2021,
      quarter: "Q1",
      title: "Started College Journey",
      subject: "Academic Foundation",
      body: "Began Associate degree program, laying foundation for academic success. This marked the beginning of my formal higher education journey.",
      category: "education",
      color: "#782F40",
      icon: "🎓",
      connections: []
    },
    {
      year: 2023,
      quarter: "Q4",
      title: "Athletic Excellence",
      subject: "Competitive Achievement",
      body: "Won 'The Best Vs The Best' competition, showcasing competitive spirit and dedication to physical fitness.",
      category: "achievement",
      color: "#008344",
      icon: "🥇",
      connections: [0] // Connected to college journey
    },
    {
      year: 2024,
      quarter: "Q3",
      title: "University Transfer",
      subject: "Engineering Pursuit",
      body: "Transferred to FAMU-FSU College of Engineering for Biomedical Engineering. Major milestone in academic journey.",
      category: "education",
      color: "#782F40",
      icon: "🎓",
      connections: [0] // Connected to initial college start
    },
    {
      year: 2025,
      quarter: "Q1",
      title: "Present Day",
      subject: "Current Focus",
      body: "Continuing biomedical engineering studies while working and volunteering. Focused on developing technical skills.",
      category: "current",
      color: "#F4811F",
      icon: "🌟",
      connections: [2] // Connected to university transfer
    }
  ];

  // Build yearBackgrounds object from timeline events
  const yearBackgrounds = {};
  timelineEvents.forEach(event => {
    const eventYear = event.year.toString();
    // Use the first event's yearBackgroundImage for each year (if not already set)
    if (!yearBackgrounds[eventYear] && event.yearBackgroundImage) {
      yearBackgrounds[eventYear] = event.yearBackgroundImage;
    }
  });

  // Filter events by selected year
  const filteredEvents = timelineEvents.filter(event => {
    // Ensure robust comparison by converting both values
    const eventYear = typeof event.year === 'string' ? parseInt(event.year) : event.year;
    const filterYear = typeof selectedYear === 'string' ? parseInt(selectedYear) : selectedYear;
    return eventYear === filterYear;
  });

  // Scroll to year function
  const scrollToYear = (year) => {
    setSelectedYear(year);
  };

  // Color mapping for categories
  const getCategoryColor = (category) => {
    const colorMap = {
      education: "#782F40",    // FSU Garnet
      career: "#F4811F",       // FAMU Orange
      achievement: "#008344",   // FAMU Green
      certification: "#CEB888", // FSU Gold
      service: "#5CB8B2",      // Additional
      current: "#F4811F"       // FAMU Orange
    };
    return colorMap[category] || "#782F40";
  };

  // Timeline animations
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const eventVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (index) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  const yearButtonVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="horizontal-journey-container">
        <div className="journey-loading">
          <div className="loading-spinner"></div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className="horizontal-journey-container"
      id="journey"
      variants={isBatterySavingOn ? {} : containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Section Header */}
      <motion.div
        className="journey-header"
        variants={isBatterySavingOn ? {} : fadeIn("up", 200, 0)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h2 className="journey-title">My Journey</h2>
        <p className="journey-subtitle">
          Follow my path from college beginnings to biomedical engineering
        </p>
      </motion.div>

      {/* Controls Row */}
      <div className="timeline-controls">
        {/* Carousel Year Navigation */}
        <CarouselYearNavigator
          years={availableYears}
          selectedYear={selectedYear}
          onYearSelect={scrollToYear}
          yearBackgrounds={yearBackgrounds}
          isBatterySavingOn={isBatterySavingOn}
        />
      </div>

      {/* Canvas Timeline Container */}
      <div className="timeline-container">
        {loading ? (
          <div className="loading-message">
            <p>Loading timeline events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <CanvasTimelineView
            events={filteredEvents}
            onEventClick={setSelectedEvent}
            showConnections={true}
            getCategoryColor={getCategoryColor}
            isBatterySavingOn={isBatterySavingOn}
          />
        ) : (
          <div className="no-events-message">
            <p>No events found for {selectedYear}</p>
            <p>Debug: Total events: {timelineEvents.length}, Selected year: {selectedYear}</p>
            {timelineEvents.length > 0 && (
              <div>
                <p>Available event years: {timelineEvents.map(e => e.year).join(', ')}</p>
                <p>First event: {timelineEvents[0]?.title} ({timelineEvents[0]?.year})</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="event-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              className="event-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{ borderColor: selectedEvent.color || getCategoryColor(selectedEvent.category) }}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
              <div className="modal-header">
                <span
                  className="modal-icon"
                  style={{ backgroundColor: selectedEvent.color || getCategoryColor(selectedEvent.category) }}
                >
                  {selectedEvent.icon || (selectedEvent.category === 'education' ? '🎓' :
                                          selectedEvent.category === 'career' ? '💼' :
                                          selectedEvent.category === 'achievement' ? '🏆' : '⭐')}
                </span>
                <div className="modal-title-area">
                  <h3>{selectedEvent.title}</h3>
                  {selectedEvent.subject && (
                    <h4 className="modal-subject">{selectedEvent.subject}</h4>
                  )}
                  <span className="modal-date">
                    {selectedEvent.year} {selectedEvent.quarter}
                  </span>
                </div>
              </div>
              <div className="modal-content">
                <p>{selectedEvent.body || selectedEvent.description || 'No detailed description available.'}</p>
                <span className="modal-type">{selectedEvent.category}</span>
                {selectedEvent.image && (
                  <div className="modal-image">
                    <img src={selectedEvent.image} alt={selectedEvent.title} />
                  </div>
                )}
                {selectedEvent.connections && selectedEvent.connections.length > 0 && (
                  <div className="modal-connections">
                    <h5>Connected Events:</h5>
                    <div className="connection-list">
                      {selectedEvent.connections.map((connectionIndex, idx) => {
                        const connectedEvent = filteredEvents[connectionIndex];
                        return connectedEvent ? (
                          <span key={idx} className="connection-tag">
                            {connectedEvent.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default HorizontalJourneyTimeline;