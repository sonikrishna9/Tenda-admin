import axios from "axios";

const baseurl = import.meta.env.VITE_LOCAL_API;

/* ================= COOKIE READER ================= */

const getCookie = (name) => {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
};

/* ================= API CLIENT ================= */

const ApiClient = async (method, url, data = null) => {

  const token = getCookie("adminToken");

  const headers = {};

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {

    const response = await axios({
      method,
      url: `${baseurl}${url}`,
      headers,
      ...(method === "GET"
        ? { params: data }
        : method === "DELETE"
          ? {} // 🔥 NO BODY FOR DELETE
          : { data }
      )
    });

    return response.data;

  } catch (error) {

    if (error.response?.status === 401) {

      document.cookie =
        "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      window.location.href = "/";
    }

    throw error;

  }

};

export default ApiClient;








// import React from "react";
// import axios from "axios";

// const baseurl = import.meta.env.VITE_LOCAL_API

// const ApiClient = async (method, url, data = null, options = {}) => {

//     const { token = null, withauth = false } = false;

//     const headers = {}

//     if (!(data instanceof FormData)) {
//         headers["Content-Type"] = "application/json";
//     }

//     if (token) {
//         headers["Authorization"] = `Bearer ${token}`
//     }

//     try {
//         const response = await axios({
//             method,
//             url: `${baseurl}${url}`,
//             data,
//             headers
//         })

//         return response.data
//     }
//     catch (error) {
//         throw error;
//     }

// }

// export default ApiClient
