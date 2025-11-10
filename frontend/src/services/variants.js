export const AppLoad = (direction) => {
  return {
    initial: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 1 },
      easeInOut: 1,
    },
  };
};

export const fadeIn = (direction, size, delay, duration = 0.4) => {
  return {
    hidden: {
      y: direction === "up" ? size : direction === "down" ? -size : 0,
      x: direction === "left" ? size : direction === "right" ? -size : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };
};

export const slideIn = (direction, delay) => {
  return {
    hidden: {
      x: direction === "left" ? "-100vw" : direction === "right" ? "100vw" : 0,
      y: direction === "up" ? "-100dvh" : direction === "down" ? "100dvh" : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        delay: delay,
        duration: 1,
      },
    },
  };
};

export const zoomIn = (delay) => {
  return {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: delay,
        ease: [0.6, 0.01, 0, 0.9],
      },
    },
  };
};

export const rotate = (delay) => {
  return {
    hidden: {
      rotate: -180,
      opacity: 0,
    },
    show: {
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };
};

export const scale = (delay) => {
  return {
    hidden: {
      scale: 0.8,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay,
      },
    },
  };
};

export const staggerContainer = (staggerChildren, delayChildren = 0) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren,
      },
    },
  };
};

export const bounce = (delay) => {
  return {
    hidden: {
      y: 0,
      opacity: 0,
    },
    show: {
      y: [0, -30, 0],
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
        delay: delay,
      },
    },
  };
};

export const wave = (delay) => {
  return {
    hidden: {
      rotate: -45,
      opacity: 0,
    },
    show: {
      rotate: [0, -15, 15, -15, 0],
      opacity: 1,
      transition: {
        duration: 1,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

export const pulse = (delay) => {
  return {
    hidden: {
      scale: 1,
    },
    show: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: delay,
      },
    },
  };
};

export const float = (delay) => {
  return {
    hidden: {
      y: 0,
    },
    show: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      },
    },
  };
};
