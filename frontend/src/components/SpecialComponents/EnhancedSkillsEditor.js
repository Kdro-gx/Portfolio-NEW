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
  FaCogs,
  FaChartBar,
  FaStar,
  FaCode,
  FaDatabase,
  FaDesktop,
  FaBrain
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/EnhancedSkillsEditor.css";

const API_URL = process.env.REACT_APP_API_URI;

// Skill Component Templates
const SKILL_TEMPLATES = {
  frontend: {
    skillTitle: "Frontend Development",
    skillDescription: "Proficiency in modern frontend technologies and frameworks",
    Labels: ["JavaScript", "React", "CSS", "HTML", "TypeScript", "Next.js"],
    Scores: [90, 85, 88, 95, 80, 75]
  },
  backend: {
    skillTitle: "Backend Development",
    skillDescription: "Server-side technologies and database management",
    Labels: ["Node.js", "Python", "SQL", "MongoDB", "API Design", "Cloud"],
    Scores: [85, 80, 90, 75, 88, 70]
  },
  tools: {
    skillTitle: "Development Tools",
    skillDescription: "Proficiency with development and productivity tools",
    Labels: ["Git", "Docker", "VS Code", "Figma", "Postman", "Slack"],
    Scores: [95, 70, 90, 80, 85, 88]
  },
  soft: {
    skillTitle: "Soft Skills",
    skillDescription: "Communication and interpersonal abilities",
    Labels: ["Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management"],
    Scores: [90, 75, 95, 88, 85]
  },
  languages: {
    skillTitle: "Programming Languages",
    skillDescription: "Competency across different programming languages",
    Labels: ["JavaScript", "Python", "Java", "C++", "Go", "Rust"],
    Scores: [90, 85, 70, 65, 60, 45]
  }
};

const EnhancedSkillsEditor = ({ onBack }) => {
  const [skillsCollection, setSkillsCollection] = useState([]);
  const [skillComponents, setSkillComponents] = useState([]);
  const [selectedSkillSet, setSelectedSkillSet] = useState(null);
  const [selectedSkillComponent, setSelectedSkillComponent] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'collection' or 'component'
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("collection"); // 'collection' or 'graph'
  const fileInputRef = useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collectionResponse, componentsResponse] = await Promise.all([
        axios.get(`${API_URL}/getskills`),
        axios.get(`${API_URL}/getskillcomponents`)
      ]);
      setSkillsCollection(collectionResponse.data);
      setSkillComponents(componentsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching skills data:", error);
      setLoading(false);
    }
  };

  const handleSelectSkillSet = (skillSet) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedSkillSet(skillSet);
    setSelectedSkillComponent(null);
    setEditingData({ ...skillSet });
    setEditingType("collection");
    setIsDirty(false);
    setPreviewMode(false);
    setActiveTab("collection");
  };

  const handleSelectSkillComponent = (component) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedSkillComponent(component);
    setSelectedSkillSet(null);
    setEditingData({ ...component });
    setEditingType("component");
    setIsDirty(false);
    setPreviewMode(false);
    setActiveTab("graph");
  };

  const handleCreateNewCollection = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newSkillSet = {
      title: "",
      description: "",
      skills: [{ logo: "", name: "", proficiency: "" }]
    };
    setSelectedSkillSet(null);
    setSelectedSkillComponent(null);
    setEditingData(newSkillSet);
    setEditingType("collection");
    setIsDirty(true);
    setPreviewMode(false);
    setActiveTab("collection");
  };

  const handleCreateNewComponent = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newComponent = { ...SKILL_TEMPLATES.frontend };
    setSelectedSkillComponent(null);
    setSelectedSkillSet(null);
    setEditingData(newComponent);
    setEditingType("component");
    setIsDirty(true);
    setPreviewMode(false);
    setActiveTab("graph");
  };

  const handleCreateFromTemplate = (template) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedSkillComponent(null);
    setSelectedSkillSet(null);
    setEditingData(template);
    setEditingType("component");
    setIsDirty(true);
    setPreviewMode(false);
    setActiveTab("graph");
  };

  const handleFieldChange = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSkillChange = (index, field, value) => {
    setEditingData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
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

  const handleAddSkill = () => {
    setEditingData(prev => ({
      ...prev,
      skills: [...prev.skills, { logo: "", name: "", proficiency: "" }]
    }));
    setIsDirty(true);
  };

  const handleRemoveSkill = (index) => {
    if (editingData.skills.length <= 1) return;
    setEditingData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleAddArrayItem = (field) => {
    setEditingData(prev => {
      const newData = { ...prev };
      if (field === "Labels") {
        newData.Labels = [...newData.Labels, ""];
        newData.Scores = [...newData.Scores, 0];
      } else if (field === "Scores") {
        newData.Scores = [...newData.Scores, 0];
        newData.Labels = [...newData.Labels, ""];
      }
      return newData;
    });
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (field, index) => {
    if (editingData[field].length <= 1) return;
    setEditingData(prev => ({
      ...prev,
      Labels: prev.Labels.filter((_, i) => i !== index),
      Scores: prev.Scores.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleImageUpload = (event, skillIndex) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        handleSkillChange(skillIndex, "logo", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (editingType === "collection" && !editingData.title.trim()) {
      alert("Please enter a title for the skill set.");
      return;
    }
    if (editingType === "component" && !editingData.skillTitle.trim()) {
      alert("Please enter a title for the skill graph.");
      return;
    }

    try {
      setSaving(true);
      let response;

      if (editingType === "collection") {
        if (selectedSkillSet) {
          // Update existing skill set
          const { _id, ...updateData } = editingData;
          response = await axios.put(
            `${API_URL}/updateskill/${selectedSkillSet._id}`,
            updateData
          );
        } else {
          // Create new skill set
          response = await axios.post(`${API_URL}/addskill`, editingData, {
            withCredentials: true,
          });
        }
      } else {
        if (selectedSkillComponent) {
          // Update existing skill component
          const { _id, ...updateData } = editingData;
          response = await axios.put(
            `${API_URL}/updateskillcomponent/${selectedSkillComponent._id}`,
            updateData
          );
        } else {
          // Create new skill component
          response = await axios.post(`${API_URL}/addskillcomponent`, editingData, {
            withCredentials: true,
          });
        }
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchData(); // Refresh the data
        if (!selectedSkillSet && !selectedSkillComponent && response.data.newItem) {
          if (editingType === "collection") {
            setSelectedSkillSet(response.data.newItem);
          } else {
            setSelectedSkillComponent(response.data.newItem);
          }
          setEditingData(response.data.newItem);
        }
        alert("Skills saved successfully!");
      }
    } catch (error) {
      console.error("Error saving skills:", error);
      alert("Failed to save skills. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const itemToDelete = selectedSkillSet || selectedSkillComponent;
    if (!itemToDelete) return;

    const itemTitle = editingType === "collection" ? itemToDelete.title : itemToDelete.skillTitle;
    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
      return;
    }

    try {
      const endpoint = editingType === "collection"
        ? `${API_URL}/deleteskill/${itemToDelete._id}`
        : `${API_URL}/deleteskillcomponent/${itemToDelete._id}`;

      const response = await axios.delete(endpoint);
      if (response.data && response.data.success) {
        await fetchData();
        setSelectedSkillSet(null);
        setSelectedSkillComponent(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Item deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const duplicated = {
      ...editingData,
      title: editingType === "collection" ? `${editingData.title} (Copy)` : undefined,
      skillTitle: editingType === "component" ? `${editingData.skillTitle} (Copy)` : undefined,
      _id: undefined
    };
    setSelectedSkillSet(null);
    setSelectedSkillComponent(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedSkillSet) {
      setEditingData({ ...selectedSkillSet });
    } else if (selectedSkillComponent) {
      setEditingData({ ...selectedSkillComponent });
    } else {
      if (editingType === "collection") {
        handleCreateNewCollection();
      } else {
        handleCreateNewComponent();
      }
    }
    setIsDirty(false);
  };

  if (loading) {
    return (
      <div className="enhanced-skills-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaCogs /> Skills Management - Visual Editor</h2>
        </div>
        <div className="loading">Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-skills-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaCogs /> Skills Management - Visual Editor</h2>
        <div className="header-actions">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === "collection" ? "active" : ""}`}
              onClick={() => setActiveTab("collection")}
            >
              <FaCogs /> Skill Sets
            </button>
            <button
              className={`tab-btn ${activeTab === "graph" ? "active" : ""}`}
              onClick={() => setActiveTab("graph")}
            >
              <FaChartBar /> Skill Graphs
            </button>
          </div>
          <button
            className="create-btn"
            onClick={activeTab === "collection" ? handleCreateNewCollection : handleCreateNewComponent}
          >
            <FaPlus /> New {activeTab === "collection" ? "Skill Set" : "Skill Graph"}
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
        {/* Sidebar */}
        <div className="skills-sidebar">
          <h3>
            {activeTab === "collection" ? "Skill Collections" : "Skill Graphs"}
            ({activeTab === "collection" ? skillsCollection.length : skillComponents.length})
          </h3>
          <div className="skills-list">
            {activeTab === "collection" ? (
              skillsCollection.map((skillSet) => (
                <div
                  key={skillSet._id}
                  className={`skill-item ${
                    selectedSkillSet?._id === skillSet._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectSkillSet(skillSet)}
                >
                  <div className="skill-icon"><FaCogs /></div>
                  <div className="skill-details">
                    <div className="skill-title">{skillSet.title || "Untitled"}</div>
                    <div className="skill-subtitle">{skillSet.description || "No description"}</div>
                    <div className="skill-count">{skillSet.skills?.length || 0} skills</div>
                  </div>
                </div>
              ))
            ) : (
              skillComponents.map((component) => (
                <div
                  key={component._id}
                  className={`skill-item ${
                    selectedSkillComponent?._id === component._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectSkillComponent(component)}
                >
                  <div className="skill-icon"><FaChartBar /></div>
                  <div className="skill-details">
                    <div className="skill-title">{component.skillTitle || "Untitled"}</div>
                    <div className="skill-subtitle">{component.skillDescription || "No description"}</div>
                    <div className="skill-count">{component.Labels?.length || 0} data points</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              {activeTab === "collection" ? <FaCogs className="large-icon" /> : <FaChartBar className="large-icon" />}
              <h3>Select a {activeTab === "collection" ? "skill set" : "skill graph"} to edit or create a new one</h3>

              {activeTab === "graph" ? (
                <div className="template-section">
                  <h4>Quick Start Templates</h4>
                  <div className="template-grid">
                    <button
                      className="template-btn"
                      onClick={() => handleCreateFromTemplate(SKILL_TEMPLATES.frontend)}
                    >
                      <FaDesktop className="template-icon" />
                      <span>Frontend</span>
                      <small>JS, React, CSS...</small>
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => handleCreateFromTemplate(SKILL_TEMPLATES.backend)}
                    >
                      <FaDatabase className="template-icon" />
                      <span>Backend</span>
                      <small>Node.js, Python...</small>
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => handleCreateFromTemplate(SKILL_TEMPLATES.tools)}
                    >
                      <FaCogs className="template-icon" />
                      <span>Tools</span>
                      <small>Git, Docker...</small>
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => handleCreateFromTemplate(SKILL_TEMPLATES.languages)}
                    >
                      <FaCode className="template-icon" />
                      <span>Languages</span>
                      <small>JS, Python...</small>
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => handleCreateFromTemplate(SKILL_TEMPLATES.soft)}
                    >
                      <FaBrain className="template-icon" />
                      <span>Soft Skills</span>
                      <small>Communication...</small>
                    </button>
                  </div>
                  <div className="or-divider">
                    <span>or</span>
                  </div>
                </div>
              ) : null}

              <button
                className="create-btn large"
                onClick={activeTab === "collection" ? handleCreateNewCollection : handleCreateNewComponent}
              >
                <FaPlus /> Create {activeTab === "graph" ? "Custom " : "New "}{activeTab === "collection" ? "Skill Set" : "Skill Graph"}
              </button>
            </div>
          ) : previewMode ? (
            <SkillsPreview data={editingData} type={editingType} />
          ) : (
            <SkillsEditor
              data={editingData}
              type={editingType}
              onFieldChange={handleFieldChange}
              onSkillChange={handleSkillChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedItem={selectedSkillSet || selectedSkillComponent}
              isDirty={isDirty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Skills Editor Component
const SkillsEditor = ({
  data,
  type,
  onFieldChange,
  onSkillChange,
  onArrayFieldChange,
  onAddSkill,
  onRemoveSkill,
  onAddArrayItem,
  onRemoveArrayItem,
  onImageUpload,
  fileInputRef,
  onDuplicate,
  onDelete,
  onReset,
  selectedItem,
  isDirty
}) => (
  <div className="skills-editor">
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
      {type === "collection" ? (
        <>
          {/* Skill Set Information */}
          <div className="form-section">
            <h4><FaCogs /> Skill Set Information</h4>
            <div className="form-group">
              <label>Skill Set Title *</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => onFieldChange("title", e.target.value)}
                placeholder="e.g., Programming Languages, Design Tools, Frameworks"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={data.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Brief description of this skill category"
                rows="3"
              />
            </div>
          </div>

          {/* Individual Skills */}
          <div className="form-section">
            <h4><FaStar /> Individual Skills</h4>
            {data.skills?.map((skill, index) => (
              <div key={index} className="skill-item-editor">
                <div className="skill-header">
                  <h5>Skill #{index + 1}</h5>
                  <div className="skill-controls">
                    <button
                      className="add-btn"
                      onClick={onAddSkill}
                      title="Add skill"
                    >
                      <FaPlus />
                    </button>
                    {data.skills.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveSkill(index)}
                        title="Remove skill"
                      >
                        <FaMinus />
                      </button>
                    )}
                  </div>
                </div>

                <div className="skill-fields">
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => onSkillChange(index, "name", e.target.value)}
                      placeholder="e.g., React.js, Photoshop, Machine Learning"
                    />
                  </div>

                  <div className="form-group">
                    <label>Proficiency Level</label>
                    <input
                      type="text"
                      value={skill.proficiency}
                      onChange={(e) => onSkillChange(index, "proficiency", e.target.value)}
                      placeholder="e.g., Expert, Intermediate, Advanced, 90%"
                    />
                  </div>

                  <div className="form-group">
                    <label>Logo/Icon URL</label>
                    <div className="image-upload-area">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onImageUpload(e, index)}
                        style={{ display: "none" }}
                      />
                      <input
                        type="text"
                        value={skill.logo}
                        onChange={(e) => onSkillChange(index, "logo", e.target.value)}
                        placeholder="https://example.com/logo.png or upload below"
                      />
                      <button
                        className="upload-btn small"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload /> Upload
                      </button>
                      {skill.logo && (
                        <div className="image-preview small">
                          <img
                            src={skill.logo}
                            alt="Skill Logo"
                            style={{ maxWidth: "40px", maxHeight: "40px", objectFit: "contain" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Skill Graph Information */}
          <div className="form-section">
            <h4><FaChartBar /> Skill Graph Information</h4>
            <div className="form-group">
              <label>Graph Title *</label>
              <input
                type="text"
                value={data.skillTitle}
                onChange={(e) => onFieldChange("skillTitle", e.target.value)}
                placeholder="e.g., Technical Proficiency, Language Fluency"
              />
            </div>

            <div className="form-group">
              <label>Graph Description</label>
              <textarea
                value={data.skillDescription}
                onChange={(e) => onFieldChange("skillDescription", e.target.value)}
                placeholder="Description of what this graph represents"
                rows="3"
              />
            </div>
          </div>

          {/* Graph Data Points */}
          <div className="form-section">
            <h4><FaDatabase /> Data Points</h4>
            {data.Labels?.map((label, index) => (
              <div key={index} className="array-item">
                <div className="data-point-fields">
                  <div className="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => onArrayFieldChange("Labels", index, e.target.value)}
                      placeholder="e.g., JavaScript, Communication, Problem Solving"
                    />
                  </div>
                  <div className="form-group">
                    <label>Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={data.Scores[index] || 0}
                      onChange={(e) => onArrayFieldChange("Scores", index, Number(e.target.value))}
                      placeholder="85"
                    />
                  </div>
                </div>
                <div className="array-controls">
                  <button
                    className="add-btn"
                    onClick={() => onAddArrayItem("Labels")}
                    title="Add data point"
                  >
                    <FaPlus />
                  </button>
                  {data.Labels.length > 1 && (
                    <button
                      className="remove-btn"
                      onClick={() => onRemoveArrayItem("Labels", index)}
                      title="Remove data point"
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

// Skills Preview Component
const SkillsPreview = ({ data, type }) => (
  <div className="skills-preview">
    <h3>
      {type === "collection" ? <FaCogs /> : <FaChartBar />} Live Preview
    </h3>
    <div className="preview-content">
      {type === "collection" ? (
        <div className="preview-skill-set">
          <div className="preview-header">
            <h2>{data.title || "Untitled Skill Set"}</h2>
            <p>{data.description || "No description"}</p>
          </div>
          <div className="preview-skills-grid">
            {data.skills?.map((skill, index) => (
              <div key={index} className="preview-skill-card">
                {skill.logo && (
                  <div className="preview-skill-logo">
                    <img src={skill.logo} alt={skill.name} />
                  </div>
                )}
                <div className="preview-skill-info">
                  <h4>{skill.name || "Unnamed Skill"}</h4>
                  <div className="preview-proficiency">
                    <span className="proficiency-label">Proficiency:</span>
                    <span className="proficiency-value">{skill.proficiency || "Not specified"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="preview-skill-graph">
          <div className="preview-header">
            <h2>{data.skillTitle || "Untitled Skill Graph"}</h2>
            <p>{data.skillDescription || "No description"}</p>
          </div>
          <div className="preview-graph-container">
            {data.Labels?.map((label, index) => {
              const score = data.Scores[index] || 0;
              return (
                <div key={index} className="preview-graph-item">
                  <div className="graph-label">{label}</div>
                  <div className="graph-bar-container">
                    <div
                      className="graph-bar"
                      style={{ width: `${score}%` }}
                    ></div>
                    <span className="graph-score">{score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default EnhancedSkillsEditor;