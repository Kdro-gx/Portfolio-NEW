import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URI}`;

// Fetch all timeline events
export const fetchTimeline = async () => {
  try {
    const url = `${API_URL}/timeline?t=${Date.now()}`;
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const processedData = response.data.map(event => ({
      ...event,
      year: typeof event.year === 'string' ? parseInt(event.year) : event.year,
      quarter: event.quarter || "Q1",
      title: event.title || "Untitled Event",
      body: event.body || event.description || "",
      category: event.category || "other",
      color: event.color || "#782F40",
      icon: event.icon || "⭐"
    }));

    return processedData;
  } catch (error) {
    console.error("Error fetching timeline:", error);
    throw error;
  }
};

// Fetch available years
export const fetchTimelineYears = async () => {
  try {
    const url = `${API_URL}/timeline/years?t=${Date.now()}`;
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching timeline years:", error);
    throw error;
  }
};

// Create new timeline event
export const createTimelineEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/timeline`, eventData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating timeline event:", error);
    throw error;
  }
};

// Update timeline event
export const updateTimelineEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/timeline/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error updating timeline event:", error);
    throw error;
  }
};

// Delete timeline event
export const deleteTimelineEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/timeline/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting timeline event:", error);
    throw error;
  }
};