import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { zoomIn, fadeIn } from "../../services/variants";
import axios from "axios";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import "@glidejs/glide/dist/css/glide.theme.min.css";
import "../../styles/SkillDisplay.css";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";

const API_URL = process.env.REACT_APP_API_URI;

const proficiencyColors = {
  Proficient: "rgba(201, 176, 55, 0.6)",
  Intermediate: "rgba(176, 176, 176, 0.6)",
  Beginner: "rgba(169, 113, 66, 0.6)",
  default: "rgba(176, 176, 176, 0.6)"
};

const CustomLeftArrow = ({ onClick }) => (
  <button className="custom-arrow custom-left-arrow" onClick={onClick}>
    <img src={LeftArrow} alt="Left Arrow" />
  </button>
);

const CustomRightArrow = ({ onClick }) => (
  <button className="custom-arrow custom-right-arrow" onClick={onClick}>
    <img src={RightArrow} alt="Right Arrow" />
  </button>
);

const PauseTimer = ({ autoplay, setAutoplay, countdown, setCountdown, glideRef }) => {
  const [isSmallWidth, setIsSmallWidth] = useState(window.innerWidth <= 768);
  const [isVisible, setIsVisible] = useState(isSmallWidth ? true : false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallWidth(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let startTime = performance.now();
    let interval;
    let hoverTimeout;
    let isHovered = false;

    const handleHover = () => {
      setIsVisible(true);
      if (glideRef.current) glideRef.current.pause();
      setCountdown(5.0);
      isHovered = true;

      if (hoverTimeout) clearTimeout(hoverTimeout);

      hoverTimeout = setTimeout(() => {
        setIsVisible(false);
        isHovered = false;
        if (glideRef.current) glideRef.current.play();
      }, 11000);
    };

    const handleUnhover = () => {
      isHovered = false;
      if (glideRef.current) glideRef.current.play();
      startTime = performance.now();
    };

    const glideElement = document.querySelector(".skill-display-glide");

    if (autoplay && glideElement) {
      glideElement.addEventListener("mouseenter", handleHover);
      glideElement.addEventListener("mouseleave", handleUnhover);

      interval = setInterval(() => {
        if (isHovered) {
          setCountdown(4.0);
        } else {
          const elapsed = performance.now() - startTime;
          const remaining = Math.max(4 - elapsed / 1000, 0);
          setCountdown(remaining.toFixed(1));

          if (remaining <= 0) {
            startTime = performance.now();
          }
        }
      }, 100);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(hoverTimeout);
      if (glideElement) {
        glideElement.removeEventListener("mouseenter", handleHover);
        glideElement.removeEventListener("mouseleave", handleUnhover);
      }
    };
  }, [autoplay, glideRef, setCountdown]);

  return (
    <motion.div
      className="pause-timer"
      initial={{ scale: 0, opacity: 0 }}
      animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      whileHover={{ scale: 0.99, opacity: 1 }}
      whileTap={{ scale: 1.01, opacity: 0.5 }}
      onClick={() => setAutoplay((prev) => !prev)}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <button className="pause-button" style={{ opacity: 0.7 }}>
        {autoplay ? "||" : "▶"}
      </button>
      <span className="countdown" style={{ opacity: 0.7 }}>
        {countdown}s
      </span>
    </motion.div>
  );
};

const SkillDisplay = ({ isBatterySavingOn }) => {
  const glideRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [countdown, setCountdown] = useState(4);
  const [isMediumWidth, setIsMediumWidth] = useState(
    window.innerWidth <= 992 && window.innerWidth > 768
  );
  const [isSmallWidth, setIsSmallWidth] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${API_URL}/getskills`);
        console.log("SkillDisplay: Fetched skills:", response.data);

        // Group skills by category
        const groupedSkills = response.data.reduce((acc, skill) => {
          const category = skill.category || "Uncategorized";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill);
          return {};
        }, {});

        // Sort skills within each category by sortOrder
        Object.keys(groupedSkills).forEach(category => {
          groupedSkills[category].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        });

        console.log("SkillDisplay: Grouped skills:", groupedSkills);
        setSkills(groupedSkills);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumWidth(window.innerWidth <= 992 && window.innerWidth > 768);
      setIsSmallWidth(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLeftArrowClick = () => {
    glideRef.current?.go("<");
  };

  const handleRightArrowClick = () => {
    glideRef.current?.go(">");
  };

  useEffect(() => {
    if (Object.keys(skills).length === 0) return;

    const glideElement = document.querySelector(".skill-display-glide");
    if (!glideElement) return;

    glideRef.current = new Glide(".skill-display-glide", {
      type: "carousel",
      startAt: 0,
      perView: 1,
      gap: 0,
      autoplay: autoplay ? 4000 : false,
      peek: isMediumWidth ? 50 : isSmallWidth ? 0 : 100,
      rewind: true,
    });

    glideRef.current.mount();
    return () => glideRef.current?.destroy();
  }, [skills, autoplay, isMediumWidth, isSmallWidth]);

  if (loading) {
    return (
      <div className="skill-display-loading">
        <h3>Loading skills...</h3>
      </div>
    );
  }

  if (Object.keys(skills).length === 0) {
    return (
      <div className="skill-display-empty">
        <h3>No skills found</h3>
      </div>
    );
  }

  const categories = Object.keys(skills);

  return (
    <div className="skill-display-container">
      <PauseTimer
        autoplay={autoplay}
        setAutoplay={setAutoplay}
        countdown={countdown}
        setCountdown={setCountdown}
        glideRef={glideRef}
      />

      <motion.div
        className="proficiency-legend"
        initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
        animate={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
        exit={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
        transition={isBatterySavingOn ? {} : { ease: "easeInOut", delay: 2 }}
      >
        <p className="proficient-legend">Proficient</p>
        <p className="intermediate-legend">Intermediate</p>
        <p className="beginner-legend">Beginner</p>
      </motion.div>

      <div className="skill-display-carousel">
        <div className="skill-display-glide">
          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides">
              {categories.map((category) => (
                <li className="glide__slide" key={category}>
                  <motion.div
                    className="skill-category-card"
                    viewport={{ amount: "all" }}
                  >
                    <motion.h2
                      className="skill-category-title"
                      variants={isBatterySavingOn ? {} : zoomIn(0.1)}
                      initial="hidden"
                      whileInView="show"
                      exit="hidden"
                    >
                      {category}
                    </motion.h2>

                    <div className="skill-items-grid">
                      {skills[category].map((skill, skillIndex) => (
                        <motion.div
                          key={skill._id || skillIndex}
                          className="skill-item-card"
                          variants={
                            isBatterySavingOn ? {} : zoomIn(skillIndex * 0.075)
                          }
                          initial="hidden"
                          whileInView="show"
                          exit="hidden"
                        >
                          <motion.div
                            className="skill-icon-wrapper"
                            style={{
                              boxShadow: `0 0 ${
                                window.innerWidth > 768 ? 7.5 : 2.5
                              }px ${
                                proficiencyColors[skill.proficiency] ||
                                proficiencyColors.default
                              },
                                0 0 ${window.innerWidth > 768 ? 12.5 : 5}px ${
                                proficiencyColors[skill.proficiency] ||
                                proficiencyColors.default
                              }`,
                            }}
                            animate={{
                              boxShadow: [
                                `0 0 ${window.innerWidth > 768 ? 7.5 : 2.5}px ${
                                  proficiencyColors[skill.proficiency] ||
                                  proficiencyColors.default
                                }`,
                                `0 0 ${window.innerWidth > 768 ? 12.5 : 5}px ${
                                  proficiencyColors[skill.proficiency] ||
                                  proficiencyColors.default
                                }`,
                                `0 0 ${window.innerWidth > 768 ? 7.5 : 2.5}px ${
                                  proficiencyColors[skill.proficiency] ||
                                  proficiencyColors.default
                                }`,
                              ],
                              transition: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                            }}
                          >
                            <span className="skill-icon-display">
                              {skill.icon || "🔧"}
                            </span>
                          </motion.div>

                          <motion.span
                            className={`skill-name-display ${skill.proficiency?.toLowerCase()}`}
                            variants={
                              isBatterySavingOn
                                ? {}
                                : fadeIn("left", 50, skillIndex * 0.075, 0.4)
                            }
                            initial="hidden"
                            whileInView="show"
                            exit="hidden"
                          >
                            {skill.name}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
          <div className="glide__arrows">
            <CustomLeftArrow onClick={handleLeftArrowClick} />
            <CustomRightArrow onClick={handleRightArrowClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDisplay;