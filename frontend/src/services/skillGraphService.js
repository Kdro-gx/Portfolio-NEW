import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URI}`;

// Fetch all skill graphs
export const fetchSkillGraphs = async () => {
  try {
    const response = await axios.get(`${API_URL}/getskillgraphs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching skill graphs:", error);
    throw error;
  }
};