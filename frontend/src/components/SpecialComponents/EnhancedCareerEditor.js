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
  FaUndo
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedCareerEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedCareerEditor = ({ onBack }) => {
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch experiences on component mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getexperiences`);
      setExperiences(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setLoading(false);
    }
  };

  const handleSelectExperience = (experience) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedExperience(experience);
    setEditingData({ ...experience });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newExperience = {
      experienceTitle: "",
      experienceSubTitle: "",
      experienceTimeline: "",
      experienceTagline: "",
      experienceImages: [""],
      experienceParagraphs: [""],
      experienceURLs: [""],
      experienceLink: ""
    };
    setSelectedExperience(null);
    setEditingData(newExperience);
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
          experienceImages: [imageUrl, ...prev.experienceImages.slice(1)]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.experienceTitle.trim()) {
      alert("Please enter a title for the experience.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedExperience) {
        // Update existing experience
        const { _id, ...updateData } = editingData;
        response = await axios.put(
          `${API_URL}/updateexperience/${selectedExperience._id}`,
          updateData
        );
      } else {
        // Create new experience
        response = await axios.post(`${API_URL}/addexperience`, editingData, {
          withCredentials: true,
        });
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchExperiences(); // Refresh the list
        if (!selectedExperience && response.data.newItem) {
          setSelectedExperience(response.data.newItem);
          setEditingData(response.data.newItem);
        }
        alert("Experience saved successfully!");
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      alert("Failed to save experience. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedExperience.experienceTitle}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/deleteexperience/${selectedExperience._id}`);
      if (response.data && response.data.success) {
        await fetchExperiences();
        setSelectedExperience(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Experience deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      alert("Failed to delete experience. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      experienceTitle: `${editingData.experienceTitle} (Copy)`,
      _id: undefined
    };
    setSelectedExperience(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedExperience) {
      setEditingData({ ...selectedExperience });
    } else {
      handleCreateNew();
    }
    setIsDirty(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newExperiences = [...experiences];
    const draggedItem = newExperiences[draggedIndex];
    newExperiences.splice(draggedIndex, 1);
    newExperiences.splice(index, 0, draggedItem);

    setExperiences(newExperiences);
    setDraggedIndex(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    try {
      const items = experiences.map((experience, index) => ({
        _id: experience._id,
        order: index
      }));

      const response = await axios.post(`${API_URL}/reorder`, {
        collection: 'experienceTable',
        items
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        console.log('Experience order saved successfully');
      }
    } catch (error) {
      console.error('Error saving experience order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to save new order. Please try again.');
      fetchExperiences();
    }
  };

  if (loading) {
    return (
      <div className="enhanced-career-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2>My Career - Visual Editor</h2>
        </div>
        <div className="loading">Loading experiences...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-career-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2>My Career - Visual Editor</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Experience
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
        {/* Sidebar - Experience List */}
        <div className="experience-sidebar">
          <h3>Experiences ({experiences.length})</h3>
          <p className="drag-hint">💡 Drag to reorder</p>
          <div className="experience-list">
            {experiences.map((exp, index) => (
              <div
                key={exp._id}
                className={`experience-item ${
                  selectedExperience?._id === exp._id ? "active" : ""
                } ${draggedIndex === index ? "dragging" : ""}`}
                onClick={() => handleSelectExperience(exp)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
              >
                <div className="drag-handle">⋮⋮</div>
                <div className="exp-details">
                  <div className="exp-title">{exp.experienceTitle || "Untitled"}</div>
                  <div className="exp-subtitle">{exp.experienceSubTitle || "No subtitle"}</div>
                  <div className="exp-timeline">{exp.experienceTimeline || "No timeline"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <h3>Select an experience to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Experience
              </button>
            </div>
          ) : previewMode ? (
            <ExperiencePreview experience={editingData} />
          ) : (
            <ExperienceEditor
              experience={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedExperience={selectedExperience}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Experience Editor Component
const ExperienceEditor = ({
  experience,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedExperience,
  isDirty
}) => (
  <div className="experience-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedExperience && (
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
        <h4>Basic Information</h4>
        <div className="form-group">
          <label>Experience Title *</label>
          <input
            type="text"
            value={experience.experienceTitle}
            onChange={(e) => onFieldChange("experienceTitle", e.target.value)}
            placeholder="e.g., Software Engineer at Tech Corp"
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            value={experience.experienceSubTitle}
            onChange={(e) => onFieldChange("experienceSubTitle", e.target.value)}
            placeholder="e.g., Full-Stack Development Team"
          />
        </div>

        <div className="form-group">
          <label>Timeline</label>
          <input
            type="text"
            value={experience.experienceTimeline}
            onChange={(e) => onFieldChange("experienceTimeline", e.target.value)}
            placeholder="e.g., Jan 2023 - Present"
          />
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <textarea
            value={experience.experienceTagline}
            onChange={(e) => onFieldChange("experienceTagline", e.target.value)}
            placeholder="Brief description or key achievement"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Link</label>
          <input
            type="url"
            value={experience.experienceLink}
            onChange={(e) => onFieldChange("experienceLink", e.target.value)}
            placeholder="https://company.com"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="form-section">
        <h4>Images</h4>
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
          {experience.experienceImages[0] && (
            <div className="image-preview">
              <img
                src={experience.experienceImages[0]}
                alt="Experience"
                style={{ maxWidth: "200px", maxHeight: "120px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <ArrayEditor
          label="Image URLs"
          items={experience.experienceImages}
          onItemChange={(index, value) => onArrayFieldChange("experienceImages", index, value)}
          onAddItem={() => onAddArrayItem("experienceImages")}
          onRemoveItem={(index) => onRemoveArrayItem("experienceImages", index)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Content Section */}
      <div className="form-section">
        <h4>Content</h4>
        <ArrayEditor
          label="Paragraphs"
          items={experience.experienceParagraphs}
          onItemChange={(index, value) => onArrayFieldChange("experienceParagraphs", index, value)}
          onAddItem={() => onAddArrayItem("experienceParagraphs")}
          onRemoveItem={(index) => onRemoveArrayItem("experienceParagraphs", index)}
          placeholder="Describe your experience, achievements, and responsibilities..."
          multiline
        />

        <ArrayEditor
          label="Related URLs"
          items={experience.experienceURLs}
          onItemChange={(index, value) => onArrayFieldChange("experienceURLs", index, value)}
          onAddItem={() => onAddArrayItem("experienceURLs")}
          onRemoveItem={(index) => onRemoveArrayItem("experienceURLs", index)}
          placeholder="https://related-link.com"
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

// Experience Preview Component
const ExperiencePreview = ({ experience }) => (
  <div className="experience-preview">
    <h3>Live Preview</h3>
    <div className="preview-content">
      <div className="preview-career-container">
        <div className="preview-career-image">
          {experience.experienceImages[0] ? (
            <img
              src={experience.experienceImages[0]}
              alt=""
              className="preview-career-image-content"
            />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>
        <div className="preview-career-details">
          <h2 className="preview-career-title">
            {experience.experienceTitle || "Untitled Experience"}
          </h2>
          <div className="preview-career-subtitle-area">
            <h4 className="preview-career-subtitle">
              {experience.experienceSubTitle || "No subtitle"}
            </h4>
            <p className="preview-career-timeline">
              {experience.experienceTimeline || "No timeline"}
            </p>
          </div>
          <p className="preview-career-tagline">
            {experience.experienceTagline || "No tagline"}
          </p>
          <div className="preview-learn-button">
            <button className="preview-btn-styled">Learn More →</button>
          </div>
        </div>
      </div>
      {experience.experienceParagraphs.some(p => p.trim()) && (
        <div className="preview-paragraphs">
          <h4>Content:</h4>
          {experience.experienceParagraphs.map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="preview-paragraph">{paragraph}</p>
            )
          ))}
        </div>
      )}
    </div>
  </div>
);

export default EnhancedCareerEditor;