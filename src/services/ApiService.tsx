import Axios from 'axios';

const apiUrl = "http://localhost:8000";

export const getSignings = async (userId: string) => {
  try {
    const response = await Axios.get(`${apiUrl}/GetSigningUser/${userId}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching signings:", error);
    throw error;
  }
};
