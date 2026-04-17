import axios from "./axios";

// GET /api/properties?page=0&size=12
export const getProperties = (page = 0, size = 12) => {
    return axios.get(`/properties?page=${page}&size=${size}`);
};