import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    return config;
});

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data.url;
};