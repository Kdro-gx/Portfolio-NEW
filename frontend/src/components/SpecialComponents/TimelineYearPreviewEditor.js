import React, { useState, useRef, useEffect } from "react";
import { FaSave, FaUndo, FaMousePointer, FaDrawPolygon, FaSearchPlus, FaSearchMinus, FaExpand, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { updateTimelineEvent } from "../../services/timelineService";
import "../../styles/TimelineYearPreviewEditor.css";

const TimelineYearPreviewEditor = ({ year, events, onBack, onSave }) => {
  const [canvasEvents, setCanvasEvents] = useState(events.map(event => ({
    ...event,
    position: event.position || { x: 100, y: 100 }
  })));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [connectionPreview, setConnectionPreview] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedConnectionPoint, setSelectedConnectionPoint] = useState(null);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // Add mouse wheel zoom support
  useEffect(() => {
    const handleWheel = (e) => {
      if (canvasRef.current && canvasRef.current.contains(e.target)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      // Prevent context menu on right-click
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      }
    };
  }, []);

  // Handle mouse down on event card
  const handleEventMouseDown = (e, event) => {
    // Right-click for connection tool
    if (e.button === 2) {
      e.preventDefault();
      handleConnectionStart(event);
      return;
    }

    // Left-click for dragging
    if (e.button === 0) {
      e.stopPropagation();
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;

      setDraggingEvent(event);
      setDragOffset({
        x: x - event.position.x,
        y: y - event.position.y
      });
      setSelectedEvent(event);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (draggingEvent) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;

      const newX = Math.max(0, Math.min(x - dragOffset.x, 2000));
      const newY = Math.max(0, Math.min(y - dragOffset.y, 1500));

      setCanvasEvents(prev => prev.map(evt =>
        evt._id === draggingEvent._id
          ? { ...evt, position: { x: newX, y: newY } }
          : evt
      ));
      setIsDirty(true);
    } else if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (connectionMode && connectionStart && connectionPreview) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;
      setConnectionPreview({ ...connectionPreview, endX: x, endY: y });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingEvent(null);
    setIsPanning(false);
  };

  // Handle canvas mouse down for panning
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-viewport')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle connection start with specific connection point
  const handleConnectionStart = (event, connectionPoint = null) => {
    if (!connectionStart) {
      setConnectionStart({ event, connectionPoint });
      setSelectedConnectionPoint({ eventId: event._id, point: connectionPoint });
      const startPos = event.position;

      // Calculate start position based on connection point
      let startX, startY;
      if (connectionPoint) {
        if (connectionPoint.side === 'left') {
          startX = startPos.x;
          startY = startPos.y + connectionPoint.offset;
        } else if (connectionPoint.side === 'right') {
          startX = startPos.x + 280;
          startY = startPos.y + connectionPoint.offset;
        } else if (connectionPoint.side === 'top') {
          startX = startPos.x + connectionPoint.offset;
          startY = startPos.y;
        } else if (connectionPoint.side === 'bottom') {
          startX = startPos.x + connectionPoint.offset;
          startY = startPos.y + 120;
        }
      } else {
        startX = startPos.x + 140;
        startY = startPos.y + 60;
      }

      setConnectionPreview({
        startX,
        startY,
        endX: startX,
        endY: startY
      });
    } else {
      // Complete connection
      if (connectionStart.event._id !== event._id) {
        handleConnectionComplete(event, connectionPoint);
        setSelectedConnectionPoint(null);
      } else {
        // Cancel if clicking same event
        setConnectionStart(null);
        setConnectionPreview(null);
        setSelectedConnectionPoint(null);
      }
    }
  };

  // Handle connection complete
  const handleConnectionComplete = (targetEvent, targetConnectionPoint = null) => {
    const startEvent = canvasEvents.find(e => e._id === connectionStart.event._id);
    const startPos = startEvent.position;
    const targetPos = targetEvent.position;

    // Calculate start and end positions based on connection points
    let startX, startY, endX, endY;
    let fromSide, toSide;

    if (connectionStart.connectionPoint) {
      if (connectionStart.connectionPoint.side === 'left') {
        startX = startPos.x;
        startY = startPos.y + connectionStart.connectionPoint.offset;
        fromSide = 'left';
      } else if (connectionStart.connectionPoint.side === 'right') {
        startX = startPos.x + 280;
        startY = startPos.y + connectionStart.connectionPoint.offset;
        fromSide = 'right';
      } else if (connectionStart.connectionPoint.side === 'top') {
        startX = startPos.x + connectionStart.connectionPoint.offset;
        startY = startPos.y;
        fromSide = 'top';
      } else if (connectionStart.connectionPoint.side === 'bottom') {
        startX = startPos.x + connectionStart.connectionPoint.offset;
        startY = startPos.y + 120;
        fromSide = 'bottom';
      }
    } else {
      startX = startPos.x + 140;
      startY = startPos.y + 60;
      fromSide = startPos.x < targetPos.x ? 'right' : 'left';
    }

    if (targetConnectionPoint) {
      if (targetConnectionPoint.side === 'left') {
        endX = targetPos.x;
        endY = targetPos.y + targetConnectionPoint.offset;
        toSide = 'left';
      } else if (targetConnectionPoint.side === 'right') {
        endX = targetPos.x + 280;
        endY = targetPos.y + targetConnectionPoint.offset;
        toSide = 'right';
      } else if (targetConnectionPoint.side === 'top') {
        endX = targetPos.x + targetConnectionPoint.offset;
        endY = targetPos.y;
        toSide = 'top';
      } else if (targetConnectionPoint.side === 'bottom') {
        endX = targetPos.x + targetConnectionPoint.offset;
        endY = targetPos.y + 120;
        toSide = 'bottom';
      }
    } else {
      endX = targetPos.x + 140;
      endY = targetPos.y + 60;
      toSide = startPos.x < targetPos.x ? 'left' : 'right';
    }

    // Calculate control points for bezier curve
    const controlPoint1 = {
      x: startX + (endX - startX) / 3,
      y: startY
    };
    const controlPoint2 = {
      x: startX + 2 * (endX - startX) / 3,
      y: endY
    };

    const newConnection = {
      targetId: targetEvent._id,
      fromSide,
      toSide,
      fromPoint: connectionStart.connectionPoint,
      toPoint: targetConnectionPoint,
      controlPoint1,
      controlPoint2
    };

    setCanvasEvents(prev => prev.map(evt =>
      evt._id === startEvent._id
        ? {
            ...evt,
            connections: [...(evt.connections || []), newConnection]
          }
        : evt
    ));

    setConnectionStart(null);
    setConnectionPreview(null);
    setIsDirty(true);
  };

  // Handle zoom
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  // Handle zoom reset
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);

      // Update all events with new positions and connections
      const updatePromises = canvasEvents.map(event =>
        updateTimelineEvent(event._id, {
          position: event.position,
          connections: event.connections || []
        })
      );

      await Promise.all(updatePromises);

      setIsDirty(false);
      alert("Timeline layout saved successfully!");
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving timeline layout:", error);
      alert("Failed to save timeline layout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm("Reset all positions and connections to defaults?")) {
      setCanvasEvents(events.map(event => ({
        ...event,
        position: event.position || { x: 100, y: 100 },
        connections: []
      })));
      setIsDirty(true);
    }
  };

  // Delete connection
  const handleDeleteConnection = (eventId, connectionIndex) => {
    setCanvasEvents(prev => prev.map(evt =>
      evt._id === eventId
        ? {
            ...evt,
            connections: evt.connections.filter((_, idx) => idx !== connectionIndex)
          }
        : evt
    ));
    setIsDirty(true);
  };

  // Render connections
  const renderConnections = () => {
    const paths = [];

    canvasEvents.forEach(event => {
      if (event.connections && event.connections.length > 0) {
        event.connections.forEach((conn, idx) => {
          const targetEvent = canvasEvents.find(e => e._id === conn.targetId);
          if (!targetEvent) return;

          const startPos = event.position;
          const endPos = targetEvent.position;

          let startX, startY, endX, endY;

          // Use stored connection points if available
          if (conn.fromPoint) {
            if (conn.fromPoint.side === 'left') {
              startX = startPos.x;
              startY = startPos.y + conn.fromPoint.offset;
            } else if (conn.fromPoint.side === 'right') {
              startX = startPos.x + 280;
              startY = startPos.y + conn.fromPoint.offset;
            } else if (conn.fromPoint.side === 'top') {
              startX = startPos.x + conn.fromPoint.offset;
              startY = startPos.y;
            } else if (conn.fromPoint.side === 'bottom') {
              startX = startPos.x + conn.fromPoint.offset;
              startY = startPos.y + 120;
            }
          } else {
            startX = startPos.x + (conn.fromSide === 'right' ? 280 : 0);
            startY = startPos.y + 60;
          }

          if (conn.toPoint) {
            if (conn.toPoint.side === 'left') {
              endX = endPos.x;
              endY = endPos.y + conn.toPoint.offset;
            } else if (conn.toPoint.side === 'right') {
              endX = endPos.x + 280;
              endY = endPos.y + conn.toPoint.offset;
            } else if (conn.toPoint.side === 'top') {
              endX = endPos.x + conn.toPoint.offset;
              endY = endPos.y;
            } else if (conn.toPoint.side === 'bottom') {
              endX = endPos.x + conn.toPoint.offset;
              endY = endPos.y + 120;
            }
          } else {
            endX = endPos.x + (conn.toSide === 'right' ? 280 : 0);
            endY = endPos.y + 60;
          }

          const cp1 = conn.controlPoint1 || { x: startX + (endX - startX) / 3, y: startY };
          const cp2 = conn.controlPoint2 || { x: startX + 2 * (endX - startX) / 3, y: endY };

          paths.push(
            <g key={`${event._id}-${idx}`}>
              <path
                d={`M ${startX} ${startY} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endX} ${endY}`}
                stroke="#F4811F"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.7"
                markerEnd="url(#arrowhead)"
              />
              <circle
                cx={(startX + endX) / 2}
                cy={(startY + endY) / 2}
                r="8"
                fill="#dc3545"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDeleteConnection(event._id, idx);
                }}
              />
            </g>
          );
        });
      }
    });

    // Add preview connection with curve
    if (connectionPreview) {
      const startX = connectionPreview.startX;
      const startY = connectionPreview.startY;
      const endX = connectionPreview.endX;
      const endY = connectionPreview.endY;

      // Calculate bezier curve for preview
      const cp1X = startX + (endX - startX) / 3;
      const cp1Y = startY;
      const cp2X = startX + 2 * (endX - startX) / 3;
      const cp2Y = endY;

      paths.push(
        <path
          key="preview"
          d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
          stroke="#F4811F"
          strokeWidth="2"
          fill="none"
          strokeDasharray="3,3"
          opacity="0.5"
        />
      );
    }

    return paths;
  };

  // Render connection points for a card
  const renderConnectionPoints = (event) => {
    // Show points if: hovering over this card, OR a connection is in progress, OR this card has the selected point
    const shouldShow = hoveredCard === event._id ||
                      connectionStart ||
                      (selectedConnectionPoint && selectedConnectionPoint.eventId === event._id);
    if (!shouldShow) return null;

    const points = [];
    const cardHeight = 120;
    const cardWidth = 280;

    // Vertical offsets for left/right sides (3 points)
    const verticalOffsets = [cardHeight * 0.25, cardHeight * 0.5, cardHeight * 0.75];

    // Horizontal offsets for top/bottom sides (2 points)
    const horizontalOffsets = [cardWidth * 0.33, cardWidth * 0.66];

    // Helper function to check if a point is selected
    const isPointSelected = (side, offset) => {
      return selectedConnectionPoint &&
             selectedConnectionPoint.eventId === event._id &&
             selectedConnectionPoint.point?.side === side &&
             selectedConnectionPoint.point?.offset === offset;
    };

    // Left side points
    verticalOffsets.forEach((offset, idx) => {
      const isSelected = isPointSelected('left', offset);
      points.push(
        <g key={`left-${idx}`}>
          <circle
            cx={event.position.x}
            cy={event.position.y + offset}
            r={isSelected ? "14" : "12"}
            fill={isSelected ? "#00f0ff" : "#F4811F"}
            stroke="white"
            strokeWidth="3"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleConnectionStart(event, { side: 'left', offset });
            }}
          />
          {isSelected && (
            <circle
              cx={event.position.x}
              cy={event.position.y + offset}
              r="18"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    });

    // Right side points
    verticalOffsets.forEach((offset, idx) => {
      const isSelected = isPointSelected('right', offset);
      points.push(
        <g key={`right-${idx}`}>
          <circle
            cx={event.position.x + 280}
            cy={event.position.y + offset}
            r={isSelected ? "14" : "12"}
            fill={isSelected ? "#00f0ff" : "#F4811F"}
            stroke="white"
            strokeWidth="3"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleConnectionStart(event, { side: 'right', offset });
            }}
          />
          {isSelected && (
            <circle
              cx={event.position.x + 280}
              cy={event.position.y + offset}
              r="18"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    });

    // Top side points
    horizontalOffsets.forEach((offset, idx) => {
      const isSelected = isPointSelected('top', offset);
      points.push(
        <g key={`top-${idx}`}>
          <circle
            cx={event.position.x + offset}
            cy={event.position.y}
            r={isSelected ? "14" : "12"}
            fill={isSelected ? "#00f0ff" : "#F4811F"}
            stroke="white"
            strokeWidth="3"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleConnectionStart(event, { side: 'top', offset });
            }}
          />
          {isSelected && (
            <circle
              cx={event.position.x + offset}
              cy={event.position.y}
              r="18"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    });

    // Bottom side points
    horizontalOffsets.forEach((offset, idx) => {
      const isSelected = isPointSelected('bottom', offset);
      points.push(
        <g key={`bottom-${idx}`}>
          <circle
            cx={event.position.x + offset}
            cy={event.position.y + cardHeight}
            r={isSelected ? "14" : "12"}
            fill={isSelected ? "#00f0ff" : "#F4811F"}
            stroke="white"
            strokeWidth="3"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleConnectionStart(event, { side: 'bottom', offset });
            }}
          />
          {isSelected && (
            <circle
              cx={event.position.x + offset}
              cy={event.position.y + cardHeight}
              r="18"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    });

    return points;
  };

  return (
    <div className="timeline-year-preview-editor">
      {/* Header */}
      <div className="preview-editor-header">
        <button className="back-btn" onClick={onBack}>
          <FaTimes /> Close Preview
        </button>
        <h2>Year {year} - Timeline Canvas Editor</h2>
        <div className="header-actions">
          <button
            className={`tool-btn ${!connectionMode ? 'active' : ''}`}
            onClick={() => setConnectionMode(false)}
            title="Move Tool"
          >
            <FaMousePointer />
          </button>
          <button
            className={`tool-btn ${connectionMode ? 'active' : ''}`}
            onClick={() => setConnectionMode(!connectionMode)}
            title="Connection Tool"
          >
            <FaDrawPolygon />
          </button>
          <div className="zoom-controls">
            <button
              className="zoom-btn"
              onClick={() => handleZoom(-0.25)}
              disabled={zoom <= 0.5}
            >
              <FaSearchMinus />
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button
              className="zoom-btn"
              onClick={() => handleZoom(0.25)}
              disabled={zoom >= 2}
            >
              <FaSearchPlus />
            </button>
            <button className="zoom-btn" onClick={handleZoomReset}>
              <FaExpand />
            </button>
          </div>
          <button className="action-btn reset" onClick={handleReset}>
            <FaUndo /> Reset
          </button>
          <button
            className="action-btn save"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <FaSave /> {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="canvas-container"
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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

          {/* Center Reference Guide */}
          <div className="center-reference-guide">
            <div className="center-crosshair-vertical" />
            <div className="center-crosshair-horizontal" />
            <div className="center-label">Initial View Center</div>
          </div>

          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="connections-svg"
            width="2500"
            height="2000"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#F4811F" />
              </marker>
            </defs>
            {renderConnections()}
            {/* Render connection points for all cards */}
            {canvasEvents.map(event => (
              <g
                key={`points-${event._id}`}
                onMouseEnter={() => setHoveredCard(event._id)}
                onMouseLeave={() => {
                  // Don't clear hover if a connection is in progress
                  if (!connectionStart) {
                    setHoveredCard(null);
                  }
                }}
                style={{ pointerEvents: 'all' }}
              >
                {renderConnectionPoints(event)}
              </g>
            ))}
          </svg>

          {/* Event Cards */}
          {canvasEvents.map(event => (
            <motion.div
              key={event._id}
              className={`canvas-event-card ${selectedEvent?._id === event._id ? 'selected' : ''} ${connectionMode ? 'connection-mode' : ''}`}
              style={{
                left: event.position.x,
                top: event.position.y,
                cursor: connectionMode ? 'crosshair' : 'move'
              }}
              onMouseDown={(e) => handleEventMouseDown(e, event)}
              onMouseEnter={() => setHoveredCard(event._id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="event-card-header">
                <span className="event-quarter">{event.quarter}</span>
                <span className="event-category">{event.category}</span>
              </div>
              <h4 className="event-title">{event.title}</h4>
              <p className="event-subject">{event.subject || 'No subject'}</p>
              {event.connections && event.connections.length > 0 && (
                <div className="connection-count">
                  {event.connections.length} connections
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions-panel">
        <h4>Instructions</h4>
        <ul>
          <li><strong>Move Card:</strong> Left-click and drag event cards to reposition them</li>
          <li><strong>Create Connection:</strong> Hover over a card to see connection points (orange circles on all 4 sides). Click ONE point (it will turn neon blue), then click ANOTHER point on a different card to draw a connection line between them</li>
          <li><strong>Delete Connection:</strong> Click the red circle in the middle of a connection line</li>
          <li><strong>Pan Canvas:</strong> Click and drag on empty space to pan the canvas</li>
          <li><strong>Zoom:</strong> Scroll mouse wheel while over the canvas</li>
          <li><strong>Save:</strong> Click "Save Layout" button to save positions and connections</li>
        </ul>
      </div>
    </div>
  );
};

export default TimelineYearPreviewEditor;
