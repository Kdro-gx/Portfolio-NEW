import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zoomIn, fadeIn } from "../../services/variants";

const JourneyTimeline = ({ isBatterySavingOn }) => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const timelineRef = useRef(null);

  // Timeline events data (2021 - Present)
  const timelineEvents = [
    {
      year: 2021,
      quarter: "Q1",
      title: "Started College Journey",
      description: "Began Associate degree program, laying foundation for academic success",
      type: "education",
      color: "#782F40", // FSU Garnet
      icon: "🎓"
    },
    {
      year: 2021,
      quarter: "Q3",
      title: "First Job Experience",
      description: "Started working at The Speakeasy Leather Co. as a Leather Worker",
      type: "career",
      color: "#F4811F", // FAMU Orange
      icon: "💼"
    },
    {
      year: 2022,
      quarter: "Q2",
      title: "Academic Achievement",
      description: "Completed Associate in Arts General Education Degree",
      type: "achievement",
      color: "#008344", // FAMU Green
      icon: "🏆"
    },
    {
      year: 2022,
      quarter: "Q3",
      title: "Career Transition",
      description: "Moved to Circle K Gas Station as Night Shift Cashier Assistant",
      type: "career",
      color: "#CEB888", // FSU Gold
      icon: "💼"
    },
    {
      year: 2022,
      quarter: "Q4",
      title: "Community Service",
      description: "Started volunteer work with Salvation Army, giving back to community",
      type: "service",
      color: "#5CB8B2", // FSU Additional
      icon: "❤️"
    },
    {
      year: 2023,
      quarter: "Q1",
      title: "Professional Growth",
      description: "Advanced to Professional Tax Preparer at Jackson Hewitt Tax Service",
      type: "career",
      color: "#782F40", // FSU Garnet
      icon: "💼"
    },
    {
      year: 2023,
      quarter: "Q2",
      title: "Life-Saving Certification",
      description: "Obtained BLS (Basic Life Support) Certification from American Heart Association",
      type: "certification",
      color: "#F4811F", // FAMU Orange
      icon: "🏥"
    },
    {
      year: 2023,
      quarter: "Q4",
      title: "Athletic Excellence",
      description: "Won 'The Best Vs The Best' competition, showcasing competitive spirit",
      type: "achievement",
      color: "#008344", // FAMU Green
      icon: "🥇"
    },
    {
      year: 2024,
      quarter: "Q1",
      title: "Healthcare Career",
      description: "Started as Therapy Technician at PT Solutions Physical Therapy",
      type: "career",
      color: "#CEB888", // FSU Gold
      icon: "💼"
    },
    {
      year: 2024,
      quarter: "Q2",
      title: "Academic Honor",
      description: "Received the prestigious Beine Award for academic excellence",
      type: "achievement",
      color: "#5CB8B2", // FSU Additional
      icon: "🏆"
    },
    {
      year: 2024,
      quarter: "Q3",
      title: "University Transfer",
      description: "Transferred to FAMU-FSU College of Engineering for Biomedical Engineering",
      type: "education",
      color: "#782F40", // FSU Garnet
      icon: "🎓"
    },
    {
      year: 2025,
      quarter: "Q1",
      title: "Present Day",
      description: "Continuing biomedical engineering studies while working and volunteering",
      type: "current",
      color: "#F4811F", // FAMU Orange
      icon: "🌟"
    }
  ];

  // Navigate to specific year
  const navigateToYear = (year) => {
    setCurrentYear(year);
    const element = document.getElementById(`year-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Generate year navigation buttons
  const years = [2021, 2022, 2023, 2024, 2025];

  // Timeline animations
  const timelineVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const eventVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.8 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="journey-timeline-container"
      variants={isBatterySavingOn ? {} : timelineVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Year Navigation */}
      <motion.div
        className="timeline-navigation"
        variants={isBatterySavingOn ? {} : fadeIn("down", 200, 0)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h3>Navigate My Journey</h3>
        <div className="year-buttons">
          {years.map((year) => (
            <motion.button
              key={year}
              className={`year-button ${currentYear === year ? 'active' : ''}`}
              onClick={() => navigateToYear(year)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {year}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Timeline Path */}
      <div className="timeline-wrapper" ref={timelineRef}>
        <div className="timeline-path">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={`${event.year}-${event.quarter}`}
              id={`year-${event.year}`}
              className="timeline-event"
              variants={isBatterySavingOn ? {} : eventVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
              custom={index}
              onClick={() => setSelectedEvent(event)}
            >
              {/* Event Node */}
              <div
                className="event-node"
                style={{ backgroundColor: event.color }}
              >
                <span className="event-icon">{event.icon}</span>
              </div>

              {/* Event Content */}
              <div className="event-content">
                <div className="event-header">
                  <span className="event-year">{event.year}</span>
                  <span className="event-quarter">{event.quarter}</span>
                </div>
                <h4 className="event-title">{event.title}</h4>
                <p className="event-description">{event.description}</p>
                <span className="event-type">{event.type}</span>
              </div>

              {/* Connecting Line */}
              {index < timelineEvents.length - 1 && (
                <motion.div
                  className="timeline-connector"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                />
              )}
            </motion.div>
          ))}
        </div>
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
              style={{ borderColor: selectedEvent.color }}
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
                  style={{ backgroundColor: selectedEvent.color }}
                >
                  {selectedEvent.icon}
                </span>
                <div className="modal-title-area">
                  <h3>{selectedEvent.title}</h3>
                  <span className="modal-date">
                    {selectedEvent.year} {selectedEvent.quarter}
                  </span>
                </div>
              </div>
              <div className="modal-content">
                <p>{selectedEvent.description}</p>
                <span className="modal-type">{selectedEvent.type}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JourneyTimeline;