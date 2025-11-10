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
  FaCalendarCheck,
  FaChartLine,
  FaTarget,
  FaStar,
  FaExternalLinkAlt,
  FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedYearInReviewsEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedYearInReviewsEditor = ({ onBack }) => {
  const [yearInReviews, setYearInReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch year in reviews on component mount
  useEffect(() => {
    fetchYearInReviews();
  }, []);

  const fetchYearInReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getyearinreviews`);
      setYearInReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching year in reviews:", error);
      setLoading(false);
    }
  };

  const handleSelectReview = (review) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedReview(review);
    setEditingData({ ...review });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newReview = {
      yearInReviewTitle: "",
      yearInReviewSubTitle: "",
      yearInReviewTimeline: "",
      yearInReviewTagline: "",
      yearInReviewImages: [""],
      yearInReviewParagraphs: [""],
      yearInReviewURLs: [""],
      yearInReviewLink: ""
    };
    setSelectedReview(null);
    setEditingData(newReview);
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
          yearInReviewImages: [imageUrl, ...prev.yearInReviewImages.slice(1)]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.yearInReviewTitle.trim()) {
      alert("Please enter a title for the year in review.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedReview) {
        // Update existing review
        const { _id, ...updateData } = editingData;
        response = await axios.put(
          `${API_URL}/updateyearinreview/${selectedReview._id}`,
          updateData
        );
      } else {
        // Create new review
        response = await axios.post(`${API_URL}/addyearinreview`, editingData, {
          withCredentials: true,
        });
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchYearInReviews(); // Refresh the list
        if (!selectedReview && response.data.newItem) {
          setSelectedReview(response.data.newItem);
          setEditingData(response.data.newItem);
        }
        alert("Year in review saved successfully!");
      }
    } catch (error) {
      console.error("Error saving year in review:", error);
      alert("Failed to save year in review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedReview.yearInReviewTitle}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/deleteyearinreview/${selectedReview._id}`);
      if (response.data && response.data.success) {
        await fetchYearInReviews();
        setSelectedReview(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Year in review deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting year in review:", error);
      alert("Failed to delete year in review. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      yearInReviewTitle: `${editingData.yearInReviewTitle} (Copy)`,
      _id: undefined
    };
    setSelectedReview(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedReview) {
      setEditingData({ ...selectedReview });
    } else {
      handleCreateNew();
    }
    setIsDirty(false);
  };

  if (loading) {
    return (
      <div className="enhanced-year-in-reviews-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaCalendarCheck /> Year In Reviews - Visual Editor</h2>
        </div>
        <div className="loading">Loading year in reviews...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-year-in-reviews-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaCalendarCheck /> Year In Reviews - Visual Editor</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Year Review
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
        {/* Sidebar - Year in Reviews List */}
        <div className="year-reviews-sidebar">
          <h3>Annual Reviews ({yearInReviews.length})</h3>
          <div className="year-reviews-list">
            {yearInReviews.map((review) => (
              <div
                key={review._id}
                className={`year-review-item ${
                  selectedReview?._id === review._id ? "active" : ""
                }`}
                onClick={() => handleSelectReview(review)}
              >
                <div className="year-review-icon"><FaCalendarCheck /></div>
                <div className="year-review-details">
                  <div className="year-review-title">{review.yearInReviewTitle || "Untitled"}</div>
                  <div className="year-review-subtitle">{review.yearInReviewSubTitle || "No subtitle"}</div>
                  <div className="year-review-timeline">{review.yearInReviewTimeline || "No timeline"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <FaCalendarCheck className="large-icon" />
              <h3>Select a year review to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Year Review
              </button>
            </div>
          ) : previewMode ? (
            <YearReviewPreview review={editingData} />
          ) : (
            <YearReviewEditor
              review={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedReview={selectedReview}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Year Review Editor Component
const YearReviewEditor = ({
  review,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedReview,
  isDirty
}) => (
  <div className="year-review-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedReview && (
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
        <h4><FaCalendarCheck /> Year Review Information</h4>
        <div className="form-group">
          <label>Review Title *</label>
          <input
            type="text"
            value={review.yearInReviewTitle}
            onChange={(e) => onFieldChange("yearInReviewTitle", e.target.value)}
            placeholder="e.g., 2023: Year of Growth, My Journey Through 2024"
          />
        </div>

        <div className="form-group">
          <label>Year/Theme</label>
          <input
            type="text"
            value={review.yearInReviewSubTitle}
            onChange={(e) => onFieldChange("yearInReviewSubTitle", e.target.value)}
            placeholder="e.g., Professional Development, Personal Milestones"
          />
        </div>

        <div className="form-group">
          <label>Time Period</label>
          <input
            type="text"
            value={review.yearInReviewTimeline}
            onChange={(e) => onFieldChange("yearInReviewTimeline", e.target.value)}
            placeholder="e.g., January 2024 - December 2024, Academic Year 2023-24"
          />
        </div>

        <div className="form-group">
          <label>Summary/Overview</label>
          <textarea
            value={review.yearInReviewTagline}
            onChange={(e) => onFieldChange("yearInReviewTagline", e.target.value)}
            placeholder="Brief overview of the year's highlights and key themes"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Main Link</label>
          <input
            type="url"
            value={review.yearInReviewLink}
            onChange={(e) => onFieldChange("yearInReviewLink", e.target.value)}
            placeholder="https://blog.example.com/2024-year-review"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="form-section">
        <h4>📷 Year Highlights & Photos</h4>
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
            <FaUpload /> Upload Highlight Photo
          </button>
          {review.yearInReviewImages[0] && (
            <div className="image-preview">
              <img
                src={review.yearInReviewImages[0]}
                alt="Year Highlight"
                style={{ maxWidth: "300px", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <ArrayEditor
          label="Image URLs & Highlight Photos"
          items={review.yearInReviewImages}
          onItemChange={(index, value) => onArrayFieldChange("yearInReviewImages", index, value)}
          onAddItem={() => onAddArrayItem("yearInReviewImages")}
          onRemoveItem={(index) => onRemoveArrayItem("yearInReviewImages", index)}
          placeholder="https://example.com/highlight-photo.jpg"
        />
      </div>

      {/* Content Section */}
      <div className="form-section">
        <h4>📝 Detailed Year Review</h4>
        <ArrayEditor
          label="Year Review Sections"
          items={review.yearInReviewParagraphs}
          onItemChange={(index, value) => onArrayFieldChange("yearInReviewParagraphs", index, value)}
          onAddItem={() => onAddArrayItem("yearInReviewParagraphs")}
          onRemoveItem={(index) => onRemoveArrayItem("yearInReviewParagraphs", index)}
          placeholder="Describe achievements, challenges, learnings, goals accomplished, and reflections on this year..."
          multiline
        />

        <ArrayEditor
          label="Related Links (Blog posts, Documentation, References)"
          items={review.yearInReviewURLs}
          onItemChange={(index, value) => onArrayFieldChange("yearInReviewURLs", index, value)}
          onAddItem={() => onAddArrayItem("yearInReviewURLs")}
          onRemoveItem={(index) => onRemoveArrayItem("yearInReviewURLs", index)}
          placeholder="https://blog.com/detailed-review or https://linkedin.com/post"
        />
      </div>
    </div>
  </div>
);

// Array Editor Component
const ArrayEditor = ({ label, items, onItemChange, onAddItem, onRemoveItem, placeholder, multiline }) => (
  <div className="array-editor">
    <label>{label}</label>
    {items.map((item, index) => (
      <div key={index} className="array-item">
        {multiline ? (
          <textarea
            value={item}
            onChange={(e) => onItemChange(index, e.target.value)}
            placeholder={placeholder}
            rows="4"
          />
        ) : (
          <input
            type="text"
            value={item}
            onChange={(e) => onItemChange(index, e.target.value)}
            placeholder={placeholder}
          />
        )}
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

// Year Review Preview Component
const YearReviewPreview = ({ review }) => (
  <div className="year-review-preview">
    <h3><FaCalendarCheck /> Live Preview</h3>
    <div className="preview-content">
      <div className="preview-year-review-container">
        <div className="preview-year-review-image">
          {review.yearInReviewImages[0] ? (
            <img
              src={review.yearInReviewImages[0]}
              alt=""
              className="preview-year-review-image-content"
            />
          ) : (
            <div className="no-image"><FaCalendarCheck />No Highlight Photo</div>
          )}
        </div>
        <div className="preview-year-review-details">
          <h2 className="preview-year-review-title">
            <FaCalendarCheck /> {review.yearInReviewTitle || "Untitled Year Review"}
          </h2>
          <div className="preview-year-review-subtitle-area">
            <h4 className="preview-year-review-subtitle">
              {review.yearInReviewSubTitle || "No theme specified"}
            </h4>
            <p className="preview-year-review-timeline">
              <FaCalendarAlt /> {review.yearInReviewTimeline || "No timeline"}
            </p>
          </div>
          <p className="preview-year-review-tagline">
            {review.yearInReviewTagline || "No overview"}
          </p>
          <div className="preview-year-review-buttons">
            <button className="preview-btn-styled primary">
              <FaChartLine /> View Highlights
            </button>
            <button className="preview-btn-styled secondary">
              <FaExternalLinkAlt /> Read Full Review
            </button>
          </div>
        </div>
      </div>
      {review.yearInReviewParagraphs.some(p => p.trim()) && (
        <div className="preview-paragraphs">
          <h4>Year Review Details:</h4>
          {review.yearInReviewParagraphs.map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="preview-paragraph">{paragraph}</p>
            )
          ))}
        </div>
      )}
      {review.yearInReviewURLs.some(url => url.trim()) && (
        <div className="preview-links">
          <h4>Related Links:</h4>
          <div className="preview-links-container">
            {review.yearInReviewURLs.map((url, index) => (
              url.trim() && (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="preview-link">
                  <FaExternalLinkAlt /> {url.includes('blog') ? 'Blog Post' : 'Related Link'}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default EnhancedYearInReviewsEditor;