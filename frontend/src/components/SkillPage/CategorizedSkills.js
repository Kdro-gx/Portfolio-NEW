import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zoomIn, fadeIn } from "../../services/variants";
import { fetchSkills } from "../../services/skillService";
import "../../styles/CategorizedSkills.css";

const CategorizedSkills = ({ isBatterySavingOn }) => {
  const [skillsData, setSkillsData] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        console.log("CategorizedSkills: Starting to fetch skills...");
        const fetchedSkills = await fetchSkills();
        console.log("CategorizedSkills: Fetched skills:", fetchedSkills);
        setSkillsData(fetchedSkills);
        // Set first category as active by default
        const firstCategory = Object.keys(fetchedSkills)[0];
        console.log("CategorizedSkills: First category:", firstCategory);
        setActiveCategory(firstCategory);
        setLoading(false);
      } catch (error) {
        console.error("CategorizedSkills: Error fetching skills:", error);
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  const getProgressBarColor = (level) => {
    if (level >= 90) return "#EE7624"; // FAMU Orange for expert
    if (level >= 80) return "#CEB888"; // FSU Gold for advanced
    if (level >= 70) return "#782F40"; // FSU Garnet for intermediate
    return "#1B5633"; // FAMU Green for beginner
  };

  const getProficiencyLabel = (level) => {
    if (level >= 90) return "Expert";
    if (level >= 80) return "Advanced";
    if (level >= 70) return "Intermediate";
    return "Beginner";
  };

  if (loading) {
    return (
      <div className="skills-loading">
        <h2 style={{ color: '#EE7624', textAlign: 'center', padding: '2rem' }}>
          Loading skills...
        </h2>
      </div>
    );
  }

  if (Object.keys(skillsData).length === 0) {
    return (
      <div className="skills-loading">
        <h2 style={{ color: '#FF0000', textAlign: 'center', padding: '2rem' }}>
          No skills data found. Check console for errors.
        </h2>
      </div>
    );
  }

  const categories = Object.keys(skillsData);

  return (
    <div className="categorized-skills-container">
      {/* Category Navigation */}
      <div className="category-nav">
        {categories.map((category, index) => (
          <motion.button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
            variants={isBatterySavingOn ? {} : fadeIn("up", 0.1 * index)}
            initial="hidden"
            animate="show"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Skills Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="skills-content"
          variants={isBatterySavingOn ? {} : zoomIn(0.2)}
          initial="hidden"
          animate="show"
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          <h3 className="category-title">{activeCategory}</h3>

          <div className="skills-grid">
            {skillsData[activeCategory]?.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="skill-card"
                variants={isBatterySavingOn ? {} : fadeIn("up", 0.1 * index)}
                initial="hidden"
                animate="show"
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 10px 25px rgba(${getProgressBarColor(skill.level)}, 0.3)`
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="skill-header">
                  <span className="skill-icon">{skill.icon}</span>
                  <div className="skill-info">
                    <h4 className="skill-name">{skill.name}</h4>
                    <span className="skill-level-label">
                      {getProficiencyLabel(skill.level)}
                    </span>
                  </div>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>

                <div className="progress-container">
                  <motion.div
                    className="progress-bar"
                    style={{
                      backgroundColor: getProgressBarColor(skill.level),
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: 0.2 * index }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CategorizedSkills;