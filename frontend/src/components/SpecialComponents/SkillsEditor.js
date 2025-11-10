import React, { useState, useEffect, useRef } from "react";
import {
  FaSave,
  FaEye,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCopy,
  FaUndo,
  FaCogs,
  FaChartLine,
  FaUpload,
} from "react-icons/fa";
import axios from "axios";
import "../../styles/SkillsEditor.css";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URI;

// Proficiency levels with MASTERED as the highest
const PROFICIENCY_LEVELS = ["mastered", "proficient", "intermediate", "beginner"];

const SkillsEditor = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("skills"); // 'skills' or 'graphs'
  const [skillCategories, setSkillCategories] = useState([]);
  const [skillGraphs, setSkillGraphs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsResponse, graphsResponse] = await Promise.all([
        axios.get(`${API_URL}/getskills`),
        axios.get(`${API_URL}/getskillgraphs`)
      ]);
      console.log("Fetched skills:", skillsResponse.data);
      console.log("Fetched graphs:", graphsResponse.data);
      setSkillCategories(skillsResponse.data);
      setSkillGraphs(graphsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSelectCategory = (category) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedCategory(category);
    setSelectedGraph(null);
    setEditingData({ ...category });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleSelectGraph = (graph) => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    setSelectedGraph(graph);
    setSelectedCategory(null);
    setEditingData({ ...graph });
    setIsDirty(false);
    setPreviewMode(false);
  };

  const handleCreateNewCategory = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newCategory = {
      title: "",
      description: "",
      skills: [{ name: "", proficiency: "intermediate", logo: "" }]
    };
    setSelectedCategory(null);
    setSelectedGraph(null);
    setEditingData(newCategory);
    setIsDirty(true);
    setPreviewMode(false);
    setActiveTab("skills");
  };

  const handleCreateNewGraph = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }
    const newGraph = {
      skillTitle: "",
      skillDescription: "",
      Labels: [""],
      Scores: [0]
    };
    setSelectedGraph(null);
    setSelectedCategory(null);
    setEditingData(newGraph);
    setIsDirty(true);
    setPreviewMode(false);
    setActiveTab("graphs");
  };

  const handleImageUpload = async (event, skillIndex) => {
    const file = event.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        handleSkillChange(skillIndex, "logo", base64Image);
      };
      reader.readAsDataURL(file);
    }
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

  const handleAddSkill = () => {
    setEditingData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: "", proficiency: "intermediate", logo: "" }]
    }));
    setIsDirty(true);
  };

  const handleRemoveSkill = (index) => {
    if (editingData.skills.length <= 1) {
      alert("Category must have at least one skill");
      return;
    }
    setEditingData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
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
    setEditingData(prev => {
      const newData = { ...prev };
      if (field === "Labels") {
        newData.Labels = [...newData.Labels, ""];
        newData.Scores = [...newData.Scores, 0];
      }
      return newData;
    });
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (field, index) => {
    if (editingData.Labels.length <= 1) {
      alert("Graph must have at least one data point");
      return;
    }
    setEditingData(prev => ({
      ...prev,
      Labels: prev.Labels.filter((_, i) => i !== index),
      Scores: prev.Scores.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const isGraph = editingData.hasOwnProperty("skillTitle");

    if (isGraph) {
      // Validate graph data
      if (!editingData.skillTitle.trim()) {
        alert("Please enter a graph title.");
        return;
      }

      // Validate Labels array
      if (!editingData.Labels || editingData.Labels.length === 0) {
        alert("Please add at least one data point (label).");
        return;
      }

      // Check for empty labels
      for (let i = 0; i < editingData.Labels.length; i++) {
        if (!editingData.Labels[i].trim()) {
          alert(`Label #${i + 1} cannot be empty. Please enter a label name.`);
          return;
        }
      }

      // Validate Scores array
      if (!editingData.Scores || editingData.Scores.length !== editingData.Labels.length) {
        alert("Each label must have a corresponding score.");
        return;
      }

      // Validate each score
      for (let i = 0; i < editingData.Scores.length; i++) {
        const score = Number(editingData.Scores[i]);
        if (isNaN(score) || score < 0 || score > 100) {
          alert(`Score #${i + 1} must be a number between 0 and 100.`);
          return;
        }
      }
    } else {
      if (!editingData.title.trim()) {
        alert("Please enter a category title.");
        return;
      }
      for (let i = 0; i < editingData.skills.length; i++) {
        if (!editingData.skills[i].name.trim()) {
          alert(`Please enter a name for skill #${i + 1}`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      let response;

      if (isGraph) {
        if (selectedGraph) {
          const { _id, ...updateData } = editingData;
          response = await axios.put(
            `${API_URL}/updateskillgraph/${selectedGraph._id}`,
            updateData,
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            `${API_URL}/addskillgraph`,
            editingData,
            { withCredentials: true }
          );
        }
      } else {
        if (selectedCategory) {
          const { _id, ...updateData } = editingData;
          response = await axios.put(
            `${API_URL}/updateskill/${selectedCategory._id}`,
            updateData,
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            `${API_URL}/addskill`,
            editingData,
            { withCredentials: true }
          );
        }
      }

      if (response.data && response.data.success) {
        setIsDirty(false);
        await fetchData();
        if (response.data.newItem) {
          if (isGraph) {
            setSelectedGraph(response.data.newItem);
          } else {
            setSelectedCategory(response.data.newItem);
          }
          setEditingData(response.data.newItem);
        }
        alert("Saved successfully!");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const itemToDelete = selectedCategory || selectedGraph;
    if (!itemToDelete) return;

    const isGraph = selectedGraph !== null;
    const itemTitle = isGraph ? itemToDelete.skillTitle : itemToDelete.title;

    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
      return;
    }

    try {
      const endpoint = isGraph
        ? `${API_URL}/deleteskillgraph/${itemToDelete._id}`
        : `${API_URL}/deleteskill/${itemToDelete._id}`;

      const response = await axios.delete(endpoint, { withCredentials: true });
      if (response.data && response.data.success) {
        await fetchData();
        setSelectedCategory(null);
        setSelectedGraph(null);
        setEditingData(null);
        setIsDirty(false);
        alert("Deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleDuplicate = () => {
    if (!editingData) return;
    const isGraph = editingData.hasOwnProperty("skillTitle");
    const duplicated = {
      ...editingData,
      ...(isGraph
        ? { skillTitle: `${editingData.skillTitle} (Copy)` }
        : { title: `${editingData.title} (Copy)` }
      ),
      _id: undefined
    };
    setSelectedCategory(null);
    setSelectedGraph(null);
    setEditingData(duplicated);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (selectedCategory) {
      setEditingData({ ...selectedCategory });
    } else if (selectedGraph) {
      setEditingData({ ...selectedGraph });
    } else {
      if (activeTab === "skills") {
        handleCreateNewCategory();
      } else {
        handleCreateNewGraph();
      }
    }
    setIsDirty(false);
  };

  if (loading) {
    return (
      <div className="skills-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaCogs /> Skills & Graphs Management</h2>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const isGraph = editingData?.hasOwnProperty("skillTitle");

  return (
    <div className="skills-editor">
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaCogs /> Skills & Graphs Management</h2>
        <div className="header-actions">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              <FaCogs /> Skill Categories
            </button>
            <button
              className={`tab-btn ${activeTab === "graphs" ? "active" : ""}`}
              onClick={() => setActiveTab("graphs")}
            >
              <FaChartLine /> Web Graphs
            </button>
          </div>
          <button
            className="create-btn"
            onClick={activeTab === "skills" ? handleCreateNewCategory : handleCreateNewGraph}
          >
            <FaPlus /> New {activeTab === "skills" ? "Category" : "Graph"}
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
        <div className="skills-sidebar">
          <h3>
            {activeTab === "skills" ? "Categories" : "Graphs"}
            ({activeTab === "skills" ? skillCategories.length : skillGraphs.length})
          </h3>
          <div className="skills-list">
            {activeTab === "skills" ? (
              skillCategories.map((category) => (
                <div
                  key={category._id}
                  className={`skill-item ${
                    selectedCategory?._id === category._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectCategory(category)}
                >
                  <div className="skill-icon"><FaCogs /></div>
                  <div className="skill-details">
                    <div className="skill-title">{category.title || "Untitled"}</div>
                    <div className="skill-subtitle">{category.description || "No description"}</div>
                    <div className="skill-count">{category.skills?.length || 0} skills</div>
                  </div>
                </div>
              ))
            ) : (
              skillGraphs.map((graph) => (
                <div
                  key={graph._id}
                  className={`skill-item ${
                    selectedGraph?._id === graph._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectGraph(graph)}
                >
                  <div className="skill-icon"><FaChartLine /></div>
                  <div className="skill-details">
                    <div className="skill-title">{graph.skillTitle || "Untitled"}</div>
                    <div className="skill-subtitle">{graph.skillDescription || "No description"}</div>
                    <div className="skill-count">{graph.Labels?.length || 0} data points</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="main-editor">
          {!editingData ? (
            <div className="no-selection">
              {activeTab === "skills" ? <FaCogs className="large-icon" /> : <FaChartLine className="large-icon" />}
              <h3>Select {activeTab === "skills" ? "a category" : "a graph"} to edit or create a new one</h3>
              <button
                className="create-btn large"
                onClick={activeTab === "skills" ? handleCreateNewCategory : handleCreateNewGraph}
              >
                <FaPlus /> Create New {activeTab === "skills" ? "Category" : "Graph"}
              </button>
            </div>
          ) : previewMode ? (
            isGraph ? (
              <GraphPreview data={editingData} />
            ) : (
              <SkillPreview data={editingData} />
            )
          ) : isGraph ? (
            <GraphEditor
              data={editingData}
              onFieldChange={handleFieldChange}
              onArrayFieldChange={handleArrayFieldChange}
              onAddArrayItem={handleAddArrayItem}
              onRemoveArrayItem={handleRemoveArrayItem}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedGraph={selectedGraph}
              isDirty={isDirty}
            />
          ) : (
            <CategoryEditor
              data={editingData}
              onFieldChange={handleFieldChange}
              onSkillChange={handleSkillChange}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onImageUpload={handleImageUpload}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onReset={handleReset}
              selectedCategory={selectedCategory}
              isDirty={isDirty}
              fileInputRefs={fileInputRefs}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryEditor = ({
  data,
  onFieldChange,
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
  onImageUpload,
  onDuplicate,
  onDelete,
  onReset,
  selectedCategory,
  isDirty,
  fileInputRefs
}) => {
  // Initialize refs array when data changes
  useEffect(() => {
    fileInputRefs.current = fileInputRefs.current.slice(0, data.skills?.length || 0);
  }, [data.skills?.length, fileInputRefs]);

  return (
    <div className="skill-editor-form">
      <div className="editor-actions">
        <button className="action-btn" onClick={onDuplicate}>
          <FaCopy /> Duplicate
        </button>
        {selectedCategory && (
          <button className="action-btn delete" onClick={onDelete}>
            <FaTrash /> Delete
          </button>
        )}
        {isDirty && (
          <button className="action-btn" onClick={onReset}>
            <FaUndo /> Reset
          </button>
        )}
      </div>

      <div className="editor-form">
        <div className="form-section">
          <h4><FaCogs /> Category Information</h4>

          <div className="form-group">
            <label>Category Title *</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="e.g., Programming Languages, Design Tools, Soft Skills"
            />
          </div>

          <div className="form-group">
            <label>Category Description</label>
            <textarea
              value={data.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Brief description of this skill category"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Skills in this Category</h4>
          <div className="proficiency-legend-editor">
            <span className="legend-item mastered">🔷 Mastered (Highest)</span>
            <span className="legend-item proficient">🟨 Proficient</span>
            <span className="legend-item intermediate">⬜ Intermediate</span>
            <span className="legend-item beginner">🟫 Beginner</span>
          </div>
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
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => onSkillChange(index, "name", e.target.value)}
                    placeholder="e.g., React.js, Python, Communication"
                  />
                </div>

                <div className="form-group">
                  <label>Proficiency Level *</label>
                  <select
                    value={skill.proficiency}
                    onChange={(e) => onSkillChange(index, "proficiency", e.target.value)}
                    className={`proficiency-select ${skill.proficiency}`}
                  >
                    {PROFICIENCY_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level === "mastered" ? "🔷 Mastered" : ""}
                        {level === "proficient" ? "🟨 Proficient" : ""}
                        {level === "intermediate" ? "⬜ Intermediate" : ""}
                        {level === "beginner" ? "🟫 Beginner" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Logo/Icon</label>
                  <div className="logo-upload-container">
                    <input
                      ref={el => fileInputRefs.current[index] = el}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onImageUpload(e, index)}
                      style={{ display: "none" }}
                      id={`file-upload-${index}`}
                    />
                    <input
                      type="text"
                      value={skill.logo}
                      onChange={(e) => onSkillChange(index, "logo", e.target.value)}
                      placeholder="Icon key (e.g., react, python) OR upload image"
                    />
                    <button
                      className="upload-btn"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      type="button"
                    >
                      <FaUpload /> Upload
                    </button>
                  </div>
                  <small>
                    Option 1: Enter icon key from icons.js (e.g., "react", "python")
                    <br />
                    Option 2: Click "Upload" to use your own image
                  </small>
                  {skill.logo && (
                    <div className="logo-preview">
                      {skill.logo.startsWith("data:") ? (
                        <img src={skill.logo} alt="Uploaded" />
                      ) : (
                        <span>Icon key: {skill.logo}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GraphEditor = ({
  data,
  onFieldChange,
  onArrayFieldChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onDuplicate,
  onDelete,
  onReset,
  selectedGraph,
  isDirty
}) => {
  return (
    <div className="skill-editor-form">
      <div className="editor-actions">
        <button className="action-btn" onClick={onDuplicate}>
          <FaCopy /> Duplicate
        </button>
        {selectedGraph && (
          <button className="action-btn delete" onClick={onDelete}>
            <FaTrash /> Delete
          </button>
        )}
        {isDirty && (
          <button className="action-btn" onClick={onReset}>
            <FaUndo /> Reset
          </button>
        )}
      </div>

      <div className="editor-form">
        <div className="form-section">
          <h4><FaChartLine /> Graph Information</h4>

          <div className="form-group">
            <label>Graph Title *</label>
            <input
              type="text"
              value={data.skillTitle}
              onChange={(e) => onFieldChange("skillTitle", e.target.value)}
              placeholder="e.g., Technical Proficiency, Language Skills"
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

        <div className="form-section">
          <h4>Data Points</h4>
          {data.Labels?.map((label, index) => (
            <div key={index} className="data-point-editor">
              <div className="data-point-header">
                <h5>Data Point #{index + 1}</h5>
                <div className="data-point-controls">
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

              <div className="data-point-fields">
                <div className="form-group">
                  <label>Label *</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => onArrayFieldChange("Labels", index, e.target.value)}
                    placeholder="e.g., JavaScript, Communication"
                  />
                </div>

                <div className="form-group">
                  <label>Score (0-100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.Scores[index] || 0}
                    onChange={(e) => onArrayFieldChange("Scores", index, Number(e.target.value))}
                    placeholder="85"
                  />
                  <div className="score-preview">
                    <div
                      className="score-bar"
                      style={{ width: `${data.Scores[index] || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkillPreview = ({ data }) => {
  return (
    <div className="skill-preview">
      <h3><FaCogs /> Live Preview</h3>
      <div className="preview-content">
        <div className="preview-category">
          <div className="preview-header">
            <h2>{data.title || "Untitled Category"}</h2>
            <p>{data.description || "No description"}</p>
          </div>
          <div className="preview-skills-grid">
            {data.skills?.map((skill, index) => (
              <div
                key={index}
                className={`preview-skill-item ${skill.proficiency}`}
              >
                <div className="preview-skill-icon">
                  {skill.logo?.startsWith("data:") ? (
                    <img src={skill.logo} alt={skill.name} />
                  ) : (
                    <span>{skill.logo || "🔧"}</span>
                  )}
                </div>
                <div className="preview-skill-name">
                  {skill.name || "Unnamed Skill"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GraphPreview = ({ data }) => {
  const numericScores = data.Scores?.map((score) => Number(score) || 0) || [];
  const averageScore = numericScores.length > 0
    ? numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length
    : 0;

  const chartData = {
    labels: data.Labels || [],
    datasets: [
      {
        label: data.skillTitle || "Skill Graph",
        data: numericScores,
        backgroundColor: "rgba(108, 188, 252, 0.2)",
        borderColor: "#6cbcfc",
        borderWidth: 2,
        pointBackgroundColor: "#6cbcfc",
        pointBorderColor: "#edeeef",
        pointHoverBackgroundColor: "#edeeef",
        pointHoverBorderColor: "#6cbcfc",
        pointRadius: 4,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "#6cbcfc",
          backdropColor: "transparent"
        },
        angleLines: {
          color: "#edeeef",
          lineWidth: 0.5,
        },
        grid: {
          color: "rgba(237, 238, 239, 0.3)",
          circular: true,
        },
        pointLabels: {
          color: "#edeeef",
          font: {
            weight: 400,
            size: 11,
            family: "'Montserrat', sans-serif",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}`,
        },
        backgroundColor: "#212529",
        titleColor: "#6cbcfc",
        bodyColor: "#edeeef",
        borderColor: "#6cbcfc",
        borderWidth: 2,
        padding: 10,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="skill-preview">
      <h3><FaChartLine /> Live Preview</h3>
      <div className="preview-content">
        <div className="preview-graph">
          <div className="preview-header">
            <h2>{data.skillTitle || "Untitled Graph"}</h2>
            <p>{data.skillDescription || "No description"}</p>
          </div>
          <div className="preview-radar-chart" style={{ height: "400px", position: "relative" }}>
            {data.Labels && data.Labels.length > 0 ? (
              <Radar data={chartData} options={options} />
            ) : (
              <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
                Add data points to see the radar chart
              </div>
            )}
          </div>
          {averageScore > 0 && (
            <div style={{ textAlign: "center", marginTop: "10px", color: "#edeeef" }}>
              Average Score: {averageScore.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsEditor;