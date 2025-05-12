import Axios from 'axios';

const url_connect = import.meta.env.VITE_URL_CONNECT;

// Recojo los fichajes por usuario
export const getSignings = async (userId: string) => {
  try {
    const response = await Axios.get(url_connect + "signings/" + userId+ "/user");
    return response.data.signings;
  } catch (error) {
    console.error("Error fetching signings:", error);
    throw error;
  }
};
