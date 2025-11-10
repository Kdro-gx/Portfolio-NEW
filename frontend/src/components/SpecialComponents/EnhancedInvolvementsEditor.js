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
  FaUsers,
  FaGraduationCap,
  FaHandshake,
  FaGithub,
  FaExternalLinkAlt,
  FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedInvolvementsEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedInvolvementsEditor = ({ onBack }) => {
  const [involvements, setInvolvements] = useState([]);
  const [selectedInvolvement, setSelectedInvolvement] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch involvements on component mount
  useEffect(() => {
    fetchInvolvements();
  }, []);

  const fetchInvolvements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getinvolvements`);
      setInvolvements(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching involvements:", error);
      setLoading(false);
    }
  };

  const handleSelectInvolvement = (involvement) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedInvolvement(involvement);
    setEditingData({ ...involvement });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newInvolvement = {
      involvementTitle: "",
      involvementSubTitle: "",
      involvementTimeline: "",
      involvementTagline: "",
      involvementImages: [""],
      involvementParagraphs: [""],
      involvementURLs: [""],
      involvementLink: ""
    };
    setSelectedInvolvement(null);
    setEditingData(newInvolvement);
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
          involvementImages: [imageUrl, ...prev.involvementImages.slice(1)]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.involvementTitle.trim()) {
      alert("Please enter a title for the involvement.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedInvolvement) {
        // Update existing involvement
        const { _id, ...updateData } = editingData;
        response = await axios.put(
          `${API_URL}/updateinvolvement/${selectedInvolvement._id}`,
          updateData
        );
      } else {
        // Create new involvement
        response = await axios.post(`${API_URL}/addinvolvement`, editingData, {
          withCredentials: true,
        });
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchInvolvements(); // Refresh the list
        if (!selectedInvolvement && response.data.newItem) {
          setSelectedInvolvement(response.data.newItem);
          setEditingData(response.data.newItem);
        }
        alert("Involvement saved successfully!");
      }
    } catch (error) {
      console.error("Error saving involvement:", error);
      alert("Failed to save involvement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvolvement) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedInvolvement.involvementTitle}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/deleteinvolvement/${selectedInvolvement._id}`);
      if (response.data && response.data.success) {
        await fetchInvolvements();
        setSelectedInvolvement(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Involvement deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting involvement:", error);
      alert("Failed to delete involvement. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      involvementTitle: `${editingData.involvementTitle} (Copy)`,
      _id: undefined
    };
    setSelectedInvolvement(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedInvolvement) {
      setEditingData({ ...selectedInvolvement });
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

    const newInvolvements = [...involvements];
    const draggedItem = newInvolvements[draggedIndex];
    newInvolvements.splice(draggedIndex, 1);
    newInvolvements.splice(index, 0, draggedItem);

    setInvolvements(newInvolvements);
    setDraggedIndex(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    try {
      const items = involvements.map((involvement, index) => ({
        _id: involvement._id,
        order: index
      }));

      const response = await axios.post(`${API_URL}/reorder`, {
        collection: 'involvementsTable',
        items
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        console.log('Involvements order saved successfully');
      }
    } catch (error) {
      console.error('Error saving involvements order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to save new order. Please try again.');
      fetchInvolvements();
    }
  };

  if (loading) {
    return (
      <div className="enhanced-involvements-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaUsers /> My Involvements - Visual Editor</h2>
        </div>
        <div className="loading">Loading involvements...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-involvements-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaUsers /> My Involvements - Visual Editor</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Involvement
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
        {/* Sidebar - Involvements List */}
        <div className="involvements-sidebar">
          <h3>Community Involvements ({involvements.length})</h3>
          <p className="drag-hint">💡 Drag to reorder</p>
          <div className="involvements-list">
            {involvements.map((involvement, index) => (
              <div
                key={involvement._id}
                className={`involvement-item ${
                  selectedInvolvement?._id === involvement._id ? "active" : ""
                } ${draggedIndex === index ? "dragging" : ""}`}
                onClick={() => handleSelectInvolvement(involvement)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
              >
                <div className="drag-handle">⋮⋮</div>
                <div className="involvement-icon"><FaUsers /></div>
                <div className="involvement-details">
                  <div className="involvement-title">{involvement.involvementTitle || "Untitled"}</div>
                  <div className="involvement-subtitle">{involvement.involvementSubTitle || "No subtitle"}</div>
                  <div className="involvement-timeline">{involvement.involvementTimeline || "No timeline"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <FaUsers className="large-icon" />
              <h3>Select an involvement to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Involvement
              </button>
            </div>
          ) : previewMode ? (
            <InvolvementPreview involvement={editingData} />
          ) : (
            <InvolvementEditor
              involvement={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedInvolvement={selectedInvolvement}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Involvement Editor Component
const InvolvementEditor = ({
  involvement,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedInvolvement,
  isDirty
}) => (
  <div className="involvement-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedInvolvement && (
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
        <h4><FaUsers /> Involvement Information</h4>
        <div className="form-group">
          <label>Involvement Title *</label>
          <input
            type="text"
            value={involvement.involvementTitle}
            onChange={(e) => onFieldChange("involvementTitle", e.target.value)}
            placeholder="e.g., Student Government, Volunteer Organization, Club Leadership"
          />
        </div>

        <div className="form-group">
          <label>Organization/Role</label>
          <input
            type="text"
            value={involvement.involvementSubTitle}
            onChange={(e) => onFieldChange("involvementSubTitle", e.target.value)}
            placeholder="e.g., President, Volunteer Coordinator, Team Lead"
          />
        </div>

        <div className="form-group">
          <label>Time Period</label>
          <input
            type="text"
            value={involvement.involvementTimeline}
            onChange={(e) => onFieldChange("involvementTimeline", e.target.value)}
            placeholder="e.g., Jan 2023 - Present, Summer 2022, 2 years"
          />
        </div>

        <div className="form-group">
          <label>Short Description</label>
          <textarea
            value={involvement.involvementTagline}
            onChange={(e) => onFieldChange("involvementTagline", e.target.value)}
            placeholder="Brief overview of your role and key contributions"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Main Link</label>
          <input
            type="url"
            value={involvement.involvementLink}
            onChange={(e) => onFieldChange("involvementLink", e.target.value)}
            placeholder="https://organization-website.com or https://linkedin.com/in/profile"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="form-section">
        <h4>📷 Photos & Media</h4>
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
            <FaUpload /> Upload Photo
          </button>
          {involvement.involvementImages[0] && (
            <div className="image-preview">
              <img
                src={involvement.involvementImages[0]}
                alt="Involvement Photo"
                style={{ maxWidth: "300px", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <ArrayEditor
          label="Image URLs & Photos"
          items={involvement.involvementImages}
          onItemChange={(index, value) => onArrayFieldChange("involvementImages", index, value)}
          onAddItem={() => onAddArrayItem("involvementImages")}
          onRemoveItem={(index) => onRemoveArrayItem("involvementImages", index)}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {/* Content Section */}
      <div className="form-section">
        <h4>📝 Detailed Description</h4>
        <ArrayEditor
          label="Detailed Descriptions"
          items={involvement.involvementParagraphs}
          onItemChange={(index, value) => onArrayFieldChange("involvementParagraphs", index, value)}
          onAddItem={() => onAddArrayItem("involvementParagraphs")}
          onRemoveItem={(index) => onRemoveArrayItem("involvementParagraphs", index)}
          placeholder="Describe your responsibilities, achievements, impact, skills developed, and key experiences..."
          multiline
        />

        <ArrayEditor
          label="Related Links (Organization, LinkedIn, Documentation)"
          items={involvement.involvementURLs}
          onItemChange={(index, value) => onArrayFieldChange("involvementURLs", index, value)}
          onAddItem={() => onAddArrayItem("involvementURLs")}
          onRemoveItem={(index) => onRemoveArrayItem("involvementURLs", index)}
          placeholder="https://organization.com or https://linkedin.com/company/organization"
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

// Involvement Preview Component
const InvolvementPreview = ({ involvement }) => (
  <div className="involvement-preview">
    <h3><FaUsers /> Live Preview</h3>
    <div className="preview-content">
      <div className="preview-involvement-container">
        <div className="preview-involvement-image">
          {involvement.involvementImages[0] ? (
            <img
              src={involvement.involvementImages[0]}
              alt=""
              className="preview-involvement-image-content"
            />
          ) : (
            <div className="no-image"><FaUsers />No Photo</div>
          )}
        </div>
        <div className="preview-involvement-details">
          <h2 className="preview-involvement-title">
            <FaUsers /> {involvement.involvementTitle || "Untitled Involvement"}
          </h2>
          <div className="preview-involvement-subtitle-area">
            <h4 className="preview-involvement-subtitle">
              {involvement.involvementSubTitle || "No role specified"}
            </h4>
            <p className="preview-involvement-timeline">
              <FaCalendarAlt /> {involvement.involvementTimeline || "No timeline"}
            </p>
          </div>
          <p className="preview-involvement-tagline">
            {involvement.involvementTagline || "No description"}
          </p>
          <div className="preview-involvement-buttons">
            <button className="preview-btn-styled primary">
              <FaHandshake /> Learn More
            </button>
            <button className="preview-btn-styled secondary">
              <FaExternalLinkAlt /> Organization
            </button>
          </div>
        </div>
      </div>
      {involvement.involvementParagraphs.some(p => p.trim()) && (
        <div className="preview-paragraphs">
          <h4>Involvement Details:</h4>
          {involvement.involvementParagraphs.map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="preview-paragraph">{paragraph}</p>
            )
          ))}
        </div>
      )}
      {involvement.involvementURLs.some(url => url.trim()) && (
        <div className="preview-links">
          <h4>Related Links:</h4>
          <div className="preview-links-container">
            {involvement.involvementURLs.map((url, index) => (
              url.trim() && (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="preview-link">
                  <FaExternalLinkAlt /> {url.includes('linkedin') ? 'LinkedIn' : 'Organization Link'}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default EnhancedInvolvementsEditor;