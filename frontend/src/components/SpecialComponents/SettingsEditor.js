import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaLink,
  FaFileAlt,
  FaTimes,
  FaArrowLeft
} from 'react-icons/fa';
import '../../styles/SettingsEditor.css';

const SettingsEditor = ({ onBack }) => {
  const API_URL = process.env.REACT_APP_API_URI;
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    resumeURL: '',
    socialLinks: []
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Error fetching settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeURLChange = (value) => {
    setSettings(prev => ({
      ...prev,
      resumeURL: value
    }));
  };

  const handleAddSocialLink = () => {
    setSettings(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { label: '', href: '', icon: '' }
      ]
    }));
  };

  const handleSocialLinkChange = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleRemoveSocialLink = (index) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await axios.put(`${API_URL}/settings`, settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-editor">
      <div className="editor-header">
        <div className="header-left">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <FaArrowLeft />
            </button>
          )}
          <FaFileAlt className="header-icon" />
          <h2>Settings Editor</h2>
        </div>
        <div className="header-actions">
          <button className="save-btn" onClick={handleSave} disabled={isLoading}>
            <FaSave /> Save Settings
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="editor-body">
        <div className="settings-section">
          <h3><FaFileAlt /> Resume URL</h3>
          <div className="form-group">
            <label>Resume PDF URL or Path</label>
            <input
              type="text"
              value={settings.resumeURL}
              onChange={(e) => handleResumeURLChange(e.target.value)}
              placeholder="Enter resume URL (e.g., /Kale_Sinclair_Resume.pdf or https://...)"
            />
            <small>This can be a local path (e.g., /resume.pdf) or a full URL</small>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h3><FaLink /> Social Links</h3>
            <button className="add-btn" onClick={handleAddSocialLink}>
              <FaPlus /> Add Social Link
            </button>
          </div>

          <div className="social-links-editor">
            {settings.socialLinks.map((link, index) => (
              <div key={index} className="social-link-item">
                <div className="link-fields">
                  <div className="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleSocialLinkChange(index, 'label', e.target.value)}
                      placeholder="e.g., GitHub, LinkedIn"
                    />
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={link.href}
                      onChange={(e) => handleSocialLinkChange(index, 'href', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon URL</label>
                    <input
                      type="text"
                      value={link.icon}
                      onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                      placeholder="/img/icons/..."
                    />
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveSocialLink(index)}
                  title="Remove link"
                >
                  <FaTimes />
                </button>
              </div>
            ))}

            {settings.socialLinks.length === 0 && (
              <div className="no-data">
                No social links added yet. Click "Add Social Link" to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;
