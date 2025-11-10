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
  FaRocket,
  FaGithub,
  FaExternalLinkAlt
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedProjectsEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedProjectsEditor = ({ onBack }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getprojects`);
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedProject(project);
    setEditingData({ ...project });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNew = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newProject = {
      projectTitle: "",
      projectSubTitle: "",
      projectTimeline: "",
      projectTagline: "",
      projectImages: [""],
      projectParagraphs: [""],
      projectURLs: [""],
      projectLink: ""
    };
    setSelectedProject(null);
    setEditingData(newProject);
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
          projectImages: [imageUrl, ...prev.projectImages.slice(1)]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editingData.projectTitle.trim()) {
      alert("Please enter a title for the project.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedProject) {
        // Update existing project
        const { _id, ...updateData } = editingData;
        response = await axios.put(
          `${API_URL}/updateproject/${selectedProject._id}`,
          updateData
        );
      } else {
        // Create new project
        response = await axios.post(`${API_URL}/addproject`, editingData, {
          withCredentials: true,
        });
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchProjects(); // Refresh the list
        if (!selectedProject && response.data.newItem) {
          setSelectedProject(response.data.newItem);
          setEditingData(response.data.newItem);
        }
        alert("Project saved successfully!");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    if (!window.confirm(`Are you sure you want to delete "${selectedProject.projectTitle}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/deleteproject/${selectedProject._id}`);
      if (response.data && response.data.success) {
        await fetchProjects();
        setSelectedProject(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Project deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      projectTitle: `${editingData.projectTitle} (Copy)`,
      _id: undefined
    };
    setSelectedProject(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedProject) {
      setEditingData({ ...selectedProject });
    } else {
      handleCreateNew();
    }
    setIsDirty(false);
  };

  // Drag and Drop handlers
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

    const newProjects = [...projects];
    const draggedItem = newProjects[draggedIndex];

    // Remove dragged item
    newProjects.splice(draggedIndex, 1);
    // Insert at new position
    newProjects.splice(index, 0, draggedItem);

    setProjects(newProjects);
    setDraggedIndex(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    // Save new order to backend
    try {
      const items = projects.map((project, index) => ({
        _id: project._id,
        order: index
      }));

      const response = await axios.post(`${API_URL}/reorder`, {
        collection: 'projectTable',
        items
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        console.log('Project order saved successfully');
      }
    } catch (error) {
      console.error('Error saving project order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to save new order. Please try again.');
      // Refresh projects to restore original order
      fetchProjects();
    }
  };

  if (loading) {
    return (
      <div className="enhanced-projects-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaRocket /> My Projects - Visual Editor</h2>
        </div>
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-projects-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaRocket /> My Projects - Visual Editor</h2>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNew}>
            <FaPlus /> New Project
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
        {/* Sidebar - Projects List */}
        <div className="projects-sidebar">
          <h3>Projects Portfolio ({projects.length})</h3>
          <p className="drag-hint">💡 Drag to reorder</p>
          <div className="projects-list">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className={`project-item ${
                  selectedProject?._id === project._id ? "active" : ""
                } ${draggedIndex === index ? "dragging" : ""}`}
                onClick={() => handleSelectProject(project)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
              >
                <div className="drag-handle">⋮⋮</div>
                <div className="project-icon"><FaRocket /></div>
                <div className="project-details">
                  <div className="project-title">{project.projectTitle || "Untitled"}</div>
                  <div className="project-subtitle">{project.projectSubTitle || "No subtitle"}</div>
                  <div className="project-timeline">{project.projectTimeline || "No timeline"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              <FaRocket className="large-icon" />
              <h3>Select a project to edit or create a new one</h3>
              <button className="create-btn large" onClick={handleCreateNew}>
                <FaPlus /> Create New Project
              </button>
            </div>
          ) : previewMode ? (
            <ProjectPreview project={editingData} />
          ) : (
            <ProjectEditor
              project={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedProject={selectedProject}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Project Editor Component
const ProjectEditor = ({
  project,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedProject,
  isDirty
}) => (
  <div className="project-editor">
    <div className="editor-actions">
      <button className="action-btn" onClick={onDuplicate}>
        <FaCopy /> Duplicate
      </button>
      {selectedProject && (
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
        <h4><FaRocket /> Project Information</h4>
        <div className="form-group">
          <label>Project Title *</label>
          <input
            type="text"
            value={project.projectTitle}
            onChange={(e) => onFieldChange("projectTitle", e.target.value)}
            placeholder="e.g., AI-Powered Task Manager, E-commerce Platform"
          />
        </div>

        <div className="form-group">
          <label>Subtitle/Technology Stack</label>
          <input
            type="text"
            value={project.projectSubTitle}
            onChange={(e) => onFieldChange("projectSubTitle", e.target.value)}
            placeholder="e.g., React, Node.js, MongoDB | Python, TensorFlow"
          />
        </div>

        <div className="form-group">
          <label>Development Timeline</label>
          <input
            type="text"
            value={project.projectTimeline}
            onChange={(e) => onFieldChange("projectTimeline", e.target.value)}
            placeholder="e.g., Sep 2023 - Dec 2023, 3 months"
          />
        </div>

        <div className="form-group">
          <label>Project Summary</label>
          <textarea
            value={project.projectTagline}
            onChange={(e) => onFieldChange("projectTagline", e.target.value)}
            placeholder="Brief overview of what the project does and its key features"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Main Project Link</label>
          <input
            type="url"
            value={project.projectLink}
            onChange={(e) => onFieldChange("projectLink", e.target.value)}
            placeholder="https://github.com/username/project or https://live-demo.com"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="form-section">
        <h4>📷 Project Screenshots & Media</h4>
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
            <FaUpload /> Upload Screenshot
          </button>
          {project.projectImages[0] && (
            <div className="image-preview">
              <img
                src={project.projectImages[0]}
                alt="Project Screenshot"
                style={{ maxWidth: "300px", maxHeight: "180px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <ArrayEditor
          label="Image URLs & Screenshots"
          items={project.projectImages}
          onItemChange={(index, value) => onArrayFieldChange("projectImages", index, value)}
          onAddItem={() => onAddArrayItem("projectImages")}
          onRemoveItem={(index) => onRemoveArrayItem("projectImages", index)}
          placeholder="https://example.com/screenshot.jpg"
        />
      </div>

      {/* Content Section */}
      <div className="form-section">
        <h4>📝 Project Details & Description</h4>
        <ArrayEditor
          label="Detailed Descriptions"
          items={project.projectParagraphs}
          onItemChange={(index, value) => onArrayFieldChange("projectParagraphs", index, value)}
          onAddItem={() => onAddArrayItem("projectParagraphs")}
          onRemoveItem={(index) => onRemoveArrayItem("projectParagraphs", index)}
          placeholder="Describe the project's features, challenges solved, technologies used, and key learnings..."
          multiline
        />

        <ArrayEditor
          label="Project Links (GitHub, Demo, Documentation)"
          items={project.projectURLs}
          onItemChange={(index, value) => onArrayFieldChange("projectURLs", index, value)}
          onAddItem={() => onAddArrayItem("projectURLs")}
          onRemoveItem={(index) => onRemoveArrayItem("projectURLs", index)}
          placeholder="https://github.com/username/repo or https://project-demo.com"
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

// Project Preview Component
const ProjectPreview = ({ project }) => (
  <div className="project-preview">
    <h3><FaRocket /> Live Preview</h3>
    <div className="preview-content">
      <div className="preview-project-container">
        <div className="preview-project-image">
          {project.projectImages[0] ? (
            <img
              src={project.projectImages[0]}
              alt=""
              className="preview-project-image-content"
            />
          ) : (
            <div className="no-image"><FaRocket />No Screenshot</div>
          )}
        </div>
        <div className="preview-project-details">
          <h2 className="preview-project-title">
            <FaRocket /> {project.projectTitle || "Untitled Project"}
          </h2>
          <div className="preview-project-subtitle-area">
            <h4 className="preview-project-subtitle">
              {project.projectSubTitle || "No technology stack"}
            </h4>
            <p className="preview-project-timeline">
              {project.projectTimeline || "No timeline"}
            </p>
          </div>
          <p className="preview-project-tagline">
            {project.projectTagline || "No description"}
          </p>
          <div className="preview-project-buttons">
            <button className="preview-btn-styled primary">
              <FaGithub /> View Code
            </button>
            <button className="preview-btn-styled secondary">
              <FaExternalLinkAlt /> Live Demo
            </button>
          </div>
        </div>
      </div>
      {project.projectParagraphs.some(p => p.trim()) && (
        <div className="preview-paragraphs">
          <h4>Project Details:</h4>
          {project.projectParagraphs.map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="preview-paragraph">{paragraph}</p>
            )
          ))}
        </div>
      )}
      {project.projectURLs.some(url => url.trim()) && (
        <div className="preview-links">
          <h4>Project Links:</h4>
          <div className="preview-links-container">
            {project.projectURLs.map((url, index) => (
              url.trim() && (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="preview-link">
                  <FaExternalLinkAlt /> {url.includes('github') ? 'GitHub Repository' : 'Project Link'}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default EnhancedProjectsEditor;