import React, { useState, useEffect, useRef } from "react";
import {
  FaSave,
  FaEye,
  FaUpload,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaCopy,
  FaUndo,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaTrophy,
  FaHeart,
  FaCode,
  FaStar,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchTimeline,
  fetchTimelineYears,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
} from "../../services/timelineService";
import TimelineYearPreviewEditor from "./TimelineYearPreviewEditor";
import "../../styles/EnhancedTimelineEditor.css";

const MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
const CATEGORIES = [
  { value: "education", label: "Education", icon: <FaGraduationCap /> },
  { value: "work", label: "Work", icon: <FaBriefcase /> },
  { value: "project", label: "Project", icon: <FaCode /> },
  { value: "achievement", label: "Achievement", icon: <FaTrophy /> },
  { value: "personal", label: "Personal", icon: <FaHeart /> },
  { value: "other", label: "Other", icon: <FaStar /> }
];

const EnhancedTimelineEditor = ({ onBack }) => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [years, setYears] = useState([]);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [yearPreviewOpen, setYearPreviewOpen] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch timeline data on component mount
  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      console.log("EnhancedTimelineEditor: Fetching timeline data...");

      const [itemsData, yearsData] = await Promise.all([
        fetchTimeline(),
        fetchTimelineYears()
      ]);

      console.log("EnhancedTimelineEditor: Timeline items fetched:", itemsData);
      console.log("EnhancedTimelineEditor: Timeline years fetched:", yearsData);

      setTimelineItems(itemsData);
      setYears(yearsData || []);
      setLoading(false);
    } catch (error) {
      console.error("EnhancedTimelineEditor: Error fetching timeline data:", error);
      setLoading(false);
    }
  };

  const filteredItems = timelineItems.filter(item => {
    const yearMatch = yearFilter === "all" || item.year === parseInt(yearFilter);
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    return yearMatch && categoryMatch;
  });

  // Group timeline items by year
  const groupedByYear = filteredItems.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {});

  // Sort events within each year by month
  Object.keys(groupedByYear).forEach(year => {
    groupedByYear[year].sort((a, b) => {
      const monthOrder = { "Jan.": 1, "Feb.": 2, "Mar.": 3, "Apr.": 4, "May": 5, "Jun.": 6, "Jul.": 7, "Aug.": 8, "Sept.": 9, "Oct.": 10, "Nov.": 11, "Dec.": 12 };
      return (monthOrder[a.quarter] || 0) - (monthOrder[b.quarter] || 0);
    });
  });

  // Get sorted years (newest first)
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const handleSelectItem = (item) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedItem(item);
    setEditingData({ ...item });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newItem = {
      title: "",
      subject: "",
      body: "",
      year: new Date().getFullYear(),
      quarter: "Jan.",
      category: "education",
      icon: "",
      image: "",
      yearBackgroundImage: "",
      connections: [],
      position: { x: 0, y: 0 },
      sortOrder: 1,
      isExpanded: false
    };
    setSelectedItem(null);
    setEditingData(newItem);
    setIsDirty(true);
    setPreviewMode(false);
  };

  const handleFieldChange = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleArrayFieldChange = (field, index, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    setIsDirty(true);
  };

  const handleAddArrayItem = (field) => {
    setEditingData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (field, index) => {
    if (editingData[field].length <= 1) return;
    setEditingData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        setEditingData(prev => ({
          ...prev,
          image: imageUrl
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.title.trim()) {
      alert("Please enter a title for the timeline item.");
      return;
    }

    try {
      setSaving(true);
      console.log("EnhancedTimelineEditor: Saving timeline item:", editingData);

      let response;
      if (selectedItem) {
        // Update existing item
        const { _id, ...updateData } = editingData;
        response = await updateTimelineEvent(selectedItem._id, updateData);
      } else {
        // Create new item
        response = await createTimelineEvent(editingData);
      }

      console.log("EnhancedTimelineEditor: Save response:", response);

      if (response && response.success) {
        setIsDirty(false);
        await fetchTimelineData(); // Refresh the data
        if (!selectedItem && response.newItem) {
          setSelectedItem(response.newItem);
          setEditingData(response.newItem);
        }
        alert("Timeline item saved successfully!");
      }
    } catch (error) {
      console.error("EnhancedTimelineEditor: Error saving timeline item:", error);
      alert("Failed to save timeline item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedItem.title}"?`)) {
      return;
    }

    try {
      console.log("EnhancedTimelineEditor: Deleting timeline item:", selectedItem._id);
      const response = await deleteTimelineEvent(selectedItem._id);
      console.log("EnhancedTimelineEditor: Delete response:", response);

      if (response && response.success) {
        await fetchTimelineData();
        setSelectedItem(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Timeline item deleted successfully!");
      }
    } catch (error) {
      console.error("EnhancedTimelineEditor: Error deleting timeline item:", error);
      alert("Failed to delete timeline item. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      title: `${editingData.title} (Copy)`,
      _id: undefined
    };
    setSelectedItem(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedItem) {
      setEditingData({ ...selectedItem });
    } else {
      handleCreateNew();
    }
    setIsDirty(false);
  };

  const getCategoryIcon = (category) => {
    const categoryObj = CATEGORIES.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : <FaStar />;
  };

  const toggleYearCollapse = (year) => {
    setCollapsedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const handleYearPreview = (year) => {
    setYearPreviewOpen(year);
  };

  const handleCloseYearPreview = () => {
    setYearPreviewOpen(null);
    fetchTimelineData(); // Refresh data after closing preview
  };

  if (loading) {
    return (
      <div className="enhanced-timeline-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaClock /> My Timeline - Visual Editor</h2>
        </div>
        <div className="loading">Loading timeline...</div>
      </div>
    );
  }

  // If year preview is open, show the preview editor
  if (yearPreviewOpen) {
    const yearEvents = timelineItems.filter(item => item.year === parseInt(yearPreviewOpen));
    return (
      <TimelineYearPreviewEditor
        year={yearPreviewOpen}
        events={yearEvents}
        onBack={handleCloseYearPreview}
        onSave={handleCloseYearPreview}
      />
    );
  }

  return (
    <div className="enhanced-timeline-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaClock /> My Timeline - Visual Editor</h2>
        <div className="header-actions">
          <div className="filters">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Timeline Item
          </button>
          {editingData && (
            <>
              <button
                className="preview-btn"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <FaEye /> {previewMode ? "Edit" : "Preview"}
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={!isDirty || saving}
              >
                <FaSave /> {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="editor-content">
        {/* Sidebar - Timeline Items List (Grouped by Year) */}
        <div className="timeline-sidebar">
          <h3>Timeline Events ({filteredItems.length})</h3>
          <div className="timeline-list">
            {sortedYears.map((year) => (
              <div key={year} className="year-group">
                <div className="year-group-header" onClick={() => toggleYearCollapse(year)}>
                  <div className="year-group-title">
                    <span className={`collapse-icon ${collapsedYears[year] ? 'collapsed' : ''}`}>
                      <FaCompressArrowsAlt />
                    </span>
                    <FaCalendarAlt />
                    <span className="year-label">{year}</span>
                    <span className="year-count">({groupedByYear[year].length})</span>
                  </div>
                  <button
                    className="year-preview-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleYearPreview(year);
                    }}
                    title="Open Year Preview Editor"
                  >
                    <FaExpandArrowsAlt /> Preview
                  </button>
                </div>
                {!collapsedYears[year] && (
                  <div className="year-group-items">
                    {groupedByYear[year].map((item) => (
                      <div
                        key={item._id}
                        className={`timeline-item ${
                          selectedItem?._id === item._id ? "active" : ""
                        }`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="timeline-icon">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="timeline-details">
                          <div className="timeline-title">{item.title || "Untitled"}</div>
                          <div className="timeline-subtitle">{item.subject || "No subject"}</div>
                          <div className="timeline-meta">
                            <span className="timeline-quarter">{item.quarter}</span>
                            <span className="timeline-category">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <FaClock className="large-icon" />
              <h3>Select a timeline item to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Timeline Item
              </button>
            </div>
          ) : previewMode ? (
            <TimelinePreview item={editingData} />
          ) : (
            <TimelineEditor
              item={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedItem={selectedItem}
              isDirty={isDirty}
              categories={CATEGORIES}
              quarters={MONTHS}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Editor Component
const TimelineEditor = ({
  item,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedItem,
  isDirty,
  categories,
  quarters
}) => (
  <div className="timeline-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedItem && (
        <button className="action-btn delete" onClick={onDelete}>
          <FaTrash /> Delete
        </button>
      )}
      {isDirty && (
        <button className="action-btn" onClick={onReset}>
          <FaUndo /> Reset Changes
        </button>
      )}
    </div>

    <div className="editor-form">
      {/* Basic Information */}
      <div className="form-section">
        <h4><FaClock /> Timeline Item Information</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="e.g., Started University, Joined Company, Completed Project"
            />
          </div>

          <div className="form-group">
            <label>Subject/Summary</label>
            <input
              type="text"
              value={item.subject}
              onChange={(e) => onFieldChange("subject", e.target.value)}
              placeholder="Brief summary or subtitle"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Detailed Description</label>
          <textarea
            value={item.body}
            onChange={(e) => onFieldChange("body", e.target.value)}
            placeholder="Detailed description of what happened during this time period"
            rows="4"
          />
        </div>
      </div>

      {/* Timeline Details */}
      <div className="form-section">
        <h4><FaCalendarAlt /> Timeline Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              min="1900"
              max="2099"
              value={item.year}
              onChange={(e) => onFieldChange("year", parseInt(e.target.value) || new Date().getFullYear())}
            />
          </div>

          <div className="form-group">
            <label>Month</label>
            <select
              value={item.quarter}
              onChange={(e) => onFieldChange("quarter", e.target.value)}
            >
              {quarters.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={item.category}
              onChange={(e) => onFieldChange("category", e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sort Order</label>
            <input
              type="number"
              min="1"
              value={item.sortOrder}
              onChange={(e) => onFieldChange("sortOrder", parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>

          <div className="form-group">
            <label>Icon (Font Awesome class)</label>
            <input
              type="text"
              value={item.icon}
              onChange={(e) => onFieldChange("icon", e.target.value)}
              placeholder="e.g., fas fa-graduation-cap, fas fa-briefcase"
            />
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="form-section">
        <h4>📷 Timeline Image</h4>
        <div className="image-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            style={{ display: "none" }}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload /> Upload Image
          </button>
          {item.image && (
            <div className="image-preview">
              <img
                src={item.image}
                alt="Timeline Event"
                style={{ maxWidth: "300px", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            value={item.image}
            onChange={(e) => onFieldChange("image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Year Background Image Section */}
      <div className="form-section">
        <h4>🎨 Year Background Image</h4>
        <p style={{ fontSize: "0.9rem", color: "rgba(237, 238, 239, 0.7)", marginBottom: "1rem" }}>
          This image will be displayed as the background for this year in the carousel navigation.
        </p>
        <div className="image-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const imageUrl = reader.result;
                  onFieldChange("yearBackgroundImage", imageUrl);
                };
                reader.readAsDataURL(file);
              }
            }}
            style={{ display: "none" }}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload /> Upload Year Background
          </button>
          {item.yearBackgroundImage && (
            <div className="image-preview">
              <img
                src={item.yearBackgroundImage}
                alt="Year Background"
                style={{ maxWidth: "300px", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Year Background Image URL</label>
          <input
            type="text"
            value={item.yearBackgroundImage || ""}
            onChange={(e) => onFieldChange("yearBackgroundImage", e.target.value)}
            placeholder="https://example.com/year-background.jpg"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="form-section">
        <h4><FaExpandArrowsAlt /> Advanced Settings</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Position X</label>
            <input
              type="number"
              value={item.position?.x || 0}
              onChange={(e) => onFieldChange("position", { ...item.position, x: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Position Y</label>
            <input
              type="number"
              value={item.position?.y || 0}
              onChange={(e) => onFieldChange("position", { ...item.position, y: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={item.isExpanded || false}
              onChange={(e) => onFieldChange("isExpanded", e.target.checked)}
            />
            Expanded by default
          </label>
        </div>

        <ArrayEditor
          label="Connections (Related timeline items)"
          items={item.connections || []}
          onItemChange={(index, value) => onArrayFieldChange("connections", index, value)}
          onAddItem={() => onAddArrayItem("connections")}
          onRemoveItem={(index) => onRemoveArrayItem("connections", index)}
          placeholder="ID of related timeline item"
        />
      </div>
    </div>
  </div>
);

// Array Editor Component
const ArrayEditor = ({ label, items, onItemChange, onAddItem, onRemoveItem, placeholder }) => (
  <div className="array-editor">
    <label>{label}</label>
    {items.map((item, index) => (
      <div key={index} className="array-item">
        <input
          type="text"
          value={item}
          onChange={(e) => onItemChange(index, e.target.value)}
          placeholder={placeholder}
        />
        <div className="array-controls">
          <button
            className="add-btn"
            onClick={onAddItem}
            title="Add item"
          >
            <FaPlus />
          </button>
          {items.length > 1 && (
            <button
              className="remove-btn"
              onClick={() => onRemoveItem(index)}
              title="Remove item"
            >
              <FaMinus />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Timeline Preview Component
const TimelinePreview = ({ item }) => {
  const getCategoryIcon = (category) => {
    const categoryObj = CATEGORIES.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : <FaStar />;
  };

  return (
    <div className="timeline-preview">
      <h3><FaClock /> Live Preview</h3>
      <div className="preview-content">
        <div className="preview-timeline-item">
          <div className="preview-timeline-marker">
            <div className="preview-timeline-icon">
              {getCategoryIcon(item.category)}
            </div>
            <div className="preview-timeline-line"></div>
          </div>
          <div className="preview-timeline-content">
            <div className="preview-timeline-header">
              <h3 className="preview-timeline-title">{item.title || "Untitled Timeline Item"}</h3>
              <div className="preview-timeline-meta">
                <span className="preview-timeline-date">
                  <FaCalendarAlt /> {item.year} {item.quarter}
                </span>
                <span className="preview-timeline-category">
                  {getCategoryIcon(item.category)} {item.category}
                </span>
              </div>
            </div>
            {item.subject && (
              <h4 className="preview-timeline-subject">{item.subject}</h4>
            )}
            {item.image && (
              <div className="preview-timeline-image">
                <img src={item.image} alt="Timeline Event" />
              </div>
            )}
            {item.body && (
              <div className="preview-timeline-body">
                <p>{item.body}</p>
              </div>
            )}
            {item.connections && item.connections.length > 0 && item.connections.some(conn => conn.trim()) && (
              <div className="preview-timeline-connections">
                <h5>Related Events:</h5>
                <ul>
                  {item.connections.filter(conn => conn.trim()).map((connection, index) => (
                    <li key={index}>{connection}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimelineEditor;