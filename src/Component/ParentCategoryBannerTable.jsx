import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_LOCAL_API + "api/parentcategorybanner";

export default function ParentCategoryBannerTable() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [preview, setPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "clean"]
    ]
  };

  /* ================= FETCH ALL ================= */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/all`);
      const data = await res.json();

      if (data.success) setBanners(data.banners || []);
    } catch (err) {
      alert("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      setDeleteLoading(id);

      const res = await fetch(`${API}/delete/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setBanners(prev => prev.filter(b => b._id !== id));
      
      // Show success message
      alert("✅ Banner deleted successfully");

    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ================= EDIT ================= */
  const openEdit = (banner) => {
    setEditing(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      parentCategory: banner.parentCategory || "",
      description: banner.description || "",
      bannerImage: null
    });
    setPreview(banner.bannerImage?.url || null);
    setFormErrors({});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, bannerImage: "Please select an image file" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, bannerImage: "Image size should be less than 5MB" }));
      return;
    }

    setForm({ ...form, bannerImage: file });
    setPreview(URL.createObjectURL(file));
    setFormErrors(prev => ({ ...prev, bannerImage: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title?.trim()) errors.title = "Title is required";
    if (!form.parentCategory?.trim()) errors.parentCategory = "Parent category is required";
    return errors;
  };

  const handleUpdate = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setUpdateLoading(true);

      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch(`${API}/update/${editing}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Banner updated successfully");
      setEditing(null);
      fetchBanners();

    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ================= VIEW DETAILS ================= */
  const openViewModal = (banner) => {
    setSelectedBanner(banner);
    setViewModal(true);
  };

  /* ================= IMAGE ERROR HANDLING ================= */
  const handleImageError = (bannerId) => {
    setImageErrors(prev => ({ ...prev, [bannerId]: true }));
  };

  /* ================= SEARCH FILTER ================= */
  const filteredBanners = banners.filter(b =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.parentCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= STATISTICS ================= */
  const totalBanners = banners.length;
  const categoriesCount = [...new Set(banners.map(b => b.parentCategory))].length;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION WITH STATS */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Parent Category Banners
              </h1>
              <p className="text-slate-600 mt-2 ml-2">Manage and organize all your category banners</p>
            </div>

            <button
              onClick={() => navigate('/parentcategorybanner')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Banner
            </button>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Banners</p>
                  <p className="text-2xl font-bold text-slate-800">{totalBanners}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-slate-800">{categoriesCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Now</p>
                  <p className="text-2xl font-bold text-slate-800">{totalBanners}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, subtitle, or parent category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {filteredBanners.length} Results
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading banners...</p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No banners found</h3>
              <p className="text-slate-600 mb-6">{searchTerm ? "No results match your search criteria" : "Get started by creating your first banner"}</p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => navigate('/parentcategorybanner')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Banner
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Banner Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title & Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBanners.map((banner, index) => (
                    <tr 
                      key={banner._id} 
                      className="hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div className="w-24 h-16 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-200">
                            {banner.bannerImage?.url && !imageErrors[banner._id] ? (
                              <img
                                src={banner.bannerImage.url}
                                alt={banner.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-200"
                                onError={() => handleImageError(banner._id)}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Image indicator dot */}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${banner.bannerImage?.url ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{banner.title}</div>
                        {banner.subtitle && (
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {banner.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          {banner.parentCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(banner.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(banner)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEdit(banner)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Edit Banner"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            disabled={deleteLoading === banner._id}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Delete Banner"
                          >
                            {deleteLoading === banner._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* VIEW MODAL */}
        {viewModal && selectedBanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Banner Details
                </h2>
                <button
                  onClick={() => setViewModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  {selectedBanner.bannerImage?.url && !imageErrors[selectedBanner._id] ? (
                    <img
                      src={selectedBanner.bannerImage.url}
                      alt={selectedBanner.title}
                      className="w-full h-80 object-cover"
                      onError={() => handleImageError(selectedBanner._id)}
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <svg className="w-24 h-24 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                      <p className="text-lg font-bold text-slate-800 mt-1">{selectedBanner.title}</p>
                    </div>

                    {selectedBanner.subtitle && (
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtitle</label>
                        <p className="text-slate-700 mt-1">{selectedBanner.subtitle}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Category</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          {selectedBanner.parentCategory}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created On</label>
                      <p className="text-slate-700 mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(selectedBanner.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedBanner.description && (
                  <div className="mt-6">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Description</label>
                      <div 
                        className="prose max-w-none bg-white p-4 rounded-lg border border-slate-200"
                        dangerouslySetInnerHTML={{ __html: selectedBanner.description }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Banner
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      formErrors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } transition-all duration-200 outline-none`}
                    placeholder="Enter banner title"
                  />
                  {formErrors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Subtitle Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="Enter banner subtitle (optional)"
                  />
                </div>

                {/* Parent Category Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.parentCategory}
                    onChange={e => setForm({ ...form, parentCategory: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      formErrors.parentCategory ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } transition-all duration-200 outline-none`}
                    placeholder="Enter parent category"
                  />
                  {formErrors.parentCategory && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.parentCategory}
                    </p>
                  )}
                </div>

                {/* Description Field with Quill */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={form.description}
                      onChange={(val) => setForm({ ...form, description: val })}
                      modules={modules}
                      placeholder="Enter banner description..."
                      className="h-64"
                    />
                  </div>
                </div>

                {/* Image Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Banner Image
                  </label>
                  
                  {!preview ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4V12a4 4 0 014-4h12m16 0h4m-4-4v4m0 0h-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4 flex text-sm text-slate-600 justify-center">
                          <label htmlFor="modal-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload new image</span>
                            <input
                              id="modal-file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-contain bg-slate-50"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setForm({ ...form, bannerImage: null });
                          }}
                          className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {formErrors.bannerImage && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.bannerImage}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {updateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Banner
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}