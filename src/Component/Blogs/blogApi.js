import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_LOCAL_API}api/blog`
});

export const getAllBlogs = (params) =>
  API.get("/get-all", { params });

export const getBlogBySlug = (slug) =>
  API.get(`/slug/${slug}`);

export const createBlog = (data) =>
  API.post("/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBlog = (id, data) =>
  API.put(`/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBlog = (id) =>
  API.delete(`/${id}`);
