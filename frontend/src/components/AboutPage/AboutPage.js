import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { zoomIn, fadeIn } from "../../services/variants";
import { styled } from "@stitches/react";
import axios from "axios";
import "../../styles/AboutPage.css";
import { SpotlightBG } from "./SpotlightBG";

const API_URL = process.env.REACT_APP_API_URI;

// Default fallback data
const defaultAboutData = [
  {
    icon: "bx bxs-hourglass about-icon",
    title: "Coding Hours",
    subtitle: "1300+ Hours",
  },
  {
    icon: "bx bx-trophy about-icon",
    title: "Completed",
    subtitle: "42+ Projects",
  },
  {
    icon: "bx bx-support about-icon",
    title: "LeetCode",
    subtitle: "246+ Solutions",
  },
];

const defaultProfileInfo = {
  name: "Kale Sinclair",
  role: "FAMU-FSU COE, B.S in Biomedical Engineering",
  description: "I'm Kale Sinclair, a Biomedical Engineering student at the FAMU-FSU College of Engineering, passionate about creating impactful biomedical solutions and technologies. My journey is driven by curiosity and a commitment to continuous learning through projects, research, and real-world applications.",
  profileImage: "/Kale-Profile-Photo.jpg"
};

function AboutPage({ isBatterySavingOn, isWindowModalVisible, addTab }) {
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [profileInfo, setProfileInfo] = useState(defaultProfileInfo);
  const [resumeURL, setResumeURL] = useState("/Kale_Sinclair_Resume.pdf");

  // Load about data from API
  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const response = await axios.get(`${API_URL}/aboutme`);
        if (response.data) {
          if (response.data.aboutData) {
            setAboutData(response.data.aboutData);
          }
          if (response.data.profileInfo) {
            setProfileInfo(response.data.profileInfo);
          }
        }
      } catch (error) {
        console.error('Error loading about data:', error);
        // Keep using default data on error
      }
    };

    loadAboutData();
  }, []);

  // Load resume URL from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`);
        if (response.data && response.data.resumeURL) {
          setResumeURL(response.data.resumeURL);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const aboutDiv = document.querySelector(".about-content");
      if (!aboutDiv) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 750 && screenWidth > 576) {
        scaleValue = screenHeight / 750;
      }
      aboutDiv.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 52; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };
  return (
    <section className="about-section-container" id="about">
      <SpotlightBG />
      <motion.div
        variants={isBatterySavingOn ? {} : zoomIn(0)}
        initial="show"
        whileInView="show"
        exit="hidden"
        className="about-div"
        style={
          isWindowModalVisible
            ? { opacity: 0, transition: "opacity 0.5s ease-in-out" }
            : { opacity: 1, transition: "opacity 0.5s ease-in-out" }
        }
      >
        <div className="about-content glass">
          <h2 className="section-title">ABOUT ME</h2>
          <div className="about-container">
            {/* Row 1: Photo and Description side by side */}
            <motion.div className="about-row">
              <motion.img
                src={profileInfo.profileImage.startsWith('data:')
                  ? profileInfo.profileImage
                  : `${process.env.PUBLIC_URL}${profileInfo.profileImage}`
                }
                className="about-image"
                alt="Profile"
                variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial="hidden"
                whileInView="show"
                exit="hidden"
              />
              <motion.div
                className="about-description-box"
                variants={isBatterySavingOn ? {} : fadeIn("left", 200, 0)}
                initial="hidden"
                whileInView="show"
                exit="hidden"
              >
                <span className="about-name">{profileInfo.name}</span>
                <p className="about-role">
                  {profileInfo.role}
                </p>
                <p className="about-description">
                  {profileInfo.description}
                </p>
              </motion.div>
            </motion.div>

            {/* Row 2: All buttons horizontally in single row */}
            <motion.div className="about-row">
              <motion.div
                className="button-container"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                whileInView="show"
                exit="hidden"
              >
                <motion.a>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("skills");
                    }}
                  >
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Skills</ButtonLabel>
                  </StyledButton>
                </motion.a>
                <motion.a>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("projects");
                    }}
                  >
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Projects</ButtonLabel>
                  </StyledButton>
                </motion.a>
                <motion.a
                  href={resumeURL}
                  download="Kale-Sinclair-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-cv"
                  style={{ userSelect: "none" }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <StyledButton>
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Resume</ButtonLabel>
                  </StyledButton>
                </motion.a>
                <motion.a>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("experience");
                    }}
                  >
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Experience</ButtonLabel>
                  </StyledButton>
                </motion.a>
                <motion.a>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      addTab("FeedTab", { title: "Kale's Feed" });
                    }}
                  >
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Feed</ButtonLabel>
                  </StyledButton>
                </motion.a>
                <motion.a>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      // AI functionality removed
                    }}
                  >
                    <ButtonShadow />
                    <ButtonEdge />
                    <ButtonLabel>Contact Me</ButtonLabel>
                  </StyledButton>
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default AboutPage;

// Styled Components for Custom Button
// Styled Components (Stitches / similar) for a responsive Custom Button

const ButtonPart = styled("span", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: 5,
});

const ButtonShadow = styled(ButtonPart, {
  background: "hsl(0deg 0% 0% / 0.1)",
  borderRadius: 5,
  transform: "translateY(2px)",
  transition: "transform 250ms ease-out",
});

const ButtonEdge = styled(ButtonPart, {
  background: "#1B5633", // FAMU Green outline to match Enter Portfolio
  borderRadius: 5,
});

const ButtonLabel = styled("span", {
  fontFamily: "Montserrat",
  fontSize: "18px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#CEB888", // FSU Gold text to match Enter Portfolio
  padding: "0.75rem 1.5rem",
  background: "#782F40", // FSU Garnet background to match Enter Portfolio
  transform: "translateY(-4px)",
  width: "100%",
  userSelect: "none",
  transition:
    "transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease",

  "&:hover": {
    backgroundColor: "#EE7624", // FAMU Orange hover
    color: "#CEB888", // Keep FSU Gold text on hover
    transform: "scale(1.05)",
  },

  // ——————————————————————————————
  // Responsive adjustments
  "@media (max-width: 992px)": {
    fontSize: "15px",
    padding: "0.6rem 1.2rem",
  },
  "@media (max-width: 576px)": {
    fontSize: "12px",
    padding: "0.5rem 1rem",
  },
  // ——————————————————————————————
});

const StyledButton = styled("button", {
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 5,
  background: "transparent",
  position: "relative",
  padding: 0,
  transition: "filter 250ms ease-out",

  "&:hover": {
    filter: "brightness(110%)",

    [`& ${ButtonLabel}`]: {
      transform: "translateY(-6px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(4px)",
    },
  },

  "&:active": {
    [`& ${ButtonLabel}`]: {
      transform: "translateY(-2px)",
      transition: "transform 34ms",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(1px)",
      transition: "transform 34ms",
    },
  },
});
