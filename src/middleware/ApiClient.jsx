import React from "react";
import axios from "axios";

const baseurl = import.meta.env.VITE_LOCAL_API

const ApiClient = async (method, url, data = null, options = {}) => {

    const { token = null, withauth = false } = false;

    const headers = {}

    if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }

    try {
        const response = await axios({
            method,
            url: `${baseurl}${url}`,
            data,
            headers
        })

        return response.data
    }
    catch (error) {
        throw error;
    }

}

export default ApiClient
