// src/pages/admin/VideoManager.jsx

import React, { useEffect, useState } from "react";
import ApiClient from "../middleware/ApiClient";

export default function VideoManager() {
  const [slug, setSlug] = useState("");
  const [videos, setVideos] = useState([""]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const BASE_URL = import.meta.env.VITE_LOCAL_API;

  /* ================= FETCH ALL ================= */

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await ApiClient("GET", "api/admin/videos");
      setList(res.data); // ✅ correct
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= INPUT HANDLING ================= */

  const handleChange = (index, value) => {
    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addField = () => {
    if (videos.length >= 12) return alert("Max 12 videos allowed");
    setVideos([...videos, ""]);
  };

  const removeField = (index) => {
    const updated = videos.filter((_, i) => i !== index);
    setVideos(updated.length ? updated : [""]);
  };

  /* ================= SAVE / UPDATE ================= */

  const handleSubmit = async () => {
    try {
      if (!slug.trim()) return alert("Slug is required");

      const cleanVideos = videos
        .map((v) => v.trim())
        .filter((v) => v !== "");

      if (cleanVideos.length === 0) {
        return alert("At least one video required");
      }

      if (cleanVideos.length > 12) {
        return alert("Max 12 videos allowed");
      }

      setLoading(true);

      await ApiClient("POST", "api/admin/videos", {
        slug,
        videos: cleanVideos,
      });

      alert(isEdit ? "Updated ✅" : "Saved ✅");

      setSlug("");
      setVideos([""]);
      setIsEdit(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (item) => {
    setSlug(item.slug);
    setVideos(item.videos);
    setIsEdit(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (slug) => {
    if (!window.confirm("Delete this?")) return;

    try {
      setLoading(true);
      await ApiClient(
        "DELETE",
        `api/admin/videos/${encodeURIComponent(slug)}`
      );
      fetchAll();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= COPY URL ================= */

  const copyUrl = (slug) => {
    const url = `${BASE_URL}api/videos/${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(url);
    alert("Copied URL ✅");
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
            disabled={loading}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "✏️ Update"
              : "💾 Save"}
          </button>
        </div>

        <hr className="my-6" />

        {/* ALL DATA */}
        <h3 className="text-lg font-semibold mb-3">All Pages</h3>

        {loading && <p className="text-gray-500">Loading...</p>}

        <div className="grid md:grid-cols-2 gap-4">
          {list?.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl p-4 shadow-sm bg-gray-50"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold text-blue-600">
                    {item.slug}
                  </h4>

                  {/* API URL */}
                  <p className="text-xs text-gray-500 break-all">
                    {`${BASE_URL}api/videos/${encodeURIComponent(
                      item.slug
                    )}`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.slug)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* VIDEOS */}
              <div className="space-y-1 text-sm text-gray-700">
                {item.videos.map((v, i) => (
                  <p key={i} className="truncate">
                    🔗 {v}
                  </p>
                ))}
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={() => copyUrl(item.slug)}
                className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                Copy API URL
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}