"use client";
import React, { useEffect, useState } from "react";
import ApiClient from "../../middleware/ApiClient";
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSave, 
  FiX,
  FiGlobe,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader
} from "react-icons/fi";

const SeoAdmin = () => {
  const [form, setForm] = useState({
    slug: "home",
    metaTitle: "",
    metaDescription: "",
  });

  const [seoList, setSeoList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  // 🔹 GET ALL
  const fetchSEO = async () => {
    try {
      const res = await ApiClient("GET", "api/admin/meta/seo");
      setSeoList(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification("error", "Failed to fetch SEO data");
    }
  };

  useEffect(() => {
    fetchSEO();
  }, []);

  // 🔹 CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await ApiClient("PUT", `api/admin/meta/seo/${editId}`, form);
        showNotification("success", "SEO updated successfully!");
      } else {
        await ApiClient("POST", "api/admin/meta/seo", form);
        showNotification("success", "SEO created successfully!");
      }

      setForm({
        slug: "home",
        metaTitle: "",
        metaDescription: "",
      });
      setEditId(null);
      setIsFormVisible(false);
      fetchSEO();
    } catch (err) {
      console.error(err);
      showNotification("error", "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 EDIT
  const handleEdit = (item) => {
    setForm({
      slug: item.slug,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
    });
    setEditId(item._id);
    setIsFormVisible(true);
  };

  // 🔹 DELETE
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this SEO entry?")) {
      try {
        await ApiClient("DELETE", `api/admin/meta/seo/${id}`);
        showNotification("success", "SEO deleted successfully!");
        fetchSEO();
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to delete SEO");
      }
    }
  };

  // 🔹 Cancel Edit
  const handleCancel = () => {
    setForm({
      slug: "home",
      metaTitle: "",
      metaDescription: "",
    });
    setEditId(null);
    setIsFormVisible(false);
  };

  // Filtered SEO list based on search
  const filteredSeoList = seoList.filter(item =>
    item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.metaTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Slug display names mapping
  const slugNames = {
    home: "Home Page",
    contactus: "Contact Us",
    about: "About Page",
    "partner-program": "Partner Program",
    "partner-program/si-partner": "SI Partner",
    "partner-program/dealer": "Dealer/Distributor",
    blogs: "Blogs Page",
    news: "News Page",
    gallery: "Gallery Page",
    "privacy-policy": "Privacy Policy",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {notification.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            SEO Management
          </h1>
          <p className="text-gray-600 mt-2">Manage meta tags for better search engine visibility</p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by slug or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
            />
          </div>

          {/* Add Button */}
          {!isFormVisible && (
            <button
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              <FiPlus size={20} />
              Add New SEO
            </button>
          )}
        </div>

        {/* Form Card */}
        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-300 border border-orange-100">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {editId ? "Edit SEO Entry" : "Create New SEO Entry"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-white hover:bg-white/10 rounded-lg p-1 transition"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Slug *
                </label>
                <select
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                  required
                >
                  <option value="home">🏠 Home Page</option>
                  <option value="contactus">📞 Contact Us</option>
                  <option value="about">ℹ️ About Page</option>
                  <option value="partner-program">🤝 Partner Program</option>
                  <option value="si-partner">💼 SI Partner</option>
                  <option value="dealer">🏪 Dealer/Distributor</option>
                  <option value="blogs">📝 Blogs Page</option>
                  <option value="news">📰 News Page</option>
                  <option value="gallery">🖼️ Gallery Page</option>
                  <option value="privacy-policy">🔒 Privacy Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter meta title (50-60 characters recommended)"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description *
                </label>
                <textarea
                  placeholder="Enter meta description (150-160 characters recommended)"
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      {editId ? "Update SEO" : "Create SEO"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Page</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Meta Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Meta Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSeoList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <FiGlobe className="w-12 h-12 mx-auto mb-3 text-orange-300" />
                      <p>No SEO entries found</p>
                      <button
                        onClick={() => setIsFormVisible(true)}
                        className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Create your first SEO entry →
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSeoList.map((item) => (
                    <tr key={item._id} className="hover:bg-orange-50 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiFileText size={16} className="text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {slugNames[item.slug] || item.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2">
                            {item.metaTitle}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-lg">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.metaDescription}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition duration-200"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredSeoList.length > 0 && (
            <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
              <p className="text-sm text-gray-600">
                Showing {filteredSeoList.length} of {seoList.length} entries
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SeoAdmin;