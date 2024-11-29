// src/api.js
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL; // Your base API URL from the environment variable

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Directly export functions for API calls
export const fetchData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Post Error:', error);
    throw error;
  }
};
