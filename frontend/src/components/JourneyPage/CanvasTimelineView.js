import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/CanvasTimelineView.css";

const CanvasTimelineView = ({
  events,
  onEventClick,
  showConnections,
  getCategoryColor,
  isBatterySavingOn
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [touchDistance, setTouchDistance] = useState(0);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const defaultPan = useRef({ x: 0, y: 0 });

  // Add mouse wheel zoom support when hovering over canvas (only if activated)
  useEffect(() => {
    const handleWheel = (e) => {
      if (isActivated && isHovering && canvasRef.current && canvasRef.current.contains(e.target)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isHovering, isActivated]);

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (isPanning && isActivated) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle canvas mouse down for panning
  const handleCanvasMouseDown = (e) => {
    // Check if clicking on the canvas background (not on cards or buttons)
    const isCanvasBackground = e.target === canvasRef.current ||
                               e.target.classList.contains('canvas-viewport') ||
                               e.target.classList.contains('canvas-grid');

    if (isCanvasBackground) {
      if (!isActivated) {
        setIsActivated(true);
      } else {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  // Handle unfocus - deactivate the canvas
  const handleUnfocus = () => {
    setIsActivated(false);
    setIsPanning(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (!isActivated) {
      setIsActivated(true);
      return;
    }

    if (e.touches.length === 2) {
      // Pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchDistance(distance);
    } else if (e.touches.length === 1) {
      // Pan gesture
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isActivated) return;

    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (touchDistance > 0) {
        const delta = (distance - touchDistance) * 0.01;
        setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
      }
      setTouchDistance(distance);
    } else if (e.touches.length === 1 && isPanning) {
      // Pan gesture
      e.preventDefault();
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchDistance(0);
  };

  // Recenter function
  const handleRecenter = () => {
    setZoom(1);
    setPan(defaultPan.current);
  };

  // Render connections
  const renderConnections = () => {
    if (!showConnections) return null;

    const paths = [];

    events.forEach(event => {
      if (event.connections && event.connections.length > 0) {
        event.connections.forEach((conn, idx) => {
          const targetEvent = events.find(e => e._id === conn.targetId);
          if (!targetEvent) return;

          const startPos = event.position || { x: 100, y: 100 };
          const endPos = targetEvent.position || { x: 200, y: 200 };

          let startX, startY, endX, endY;

          // Use stored connection points if available
          if (conn.fromPoint) {
            startX = startPos.x + (conn.fromPoint.side === 'right' ? 280 : 0);
            startY = startPos.y + conn.fromPoint.offset;
          } else {
            startX = startPos.x + (conn.fromSide === 'right' ? 280 : 0);
            startY = startPos.y + 60;
          }

          if (conn.toPoint) {
            endX = endPos.x + (conn.toPoint.side === 'right' ? 280 : 0);
            endY = endPos.y + conn.toPoint.offset;
          } else {
            endX = endPos.x + (conn.toSide === 'right' ? 280 : 0);
            endY = endPos.y + 60;
          }

          const cp1 = conn.controlPoint1 || { x: startX + (endX - startX) / 3, y: startY };
          const cp2 = conn.controlPoint2 || { x: startX + 2 * (endX - startX) / 3, y: endY };

          paths.push(
            <path
              key={`${event._id}-${idx}`}
              className="canvas-connection-path"
              d={`M ${startX} ${startY} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endX} ${endY}`}
              opacity="0.9"
              markerEnd="url(#arrowhead)"
            />
          );
        });
      }
    });

    return paths;
  };

  // Auto-center on mount - center on canvas coordinates (1250, 1000) which matches the neon crosshair
  useEffect(() => {
    if (canvasRef.current) {
      const containerWidth = canvasRef.current.offsetWidth;
      const containerHeight = canvasRef.current.offsetHeight;

      // Center the view on canvas position (1250, 1000) - where the neon blue crosshair is in the editor
      const centerX = 1250;
      const centerY = 1000;

      const initialPan = {
        x: (containerWidth / 2) - centerX,
        y: (containerHeight / 2) - centerY
      };

      setPan(initialPan);
      defaultPan.current = initialPan;
    }
  }, []);

  return (
    <div
      className={`canvas-timeline-view ${!isActivated ? 'inactive' : ''}`}
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        handleMouseUp();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        <div className="canvas-grid" />

        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="canvas-connections-svg"
          width="2500"
          height="2000"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            {/* Animated Gradient for Connection Lines - FSU Blue & Gold */}
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#00f0ff;#CEB888;#00f0ff;#CEB888;#00f0ff" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="25%" style={{ stopColor: '#CEB888', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#CEB888;#00f0ff;#CEB888;#00f0ff;#CEB888" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#00f0ff;#CEB888;#00f0ff;#CEB888;#00f0ff" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="75%" style={{ stopColor: '#CEB888', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#CEB888;#00f0ff;#CEB888;#00f0ff;#CEB888" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#00f0ff;#CEB888;#00f0ff;#CEB888;#00f0ff" dur="5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Arrow Marker with Gradient */}
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 12 4, 0 8" fill="url(#connectionGradient)" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        {/* Event Cards */}
        {events.map((event, index) => {
          const position = event.position || { x: 100 + index * 300, y: 100 };

          return (
            <motion.div
              key={event._id}
              className="canvas-timeline-card"
              style={{
                left: position.x,
                top: position.y
              }}
              onClick={() => onEventClick(event)}
              initial={isBatterySavingOn ? {} : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={isBatterySavingOn ? {} : { scale: 1.05, boxShadow: "0 8px 30px rgba(244, 129, 31, 0.4)" }}
            >
              <div className="canvas-card-header">
                <span className="canvas-quarter">{event.quarter}</span>
                <span className="canvas-category">{event.category}</span>
              </div>

              <div
                className="canvas-event-node"
                style={{ backgroundColor: event.color || getCategoryColor(event.category) }}
              >
                <span className="canvas-event-icon">
                  {event.icon || (event.category === 'education' ? '🎓' :
                                  event.category === 'career' ? '💼' :
                                  event.category === 'achievement' ? '🏆' : '⭐')}
                </span>
              </div>

              <h4 className="canvas-event-title">{event.title}</h4>
              <p className="canvas-event-description">
                {(event.subject || event.body || 'No description available').substring(0, 60)}...
              </p>
              <div className="canvas-event-footer">
                <span className="canvas-year">{event.year}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zoom indicator */}
      <div className="canvas-zoom-indicator">
        {Math.round(zoom * 100)}%
      </div>

      {/* Instructions with integrated Recenter and Unfocus buttons */}
      <div className="canvas-instructions">
        <span>🔍 Scroll/Pinch to zoom • 🖱️ Click cards for details</span>
        {isActivated && (
          <>
            <button
              className="canvas-recenter-button-inline"
              onClick={handleRecenter}
              title="Reset view to center"
            >
              <span className="recenter-icon">⌖</span>
              <span className="recenter-text">Recenter</span>
            </button>
            <button
              className="canvas-unfocus-button-inline"
              onClick={handleUnfocus}
              title="Deactivate canvas controls"
            >
              <span className="unfocus-icon">✕</span>
              <span className="unfocus-text">Unfocus</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CanvasTimelineView;
