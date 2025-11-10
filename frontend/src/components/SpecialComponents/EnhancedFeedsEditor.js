import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaRss,
  FaLink,
  FaParagraph,
  FaImage,
  FaTimes
} from 'react-icons/fa';
import '../../styles/EnhancedFeedsEditor.css';

const EnhancedFeedsEditor = () => {
  const API_URL = process.env.REACT_APP_API_URI;
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    feedTitle: '',
    feedCategory: '',
    feedContent: [''],
    feedImageURL: '',
    feedLinks: ['']
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/getFeeds`);
      setFeeds(response.data || []);
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setMessage('Error fetching feeds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFeed = (feed) => {
    setSelectedFeed(feed);
    setFormData({
      feedTitle: feed.feedTitle || '',
      feedCategory: feed.feedCategory || '',
      feedContent: feed.feedContent || [''],
      feedImageURL: feed.feedImageURL || '',
      feedLinks: feed.feedLinks || ['']
    });
  };

  const handleCreateNew = () => {
    setSelectedFeed(null);
    setFormData({
      feedTitle: '',
      feedCategory: '',
      feedContent: [''],
      feedImageURL: '',
      feedLinks: ['']
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleArrayUpdate = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        feedImageURL: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      feedImageURL: ''
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const cleanedData = {
        ...formData,
        feedContent: formData.feedContent.filter(p => p.trim() !== ''),
        feedLinks: formData.feedLinks.filter(u => u.trim() !== '')
      };

      if (selectedFeed) {
        await axios.put(`${API_URL}/updateFeed/${selectedFeed._id}`, cleanedData);
        setMessage('Feed updated successfully!');
      } else {
        await axios.post(`${API_URL}/addFeed`, cleanedData);
        setMessage('Feed created successfully!');
      }

      fetchFeeds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving feed:', error);
      setMessage('Error saving feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeed || !window.confirm('Are you sure you want to delete this feed?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/deleteFeed/${selectedFeed._id}`);
      setMessage('Feed deleted successfully!');
      setSelectedFeed(null);
      handleCreateNew();
      fetchFeeds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting feed:', error);
      setMessage('Error deleting feed');
    } finally {
      setIsLoading(false);
    }
  };

  const LivePreview = () => (
    <div className="live-preview">
      <h3>Live Preview</h3>
      <div className="preview-card">
        <div className="preview-header">
          <h4>{formData.feedTitle || 'Feed Title'}</h4>
          <FaRss className="preview-icon" />
        </div>
        <div className="preview-content">
          {formData.feedCategory && (
            <p className="preview-category"><strong>Category:</strong> {formData.feedCategory}</p>
          )}

          {formData.feedContent.filter(p => p.trim()).map((paragraph, index) => (
            <p key={index} className="preview-paragraph">{paragraph}</p>
          ))}

          {formData.feedLinks.filter(u => u.trim()).length > 0 && (
            <div className="preview-urls">
              <h5>Related Links:</h5>
              {formData.feedLinks.filter(u => u.trim()).map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="preview-url">
                  <FaLink /> {url}
                </a>
              ))}
            </div>
          )}

          {formData.feedImageURL && (
            <div className="preview-images">
              <img src={formData.feedImageURL} alt="Feed" className="preview-image" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="enhanced-feeds-editor">
      <div className="editor-header">
        <div className="header-left">
          <FaRss className="header-icon" />
          <h2>Enhanced Feeds Editor</h2>
        </div>
        <div className="header-actions">
          <button
            className="preview-toggle"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <FaEyeSlash /> : <FaEye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className="save-btn" onClick={handleSave} disabled={isLoading}>
            <FaSave /> Save
          </button>
          {selectedFeed && (
            <button className="delete-btn" onClick={handleDelete} disabled={isLoading}>
              <FaTrash /> Delete
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="editor-body">
        <div className="editor-sidebar">
          <div className="sidebar-header">
            <h3>Feeds List</h3>
            <button className="new-btn" onClick={handleCreateNew}>
              <FaPlus /> New Feed
            </button>
          </div>

          <div className="feeds-list">
            {isLoading ? (
              <div className="loading">Loading feeds...</div>
            ) : feeds.length === 0 ? (
              <div className="no-data">No feeds found</div>
            ) : (
              feeds.map((feed) => (
                <div
                  key={feed._id}
                  className={`feed-item ${selectedFeed?._id === feed._id ? 'selected' : ''}`}
                  onClick={() => handleSelectFeed(feed)}
                >
                  <div className="feed-info">
                    <span className="feed-title">{feed.feedTitle || 'Untitled Feed'}</span>
                    <span className="feed-meta">
                      {feed.feedContent?.length || 0} paragraphs
                    </span>
                  </div>
                  <FaEdit className="edit-icon" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="editor-main">
          <div className="main-content">
            <div className="form-section">
              <h3>Feed Information</h3>

              <div className="form-group">
                <label>Feed Title *</label>
                <input
                  type="text"
                  value={formData.feedTitle}
                  onChange={(e) => handleInputChange('feedTitle', e.target.value)}
                  placeholder="Enter feed title..."
                />
              </div>

              <div className="form-group">
                <label>Feed Category *</label>
                <input
                  type="text"
                  value={formData.feedCategory}
                  onChange={(e) => handleInputChange('feedCategory', e.target.value)}
                  placeholder="Enter feed category (e.g., Tech, Personal, Update)..."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3><FaParagraph /> Feed Content</h3>
                <button
                  className="add-btn"
                  onClick={() => handleArrayAdd('feedContent')}
                >
                  <FaPlus /> Add Paragraph
                </button>
              </div>

              <div className="array-editor">
                {formData.feedContent.map((paragraph, index) => (
                  <div key={index} className="array-item">
                    <textarea
                      value={paragraph}
                      onChange={(e) => handleArrayUpdate('feedContent', index, e.target.value)}
                      placeholder={`Paragraph ${index + 1}...`}
                      rows="3"
                    />
                    <button
                      className="remove-btn"
                      onClick={() => handleArrayRemove('feedContent', index)}
                      disabled={formData.feedContent.length === 1}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3><FaLink /> Feed Links</h3>
                <button
                  className="add-btn"
                  onClick={() => handleArrayAdd('feedLinks')}
                >
                  <FaPlus /> Add Link
                </button>
              </div>

              <div className="array-editor">
                {formData.feedLinks.map((url, index) => (
                  <div key={index} className="array-item">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleArrayUpdate('feedLinks', index, e.target.value)}
                      placeholder={`URL ${index + 1}...`}
                    />
                    <button
                      className="remove-btn"
                      onClick={() => handleArrayRemove('feedLinks', index)}
                      disabled={formData.feedLinks.length === 1}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3><FaImage /> Feed Image</h3>
                <button
                  className="add-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaUpload /> Upload Image
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              <div className="images-grid">
                {formData.feedImageURL && (
                  <div className="image-item">
                    <img src={formData.feedImageURL} alt="Feed" />
                    <button
                      className="remove-image-btn"
                      onClick={handleImageRemove}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="preview-section">
              <LivePreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFeedsEditor;
