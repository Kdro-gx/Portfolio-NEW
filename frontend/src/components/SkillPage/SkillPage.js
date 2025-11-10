import { React, useState, useEffect } from "react";
import { zoomIn, fadeIn } from "../../services/variants";
import "../../styles/SkillPage.css";
import SkillGraphCarousel from "./SkillGraph";
import SkillSection from "./SkillSection";
import { fetchSkillGraphs } from "../../services/skillGraphService";
import { motion } from "framer-motion";

function SkillPage({ isBatterySavingOn, isWindowModalVisible }) {
  const [skillGraphs, setSkillGraphs] = useState([]);

  useEffect(() => {
    const loadSkillGraphs = async () => {
      try {
        const fetchedGraphs = await fetchSkillGraphs();
        const graphsToUse = Array.isArray(fetchedGraphs) ? fetchedGraphs : [];
        setSkillGraphs(graphsToUse);
      } catch (error) {
        console.error("Error fetching skill graphs:", error);
        setSkillGraphs([]);
      }
    };

    loadSkillGraphs();
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const skillBox = document.querySelector(".skill-box");
      if (!skillBox) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      skillBox.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <section
      className="skill-container"
      id="skills"
      style={{ overflow: "visible" }}
    >
      <motion.div
        className="skill-div"
        variants={isBatterySavingOn ? {} : zoomIn(0)}
        initial="show"
        whileInView="show"
        exit="hidden"
        style={
          isWindowModalVisible
            ? { opacity: 0, transition: "opacity 0.5s ease-in-out" }
            : { opacity: 1, transition: "opacity 0.5s ease-in-out" }
        }
      >
        <div className="skill-box">
          <motion.h2
            className="skill-heading"
            variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
            initial="hidden"
            animate="show"
          >
            Skills
          </motion.h2>
          <motion.div className="skill-section">
            <motion.div
              className="skill-carousel-container"
              variants={isBatterySavingOn ? {} : zoomIn(0)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              <SkillSection isBatterySavingOn={isBatterySavingOn} />
            </motion.div>
            {skillGraphs.length > 0 ? (
              <motion.div
                className="skill-graph-carousel"
                variants={isBatterySavingOn ? {} : zoomIn(0)}
                initial="show"
                animate="show"
                exit="hidden"
              >
                <SkillGraphCarousel
                  skills={skillGraphs}
                  isBatterySavingOn={isBatterySavingOn}
                />
              </motion.div>
            ) : (
              <div style={{
                color: '#edeeef',
                textAlign: 'center',
                padding: '20px',
                fontSize: '14px',
                opacity: 0.7
              }}>
                {/* Debug message - remove after graphs are working */}
                No skill graphs found. Create them in the admin panel.
                <br/>
                <small>Graph count: {skillGraphs.length}</small>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default SkillPage;
