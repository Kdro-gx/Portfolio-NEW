import React, { useEffect, useRef, useState } from "react";

export const SpotlightBG = () => {
  // Fixed circular grid background with touching circles
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const paintedCircles = useRef([]); // Stores painted circles with timestamps
  const breathingProgress = useRef(0); // Breathing animation progress (0 to 1)
  const direction = useRef(1); // 1 for expanding, -1 for contracting
  const breathingSpeed = 0.003; // Breathing animation speed (smoother)
  const animationTime = useRef(0); // Time-based smooth animation
  const gridPointsRef = useRef([]); // Precomputed circle grid points

  // Track total clicks using useState and mirror to a ref for use inside the canvas render loop.
  const [clickCount, setClickCount] = useState(0);
  const clickCountRef = useRef(clickCount);
  useEffect(() => {
    clickCountRef.current = clickCount;
  }, [clickCount]);

  // Global gradient stops - FAMU-FSU School Colors (More Garnet & Orange)
  const gradientStops = [
    { offset: 0, color: [120, 47, 64] }, // FSU Garnet #782F40
    { offset: 0.15, color: [244, 129, 31] }, // FAMU Orange #F4811F
    { offset: 0.35, color: [120, 47, 64] }, // FSU Garnet #782F40 (repeat)
    { offset: 0.5, color: [244, 129, 31] }, // FAMU Orange #F4811F (repeat)
    { offset: 0.65, color: [206, 184, 136] }, // FSU Gold #CEB888
    { offset: 0.8, color: [0, 131, 68] }, // FAMU Green #008344
    { offset: 0.9, color: [92, 184, 178] }, // FSU Additional #5CB8B2
    { offset: 1, color: [120, 47, 64] }, // Loop back to FSU Garnet
  ];

  // Compute global gradient color at normalized position t with the given opacity.
  const getGlobalGradientColor = (t, opacity) => {
    t = Math.min(Math.max(t, 0), 1);
    let startStop, endStop;
    for (let i = 0; i < gradientStops.length - 1; i++) {
      if (t >= gradientStops[i].offset && t <= gradientStops[i + 1].offset) {
        startStop = gradientStops[i];
        endStop = gradientStops[i + 1];
        break;
      }
    }
    if (!startStop || !endStop) {
      const col = gradientStops[gradientStops.length - 1].color;
      return `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${opacity})`;
    }
    const range = endStop.offset - startStop.offset;
    const localT = range === 0 ? 0 : (t - startStop.offset) / range;
    const r = Math.round(
      startStop.color[0] + localT * (endStop.color[0] - startStop.color[0])
    );
    const g = Math.round(
      startStop.color[1] + localT * (endStop.color[1] - startStop.color[1])
    );
    const b = Math.round(
      startStop.color[2] + localT * (endStop.color[2] - startStop.color[2])
    );
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const baseCircleSize = 20; // Base circle radius
    const lightRadius = 100; // Radius of light effect around the cursor
    const clickRadius = 60; // Radius for click painting effect

    // Precompute grid points with multiple circle sizes for mural effect
    const computeGridPoints = () => {
      const points = [];
      const spacing = baseCircleSize * 2; // Base spacing
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      const denom = canvas.width * canvas.width + canvas.height * canvas.height;

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = col * spacing;
          const y = row * spacing;
          const t = (x * canvas.width + y * canvas.height) / denom;

          // Create mural pattern with different circle sizes
          let circleSize = baseCircleSize;
          const patternValue = (col + row) % 7; // 7-step pattern for variety

          if (patternValue === 0 || patternValue === 3) {
            circleSize = baseCircleSize * 1.8; // Large accent circles
          } else if (patternValue === 1 || patternValue === 5) {
            circleSize = baseCircleSize * 1.4; // Medium circles
          } else if (patternValue === 2) {
            circleSize = baseCircleSize * 0.7; // Small circles
          }
          // patternValue 4 and 6 use base size

          points.push({ x, y, t, circleSize });
        }
      }
      gridPointsRef.current = points;
    };

    // Resize canvas and recompute grid points.
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      computeGridPoints();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Draw a circle at (x, y) with the color sampled from the global gradient using t.
    // If the circle is painted, fill it; otherwise, draw only the stroke.
    const drawCircle = (x, y, t, opacity, isPainted, circleSize) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      if (isPainted) {
        ctx.fillStyle = getGlobalGradientColor(t, 0.8);
        ctx.fill();
        ctx.strokeStyle = "#212529";
        ctx.lineWidth = Math.max(1, circleSize / 15); // Proportional stroke width
      } else {
        ctx.strokeStyle = getGlobalGradientColor(t, opacity);
        ctx.lineWidth = opacity > 0 ? Math.max(1, circleSize / 20) : 1;
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw a dark background.
    const drawBackground = () => {
      ctx.fillStyle = "#212529";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw the grid of circles.
    const drawGrid = () => {
      const now = Date.now();
      paintedCircles.current = paintedCircles.current.filter(
        (circle) => now - circle.timestamp < 2000
      );
      gridPointsRef.current.forEach(({ x, y, t, circleSize }) => {
        const dx = x - mouse.current.x;
        const dy = y - mouse.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let opacity =
          distance <= lightRadius ? 1 - distance / lightRadius : 0.075;

        // Smoother sine-wave breathing animation
        const smoothWave = Math.sin(animationTime.current * 0.8) * 0.5 + 0.5;
        const animationLine = canvas.height * smoothWave;
        if (y <= animationLine) opacity += 0.12;

        opacity = Math.min(Math.max(opacity, 0), 1);
        const isPainted = paintedCircles.current.some(
          (circle) => circle.x === x && circle.y === y
        );
        drawCircle(x, y, t, opacity, isPainted, circleSize);
      });
    };

    // Draw the instruction text. It fades in/out subtly and is removed after 5 clicks.
    const drawInstructionText = () => {
      if (clickCountRef.current >= 3) return;
      const time = Date.now();
      const textAlpha = 0.4 + 0.4 * Math.sin(time / 500);
      ctx.save();
      ctx.font = "12px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
      ctx.textBaseline = "top";
      ctx.fillText("Click anywhere to interact", canvas.width / 2, 52);
      ctx.restore();
    };

    const render = () => {
      drawBackground();
      drawGrid();
      !isTouchDevice && drawInstructionText();

      // Smooth time-based animation instead of discrete steps
      animationTime.current += 0.016; // ~60fps increment

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const insideCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (insideCanvas) {
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
      } else {
        mouse.current.x = -100;
        mouse.current.y = -100;
      }
    };

    const handleMouseClick = (e) => {
      if (isTouchDevice) return;
      const rect = canvas.getBoundingClientRect();
      const insideCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (insideCanvas) {
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        gridPointsRef.current.forEach(({ x, y }) => {
          const dx = x - clickX;
          const dy = y - clickY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= clickRadius) {
            paintedCircles.current.push({ x, y, timestamp: Date.now() });
          }
        });
        setClickCount((prev) => prev + 1);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    if (!isTouchDevice) {
      window.addEventListener("click", handleMouseClick);
    }
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (!isTouchDevice) {
        window.removeEventListener("click", handleMouseClick);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // style={{
      //   position: "absolute",
      //   top: 0,
      //   left: 0,
      //   width: "100%",
      //   height: "100%",
      //   zIndex: -1,
      // }}

      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 0,
        transform: "translateZ(0)", // Hardware acceleration hint
        willChange: "transform",
      }}
    />
  );
};
