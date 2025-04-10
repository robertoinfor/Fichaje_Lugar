import Axios from 'axios';

const url_connect = import.meta.env.VITE_URL_CONNECT;

export const getSignings = async (userId: string) => {
  try {
    const response = await Axios.get(`${url_connect}GetSigningUser/${userId}`);
    return response.data.signings;
  } catch (error) {
    console.error("Error fetching signings:", error);
    throw error;
  }
};
