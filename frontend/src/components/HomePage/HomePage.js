import React, { useState, useEffect, useRef } from "react";
import { styled } from "@stitches/react";
import { TypeAnimation } from "react-type-animation";
// import { Parallax } from "react-parallax";
import { useSpring, animated } from "@react-spring/web";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { zoomIn } from "../../services/variants";
import AnimatedBackground from "./AnimatedBackground";
import "../../styles/HomePage.css";

function HomePage({ isBatterySavingOn, scrolled, addTab, sendQuery }) {
  const [clicked, setClicked] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const clickCount = useRef(0); // Use useRef to keep track of click count across renders
  const [key, setKey] = useState(0); // State to reset the animation on click
  const [frameIndex, setFrameIndex] = useState(0); // Track current frame index
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const frames = ["", " frame1", " frame2", " frame3"]; // Define frame styles
  // Removed unused useScroll setup to eliminate hydration warnings

  const handleProfileClick = () => {
    setFrameIndex((prevIndex) => (prevIndex + 1) % frames.length); // Cycle frames
  };

  const keywords = [
    "Engineering Dominance | Calculated Strikes",
    "Biomedical Engineering | Competitive Boxing",
  ];

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 10;
    const y = (clientY - (rect.top + rect.height / 2)) / 10;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const { boxShadow } = useSpring({
    boxShadow: clicked
      ? "0px 15px 30px rgba(0, 0, 0, 0.3)"
      : "0px 8px 15px rgba(0, 0, 0, 0.1)",
    config: { duration: 100, tension: 300, friction: 10 },
    onRest: () => setClicked(false),
  });

  const handleClick = () => {
    if (isCooldown) return; // Prevent clicks during cooldown

    setClicked(true); // Trigger animation
    clickCount.current += 1;

    if (clickCount.current >= 5) {
      setIsCooldown(true);
      clickCount.current = 0; // Reset click count after reaching the limit

      // End cooldown after 2 seconds
      setTimeout(() => {
        setIsCooldown(false);
      }, 1000);
    }
  };

  // Effect to reset click count if no further clicks are registered within 5 seconds
  useEffect(() => {
    if (clickCount.current > 0 && !isCooldown) {
      const resetTimeout = setTimeout(() => {
        clickCount.current = 0;
      }, 5000);

      return () => clearTimeout(resetTimeout); // Clean up timeout
    }
  }, [isCooldown]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 52; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
      duration: 10000,
    });
  };

  // Search functionality removed with AI chat

  useEffect(() => {
    const updateScale = () => {
      const homeRow = document.querySelector(".home-row");
      const infoRow = document.querySelector(".info");
      if (!homeRow || !infoRow) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      homeRow.style.zoom = `${scaleValue}`;
      infoRow.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <AnimatePresence>
      <div key="homepage-bg-wrapper" className="homepage-bg-wrapper">
        <AnimatedBackground />
      </div>
      <section key="homepage-container" className="homepage-container" id="home">
        <div
          className="container"
          // style={{ zoom: "80%", height: "calc(100vh -52px)" }}
        >
          <div className="home-div">
            <div className="home-row" style={{ zIndex: 100000 }}>
              <motion.div
                className={`profile-picture-container`}
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                dragTransition={{
                  bounceStiffness: 250,
                  bounceDamping: 15,
                }}
                transition={{ scale: { delay: 0, type: "spring" } }}
                whileTap={isBatterySavingOn ? {} : { scale: 1.1 }}
                whileInView={"show"}
              >
                <animated.img
                  src={`${process.env.PUBLIC_URL}/Kale-Profile-Photo.jpg`}
                  alt="Profile"
                  className={`profile-picture img-circle${frames[frameIndex]}`}
                  draggable="false"
                  style={{
                    boxShadow,
                    transform: isBatterySavingOn
                      ? {}
                      : isHovering
                      ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.03, 1.03, 1.03)`
                      : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                    transition: "transform 0.1s ease-out",
                    height: "250px !important",
                    width: "250px !important",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    handleClick();
                    handleProfileClick();
                  }}
                />
              </motion.div>
            </div>
            <div className="home-row info" style={{ zIndex: 99999 }}>
              <motion.h1
                className="name"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
              >
                Kale Sinclair
              </motion.h1>

              {/* Changing Text Animation */}
              <motion.div
                className="changing-text-container"
                onClick={() => setKey((prevKey) => prevKey + 1)}
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
              >
                <em>
                  <span className="changing-text">
                    <TypeAnimation
                      key={key} // Forces the component to re-render on click
                      className="changing-text-animation"
                      sequence={[
                        1500,
                        ...keywords.map((text) => [text, 3000]).flat(), // Typing each keyword with a pause
                      ]}
                      speed={{ type: "keyStrokeDelayInMs", value: 17 }} // Fast typing
                      deletionSpeed={{ type: "keyStrokeDelayInMs", value: 8 }}
                      // delay={1000}
                      repeat={Infinity} // Infinite repeat for continuous cycling
                      cursor={true}
                    />
                  </span>
                </em>
              </motion.div>

              {/* AI chat form removed */}

              {/* Styled "Enter Portfolio" Button */}
              <motion.div
                className="enter-button-motioned"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="hidden"
                animate="show"
                whileHover={{
                  scale: 1.05,
                  transition: { scale: { delay: 0, type: "spring" } },
                }}
                whileTap={{
                  scale: 1,
                  transition: { scale: { delay: 0, type: "spring" } },
                }}
                // drag="false"
                // dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                // dragElastic={0.3}
                // dragTransition={{
                //   bounceStiffness: 250,
                //   bounceDamping: 15,
                // }}
              >
                <StyledButton
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("about");
                  }}
                >
                  <ButtonShadow />
                  <ButtonEdge />
                  <ButtonLabel>Enter Portfolio</ButtonLabel>
                </StyledButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </AnimatePresence>
  );
}

export default HomePage;

// Styled Components for Button
const ButtonPart = styled("span", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: 8,
});

const ButtonShadow = styled(ButtonPart, {
  background: "hsl(0deg 0% 0% / 0.1)",
  transform: "translateY(2px)",
  transition: "transform 250ms ease-out",
});

const ButtonEdge = styled(ButtonPart, {
  background: "#1B5633", // FAMU Green outline
});

const ButtonLabel = styled("span", {
  fontFamily: "Montserrat",
  fontSize: "18px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#CEB888", // FSU Gold text
  padding: "1rem 2rem",
  background: "#782F40", // FSU Garnet background
  transform: "translateY(-4px)",
  width: "100%",
  userSelect: "none",
  transition:
    "transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease",

  "&:hover": {
    backgroundColor: "#EE7624", // Keep current orange hover
    color: "#CEB888", // Keep current gold hover text
    transform: "scale(1.05)",
  },
});

const StyledButton = styled("button", {
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  position: "relative",
  padding: 0,
  transition: "filter 250ms ease-out",

  "&:hover": {
    filter: "brightness(110%)",

    [`& ${ButtonLabel}`]: {
      transform: "translateY(-8px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(6px)",
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
