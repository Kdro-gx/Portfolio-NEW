import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "../../styles/SkilllGraph.css";
import { motion } from "framer-motion";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { zoomIn } from "../../services/variants";
import { Radar } from "react-chartjs-2";
import "react-multi-carousel/lib/styles.css";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

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

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 992 }, items: 1 },
  desktop: { breakpoint: { max: 992, min: 768 }, items: 1 },
  tablet: { breakpoint: { max: 768, min: 576 }, items: 1 },
  mobile: { breakpoint: { max: 576, min: 0 }, items: 1 },
};

const SkillGraph = ({ givenData, isBatterySavingOn }) => {
  // Convert scores to numbers and ensure they're valid
  const numericScores = givenData.Scores.map((score) => Number(score) || 0);
  const averageScore =
    numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length;

  const data = {
    labels: givenData.Labels,
    datasets: [
      {
        label: givenData.skillTitle,
        data: numericScores,
        backgroundColor: "rgba(108, 188, 252, 0.2)",
        borderColor: "#6cbcfc",
        borderWidth: 2,
        pointBackgroundColor: "#6cbcfc",
        pointBorderColor: "#edeeef",
        pointHoverBackgroundColor: "#edeeef",
        pointHoverBorderColor: "#6cbcfc",
        pointRadius: 4,
        pointHoverRadius: 8,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "#00D9FF", // Vibrant cyan color
          display: true,
          font: {
            size: 14,
            weight: 700,
            family: "'Montserrat', sans-serif",
          },
          backdropColor: "transparent", // Remove background highlight
          showLabelBackdrop: false, // Remove background behind ticks
        },
        angleLines: {
          color: "#edeeef",
          lineWidth: 0.5,
        },
        grid: {
          color: "rgba(237, 238, 239, 0.3)",
          circular: true,
        },
        pointLabels: {
          color: "#edeeef",
          font: {
            weight: 400,
            size: 10,
            family: "'Montserrat', sans-serif",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}`,
        },
        backgroundColor: "#212529",
        titleColor: "#6cbcfc",
        bodyColor: "#edeeef",
        borderColor: "#6cbcfc",
        borderWidth: 3,
        padding: 10,
      },
      animation: {
        duration: 2000, // 2 seconds for a full animation
        easing: "easeInOutQuad",
        // onComplete: () => console.log("Animation Complete!"),
      },
      customAverage: {
        id: "customAverage",
        beforeDraw(chart) {
          const { ctx, chartArea } = chart;
          const x = chartArea.right - 30;
          const y = chartArea.top + 10;

          ctx.save();
          ctx.font = `10px 'Montserrat', sans-serif`;
          ctx.fillStyle = "#edeeef";
          ctx.textAlign = "center";
          ctx.fillText(`Avg. ${averageScore.toFixed(2)}`, x, y);
          ctx.restore();
        },
      },
      filler: {
        propagate: true, // Smooth fill effect for the dataset
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
    hover: {
      animationDuration: 500, // Animate data points on hover
    },
  };

  return (
    <motion.div
      className="skill-image"
      initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0.8 }}
      animate={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
      transition={isBatterySavingOn ? {} : { duration: 1.5, ease: "easeInOut" }}
    >
      <Radar
        data={data}
        options={options}
        plugins={[options.plugins.customAverage]}
      />
    </motion.div>
  );
};

const SkillGraphCarousel = ({ skills, isBatterySavingOn }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Carousel
      key={`skill-graph-${screenWidth}`}
      responsive={responsive}
      autoPlaySpeed={3000}
      infinite
      className="skill-slider"
      minimumTouchDrag={80}
      pauseOnHover
      customLeftArrow={<CustomLeftArrow />}
      customRightArrow={<CustomRightArrow />}
    >
      {skills.map((eachSkill, index) => (
        <motion.div
          className="item"
          key={eachSkill.id || eachSkill.skillTitle}
          variants={isBatterySavingOn ? {} : zoomIn(0)}
          initial="show"
          animate="show"
          exit="hidden"
        >
          <motion.div
            className="skill-graph"
            initial={isBatterySavingOn ? {} : { scale: 1 }}
            whileHover={isBatterySavingOn ? {} : { scale: 1.01 }}
          >
            <SkillGraph
              givenData={eachSkill}
              isBatterySavingOn={isBatterySavingOn}
            />
          </motion.div>
          <h5 className="skill-title">{eachSkill.skillTitle}</h5>
          <p className="skill-description">{eachSkill.skillDescription}</p>
        </motion.div>
      ))}
    </Carousel>
  );
};

export default SkillGraphCarousel;
