import React, { useState, useEffect, useRef } from "react";
import {
  FaSave,
  FaEye,
  FaUpload,
  FaUndo,
  FaUser,
  FaCloudUploadAlt
} from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";
import "../../styles/EnhancedAboutEditor.css";
import { SpotlightBG } from "../AboutPage/SpotlightBG";

const API_URL = process.env.REACT_APP_API_URI;

const EnhancedAboutEditor = ({ onBack }) => {
  const [aboutData, setAboutData] = useState([
    {
      icon: "bx bxs-hourglass about-icon",
      title: "Coding Hours",
      subtitle: "1300+ Hours",
    },
    {
      icon: "bx bx-trophy about-icon",
      title: "Completed",
      subtitle: "42+ Projects",
    },
    {
      icon: "bx bx-support about-icon",
      title: "LeetCode",
      subtitle: "246+ Solutions",
    },
  ]);

  const [profileInfo, setProfileInfo] = useState({
    name: "Kale Sinclair",
    role: "FAMU-FSU COE, B.S in Biomedical Engineering",
    description: "I'm Kale Sinclair, a Biomedical Engineering student at the FAMU-FSU College of Engineering, passionate about creating impactful biomedical solutions and technologies. My journey is driven by curiosity and a commitment to continuous learning through projects, research, and real-world applications.",
    profileImage: "/Kale-Profile-Photo.jpg"
  });

  const [originalData, setOriginalData] = useState({ aboutData: [], profileInfo: {} });
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch about me data on component mount
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/aboutme`);
      if (response.data) {
        const data = response.data;
        if (data.aboutData) setAboutData(data.aboutData);
        if (data.profileInfo) setProfileInfo(data.profileInfo);
        setOriginalData({ aboutData: data.aboutData || aboutData, profileInfo: data.profileInfo || profileInfo });
      } else {
        setOriginalData({ aboutData, profileInfo });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching about data:", error);
      setOriginalData({ aboutData, profileInfo });
      setLoading(false);
    }
  };

  const handleAboutDataChange = (index, field, value) => {
    setAboutData(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsDirty(true);
  };

  const handleProfileInfoChange = (field, value) => {
    setProfileInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileInfo(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/aboutme`, {
        aboutData,
        profileInfo
      });

      if (response.data && response.data.success) {
        setOriginalData({ aboutData, profileInfo });
        setIsDirty(false);
        // Show success message briefly
        setTimeout(() => {
          // Could add a toast notification here
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving about data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAboutData([...originalData.aboutData]);
    setProfileInfo({ ...originalData.profileInfo });
    setIsDirty(false);
  };

  if (loading) {
    return (
      <div className="enhanced-about-editor">
        <div className="editor-header">
          <button className="back-btn" onClick={onBack}>← Back to Admin</button>
          <h2><FaUser /> About Me - Visual Editor</h2>
        </div>
        <div className="loading">Loading about me data...</div>
      </div>
    );
  }

  return (
    <div className="enhanced-about-editor">
      {/* Header */}
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>← Back to Admin</button>
        <h2><FaUser /> About Me - Visual Editor</h2>
        <div className="header-actions">
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
            <FaSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* Sidebar - About Me Sections */}
        <div className="about-sidebar">
          <h3>About Me Sections</h3>
          <div className="sections-list">
            <div className="section-item active">
              <div className="section-icon"><FaUser /></div>
              <div className="section-details">
                <div className="section-title">Personal Info</div>
                <div className="section-subtitle">Name, Role & Description</div>
              </div>
            </div>
            <div className="section-item">
              <div className="section-icon"><i className="bx bx-trophy"></i></div>
              <div className="section-details">
                <div className="section-title">Statistics</div>
                <div className="section-subtitle">Coding Hours, Projects, LeetCode</div>
              </div>
            </div>
            <div className="section-item">
              <div className="section-icon"><FaUpload /></div>
              <div className="section-details">
                <div className="section-title">Profile Image</div>
                <div className="section-subtitle">Upload or drag & drop</div>
              </div>
            </div>
          </div>

          {isDirty && (
            <div className="sidebar-actions">
              <button className="reset-btn" onClick={handleReset}>
                <FaUndo /> Reset Changes
              </button>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="main-editor">
          {previewMode ? (
            <AboutPreview aboutData={aboutData} profileInfo={profileInfo} />
          ) : (
            <AboutEditor
              aboutData={aboutData}
              profileInfo={profileInfo}
              onAboutDataChange={handleAboutDataChange}
              onProfileInfoChange={handleProfileInfoChange}
              onImageUpload={handleImageUpload}
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// About Editor Component
const AboutEditor = ({
  aboutData,
  profileInfo,
  onAboutDataChange,
  onProfileInfoChange,
  onImageUpload,
  dragActive,
  onDrag,
  onDrop,
  fileInputRef
}) => {
  return (
    <div className="about-editor">
      <div className="editor-form">
        {/* Profile Section */}
        <div className="form-section">
          <h4><FaUser /> Personal Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileInfo.name}
                onChange={(e) => onProfileInfoChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Role/Title</label>
              <input
                type="text"
                value={profileInfo.role}
                onChange={(e) => onProfileInfoChange('role', e.target.value)}
                placeholder="Your role or title"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={profileInfo.description}
              onChange={(e) => onProfileInfoChange('description', e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>
        </div>

        {/* Statistics Section */}
        <div className="form-section">
          <h4><i className="bx bx-trophy"></i> Statistics & Achievements</h4>
          {aboutData.map((item, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onAboutDataChange(index, 'title', e.target.value)}
                  placeholder="e.g., Coding Hours"
                />
              </div>
              <div className="form-group">
                <label>Value</label>
                <input
                  type="text"
                  value={item.subtitle}
                  onChange={(e) => onAboutDataChange(index, 'subtitle', e.target.value)}
                  placeholder="e.g., 1300+ Hours"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Image Upload Section */}
        <div className="form-section">
          <h4><FaUpload /> Profile Image</h4>
          <div className="image-upload-section">
            <div className="current-image">
              <img
                src={profileInfo.profileImage.startsWith('data:')
                  ? profileInfo.profileImage
                  : `${process.env.PUBLIC_URL}${profileInfo.profileImage}`
                }
                alt="Profile"
                className="profile-preview"
              />
            </div>
            <div
              className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
            >
              <FaCloudUploadAlt className="upload-icon" />
              <p>Drag & drop an image here, or</p>
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload /> Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// About Preview Component
const AboutPreview = ({ aboutData, profileInfo }) => {
  return (
    <div className="about-preview">
      <h3>Live Preview</h3>
      <div className="preview-content">
        <section className="about-section-container">
          <SpotlightBG />
          <motion.div className="about-div">
            <div className="about-content glass">
              <h2 className="section-title">ABOUT ME</h2>
              <div className="about-container">
                <motion.div className="about-row">
                  <motion.img
                    src={profileInfo.profileImage.startsWith('data:')
                      ? profileInfo.profileImage
                      : `${process.env.PUBLIC_URL}${profileInfo.profileImage}`
                    }
                    className="about-image"
                    alt="Profile"
                  />
                  <motion.div className="about-info">
                    {aboutData.map((item, index) => (
                      <motion.div
                        className="about-box"
                        key={index}
                      >
                        <motion.i className={item.icon}></motion.i>
                        <h3 className="about-title">{item.title}</h3>
                        <span className="about-subtitle">{item.subtitle}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
                <motion.div className="about-row">
                  <motion.div className="about-description-box">
                    <span className="about-name">{profileInfo.name}</span>
                    <p className="about-role">{profileInfo.role}</p>
                    <p className="about-description">{profileInfo.description}</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default EnhancedAboutEditor;