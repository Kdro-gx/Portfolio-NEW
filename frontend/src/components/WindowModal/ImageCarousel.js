import { React, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/ProjectTab.css"; // Make sure to include styles if needed

function ImagesCarousel({ data, title, isBatterySavingOn }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <motion.div
      className="project-window-images"
      initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
      animate={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
      transition={isBatterySavingOn ? {} : { delay: 0.5, type: "ease" }}
      style={{ overflow: "hidden", margin: "0 auto" }}
    >
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={`${screenWidth <= 992 ? 1 : data.length === 1 ? 1 : 2}`}
        style={{
          borderRadius: "8px",
        }}
      >
        {data.map((img, index) => (
          <SwiperSlide key={index}>
            <motion.div
              key={`project-window-img-${title}-${index}`}
              className="project-window-img-bg"
              // initial={{ opacity: 0, scale: 0 }}
              // animate={{ opacity: 1, scale: 1 }}
              // transition={{ delay: 0, type: "spring" }}
              style={{
                // background: `linear-gradient(
                //     to bottom,
                //     rgba(0, 0, 0, 0.7) 10%,
                //     rgba(0, 0, 0, 0.6) 30%,
                //     rgba(0, 0, 0, 0.6) 70%,
                //     rgba(0, 0, 0, 0.7) 90%
                //   ), url(${img})`,
                background: `url(${img})`,
                backgroundSize: `${"contain"}`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: `100%`,
                minHeight: `${
                  screenWidth <= 768 ? "calc(20dvh)" : "calc(30dvh)"
                }`,
                maxHeight: `${
                  screenWidth <= 768 ? "calc(35dvh)" : "calc(40dvh)"
                }`,
                margin: "0 auto",
                transition: "background-color 0.3s ease-in-out",
                overflow: "hidden",
                aspectRatio: "16 / 9",
              }}
            >
              {" "}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}

export default ImagesCarousel;
