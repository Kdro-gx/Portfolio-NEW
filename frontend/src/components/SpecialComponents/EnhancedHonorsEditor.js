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
  FaTrophy
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedHonorsEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedHonorsEditor = ({ onBack }) => {
  const [honors, setHonors] = useState([]);
  const [selectedHonor, setSelectedHonor] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch honors on component mount
  useEffect(() => {
    fetchHonors();
  }, []);

  const fetchHonors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/gethonorsexperiences`);
      setHonors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching honors:", error);
      setLoading(false);
    }
  };

  const handleSelectHonor = (honor) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedHonor(honor);
    setEditingData({ ...honor });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newHonor = {
      honorsExperienceTitle: "",
      honorsExperienceSubTitle: "",
      honorsExperienceTimeline: "",
      honorsExperienceTagline: "",
      honorsExperienceImages: [""],
      honorsExperienceParagraphs: [""],
      honorsExperienceURLs: [""],
      honorsExperienceLink: ""
    };
    setSelectedHonor(null);
    setEditingData(newHonor);
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
          honorsExperienceImages: [imageUrl, ...prev.honorsExperienceImages.slice(1)]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.honorsExperienceTitle.trim()) {
      alert("Please enter a title for the honor/achievement.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedHonor) {
        // Update existing honor
        const { _id, ...updateData } = editingData;
        response = await axios.put(
          `${API_URL}/updatehonorsexperience/${selectedHonor._id}`,
          updateData
        );
      } else {
        // Create new honor
        response = await axios.post(`${API_URL}/addhonorsexperience`, editingData, {
          withCredentials: true,
        });
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchHonors(); // Refresh the list
        if (!selectedHonor && response.data.newItem) {
          setSelectedHonor(response.data.newItem);
          setEditingData(response.data.newItem);
        }
        alert("Honor/Achievement saved successfully!");
      }
    } catch (error) {
      console.error("Error saving honor:", error);
      alert("Failed to save honor/achievement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHonor) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedHonor.honorsExperienceTitle}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/deletehonorsexperience/${selectedHonor._id}`);
      if (response.data && response.data.success) {
        await fetchHonors();
        setSelectedHonor(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Honor/Achievement deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting honor:", error);
      alert("Failed to delete honor/achievement. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      honorsExperienceTitle: `${editingData.honorsExperienceTitle} (Copy)`,
      _id: undefined
    };
    setSelectedHonor(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedHonor) {
      setEditingData({ ...selectedHonor });
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

    const newHonors = [...honors];
    const draggedItem = newHonors[draggedIndex];
    newHonors.splice(draggedIndex, 1);
    newHonors.splice(index, 0, draggedItem);

    setHonors(newHonors);
    setDraggedIndex(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    try {
      const items = honors.map((honor, index) => ({
        _id: honor._id,
        order: index
      }));

      const response = await axios.post(`${API_URL}/reorder`, {
        collection: 'honorsTable',
        items
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        console.log('Honors order saved successfully');
      }
    } catch (error) {
      console.error('Error saving honors order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to save new order. Please try again.');
      fetchHonors();
    }
  };

  if (loading) {
    return (
      <div className="enhanced-honors-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaTrophy /> My Honors - Visual Editor</h2>
        </div>
        <div className="loading">Loading honors and achievements...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-honors-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaTrophy /> My Honors - Visual Editor</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Honor/Achievement
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
        {/* Sidebar - Honors List */}
        <div className="honors-sidebar">
          <h3>Honors & Achievements ({honors.length})</h3>
          <p className="drag-hint">💡 Drag to reorder</p>
          <div className="honors-list">
            {honors.map((honor, index) => (
              <div
                key={honor._id}
                className={`honor-item ${
                  selectedHonor?._id === honor._id ? "active" : ""
                } ${draggedIndex === index ? "dragging" : ""}`}
                onClick={() => handleSelectHonor(honor)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
              >
                <div className="drag-handle">⋮⋮</div>
                <div className="honor-icon"><FaTrophy /></div>
                <div className="honor-details">
                  <div className="honor-title">{honor.honorsExperienceTitle || "Untitled"}</div>
                  <div className="honor-subtitle">{honor.honorsExperienceSubTitle || "No subtitle"}</div>
                  <div className="honor-timeline">{honor.honorsExperienceTimeline || "No date"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <FaTrophy className="large-icon" />
              <h3>Select a honor/achievement to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Honor/Achievement
              </button>
            </div>
          ) : previewMode ? (
            <HonorPreview honor={editingData} />
          ) : (
            <HonorEditor
              honor={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedHonor={selectedHonor}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Honor Editor Component
const HonorEditor = ({
  honor,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedHonor,
  isDirty
}) => (
  <div className="honor-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedHonor && (
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
        <h4><FaTrophy /> Honor/Achievement Information</h4>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={honor.honorsExperienceTitle}
            onChange={(e) => onFieldChange("honorsExperienceTitle", e.target.value)}
            placeholder="e.g., Dean's List, Magna Cum Laude, Best Project Award"
          />
        </div>

        <div className="form-group">
          <label>Institution/Organization</label>
          <input
            type="text"
            value={honor.honorsExperienceSubTitle}
            onChange={(e) => onFieldChange("honorsExperienceSubTitle", e.target.value)}
            placeholder="e.g., University of Florida, IEEE, ACM"
          />
        </div>

        <div className="form-group">
          <label>Date/Timeline</label>
          <input
            type="text"
            value={honor.honorsExperienceTimeline}
            onChange={(e) => onFieldChange("honorsExperienceTimeline", e.target.value)}
            placeholder="e.g., Spring 2023, December 2022, 2020-2023"
          />
        </div>

        <div className="form-group">
          <label>Achievement Description</label>
          <textarea
            value={honor.honorsExperienceTagline}
            onChange={(e) => onFieldChange("honorsExperienceTagline", e.target.value)}
            placeholder="Brief description of the achievement and what it represents"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Related Link</label>
          <input
            type="url"
            value={honor.honorsExperienceLink}
            onChange={(e) => onFieldChange("honorsExperienceLink", e.target.value)}
            placeholder="https://link-to-certificate-or-announcement.com"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="form-section">
        <h4>📸 Images & Certificates</h4>
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
            <FaUpload /> Upload Certificate/Image
          </button>
          {honor.honorsExperienceImages[0] && (
            <div className="image-preview">
              <img
                src={honor.honorsExperienceImages[0]}
                alt="Honor Certificate"
                style={{ maxWidth: "250px", maxHeight: "150px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <ArrayEditor
          label="Image URLs"
          items={honor.honorsExperienceImages}
          onItemChange={(index, value) => onArrayFieldChange("honorsExperienceImages", index, value)}
          onAddItem={() => onAddArrayItem("honorsExperienceImages")}
          onRemoveItem={(index) => onRemoveArrayItem("honorsExperienceImages", index)}
          placeholder="https://example.com/certificate.jpg"
        />
      </div>

      {/* Content Section */}
      <div className="form-section">
        <h4>📝 Detailed Information</h4>
        <ArrayEditor
          label="Detailed Descriptions"
          items={honor.honorsExperienceParagraphs}
          onItemChange={(index, value) => onArrayFieldChange("honorsExperienceParagraphs", index, value)}
          onAddItem={() => onAddArrayItem("honorsExperienceParagraphs")}
          onRemoveItem={(index) => onRemoveArrayItem("honorsExperienceParagraphs", index)}
          placeholder="Provide detailed information about the criteria, significance, and impact of this achievement..."
          multiline
        />

        <ArrayEditor
          label="Related URLs & References"
          items={honor.honorsExperienceURLs}
          onItemChange={(index, value) => onArrayFieldChange("honorsExperienceURLs", index, value)}
          onAddItem={() => onAddArrayItem("honorsExperienceURLs")}
          onRemoveItem={(index) => onRemoveArrayItem("honorsExperienceURLs", index)}
          placeholder="https://additional-links.com"
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

// Honor Preview Component
const HonorPreview = ({ honor }) => (
  <div className="honor-preview">
    <h3><FaTrophy /> Live Preview</h3>
    <div className="preview-content">
      <div className="preview-honor-container">
        <div className="preview-honor-image">
          {honor.honorsExperienceImages[0] ? (
            <img
              src={honor.honorsExperienceImages[0]}
              alt=""
              className="preview-honor-image-content"
            />
          ) : (
            <div className="no-image"><FaTrophy />No Image</div>
          )}
        </div>
        <div className="preview-honor-details">
          <h2 className="preview-honor-title">
            <FaTrophy /> {honor.honorsExperienceTitle || "Untitled Achievement"}
          </h2>
          <div className="preview-honor-subtitle-area">
            <h4 className="preview-honor-subtitle">
              {honor.honorsExperienceSubTitle || "No institution"}
            </h4>
            <p className="preview-honor-timeline">
              {honor.honorsExperienceTimeline || "No date"}
            </p>
          </div>
          <p className="preview-honor-tagline">
            {honor.honorsExperienceTagline || "No description"}
          </p>
          <div className="preview-learn-button">
            <button className="preview-btn-styled">Learn More →</button>
          </div>
        </div>
      </div>
      {honor.honorsExperienceParagraphs.some(p => p.trim()) && (
        <div className="preview-paragraphs">
          <h4>Details:</h4>
          {honor.honorsExperienceParagraphs.map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="preview-paragraph">{paragraph}</p>
            )
          ))}
        </div>
      )}
    </div>
  </div>
);

export default EnhancedHonorsEditor;