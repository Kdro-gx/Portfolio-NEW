import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URI}`;

// Fetch all experiences
export const fetchSkillsComponents = async () => {
  try {
    const response = await axios.get(`${API_URL}/getskillcomponents`);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    throw error;
  }
};
