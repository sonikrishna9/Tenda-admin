// src/pages/admin/VideoManager.jsx

import React, { useEffect, useState } from "react";
import ApiClient from "../middleware/ApiClient";

export default function Video() {
  const [slug, setSlug] = useState("");
  const [videos, setVideos] = useState([""]);
  const [list, setList] = useState([]);

  /* ================= FETCH ALL ================= */

  const fetchAll = async () => {
    try {
      const res = await ApiClient("GET", "api/videos/getall");
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= INPUT HANDLING ================= */

  const handleChange = (index, value) => {
    const updated = [...videos];
    updated[index] = value;
    setVideos(updated);
  };

  const addField = () => {
    if (videos.length >= 12) return alert("Max 12 videos allowed");
    setVideos([...videos, ""]);
  };

  const removeField = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */

  const handleSubmit = async () => {
    try {
      if (!slug) return alert("Slug is required");

      const cleanVideos = videos.filter((v) => v.trim());

      await ApiClient("POST", "api/videos/create", {
        slug,
        videos: cleanVideos,
      });

      alert("Saved ✅");

      setSlug("");
      setVideos([""]);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  /* ================= FETCH BY SLUG ================= */

  const handleFetchBySlug = async () => {
    try {
      const res = await ApiClient("GET", `api/videos/getall/${slug}`);
      setVideos(res.data.data.videos);
    } catch {
      alert("No data found");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this?")) return;

    await ApiClient("DELETE", `api/videos/delete/${slug}`);
    fetchAll();
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🎥 Video Manager
        </h2>

        {/* SLUG INPUT */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter slug (e.g. partner/dealer)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleFetchBySlug}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Fetch
          </button>
        </div>

        {/* VIDEO INPUTS */}
        <h3 className="font-semibold text-lg mb-2">Video Links</h3>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder={`Video ${index + 1}`}
                value={video}
                onChange={(e) => handleChange(index, e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={() => removeField(index)}
                className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={addField}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ➕ Add Video
          </button>

          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600"
          >
            💾 Save
          </button>
        </div>

        <hr className="my-6" />

        {/* ALL DATA */}
        <h3 className="text-lg font-semibold mb-3">All Pages</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {list?.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-4 shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-blue-600">
                  {item.slug}
                </h4>

                <button
                  onClick={() => handleDelete(item.slug)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                {item.videos.map((v, i) => (
                  <p key={i} className="truncate">
                    🔗 {v}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}