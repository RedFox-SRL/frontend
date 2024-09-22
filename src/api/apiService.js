import api from './axiosConfig';

export const getData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud GET:', error);
    throw error;
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud POST:', error);
    throw error;
  }
};

export const putData = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud PUT:', error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud GET /me:', error);
    throw error;
  }
};

export const deleteData = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud DELETE:', error);
    throw error;
  }
};