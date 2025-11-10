import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
// import { zoomIn } from "../../services/variants";
import "../../styles/Links.css";
import { animated } from "@react-spring/web";

const Links = ({ isBatterySavingOn, isWindowModalVisible }) => {
  const API_URL = process.env.REACT_APP_API_URI;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [linksData, setLinksData] = useState([
    {
      href: "https://github.com/Kdro-gx",
      icon: require("../../assets/img/icons/github.png"),
      label: "GitHub",
    },
    {
      href: "https://www.linkedin.com/in/kalesinclair",
      icon: require("../../assets/img/icons/linkedin.png"),
      label: "LinkedIn",
    },
    {
      href: "https://calendly.com/kale-sinclair7",
      icon: require("../../assets/img/icons/calender.png"),
      label: "Book Time with Kale",
    },
    {
      href: "mailto:krs24d@fsu.edu",
      icon: require("../../assets/img/icons/email.png"),
      label: "School Email",
    },
    {
      href: "mailto:Kale.sinclair7@gmail.com",
      icon: require("../../assets/img/icons/email.png"),
      label: "Personal Email",
    },
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`);
        if (response.data && response.data.socialLinks && response.data.socialLinks.length > 0) {
          // Map the social links to the format expected by Links component
          const mappedLinks = response.data.socialLinks.map(link => ({
            href: link.href,
            icon: link.icon.startsWith('/') ? require(`../../assets${link.icon}`) : link.icon,
            label: link.label
          }));
          setLinksData(mappedLinks);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleScroll = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      });
      window.addEventListener("scroll", handleScroll);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    const updateScale = () => {
      const linksContent = document.querySelector(".links-content");
      if (!linksContent) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      linksContent.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="links-content" ref={menuRef}>
      {/* Parent Button */}
      <motion.div
        className={`link-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        style={isWindowModalVisible ? { display: "none" } : { display: "flex" }}
        title="Links"
        initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.3}
        dragTransition={{
          bounceStiffness: 250,
          bounceDamping: 15,
        }}
        whileInView={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
        whileHover={isBatterySavingOn ? {} : { scale: 1.1 }}
        whileTap={isBatterySavingOn ? {} : { scale: 0.9 }}
        transition={isBatterySavingOn ? {} : { delay: 0, type: "spring" }}
      >
        <animated.img
          src={require("../../assets/img/icons/links.png")}
          alt="Links"
          className="icon-img"
          draggable="false"
          loading="eager"
        />
      </motion.div>

      {/* Child Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="links-menu"
            initial={isBatterySavingOn ? {} : { opacity: 0 }}
            animate={isBatterySavingOn ? {} : { opacity: 1 }}
            exit={isBatterySavingOn ? {} : { opacity: 0 }}
            transition={
              isBatterySavingOn ? {} : { duration: 0.3, ease: "easeInOut" }
            }
          >
            {linksData.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-item"
                whileHover={isBatterySavingOn ? {} : { scale: 1.1 }}
                whileTap={isBatterySavingOn ? {} : { scale: 0.9 }}
                transition={isBatterySavingOn ? {} : { duration: 0.5 }}
              >
                <animated.img
                  draggable="false"
                  src={link.icon}
                  alt={link.label}
                  className="icon-img"
                  loading="eager"
                />
                <motion.span
                  className="link-label"
                  initial={isBatterySavingOn ? {} : { opacity: 0, x: -20 }}
                  animate={isBatterySavingOn ? {} : { opacity: 1, x: 0 }}
                  exit={isBatterySavingOn ? {} : { opacity: 0, x: -20 }}
                  transition={isBatterySavingOn ? {} : { delay: 0.3 }}
                >
                  {link.label}
                </motion.span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Links;
