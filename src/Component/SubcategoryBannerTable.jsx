import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_LOCAL_API + "api/subcategory";

export default function SubcategoryBannerTable() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [preview, setPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FETCH ALL ================= */

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/all`);
      const data = await res.json();

      if (data.success) setBanners(data.banners || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= VALIDATION ================= */

  const validateForm = (formData, isEditing = true) => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (formData.subtitle?.length > 200) {
      errors.subtitle = "Subtitle must be less than 200 characters";
    }

    if (formData.description?.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (!isEditing) {
      if (!formData.bannerImage) {
        errors.bannerImage = "Banner image is required";
      }
    } else {
      if (formData.bannerImage && formData.bannerImage.size > 5 * 1024 * 1024) {
        errors.bannerImage = "Image must be less than 5MB";
      } else if (formData.bannerImage && !formData.bannerImage.type.startsWith('image/')) {
        errors.bannerImage = "File must be an image";
      }
    }

    return errors;
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner permanently? This action cannot be undone.")) 
      return;

    try {
      setDeleteLoading(id);
      const res = await fetch(`${API}/delete/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete banner");

      setBanners(prev => prev.filter(b => b._id !== id));
      
      // Show success message
      alert("Banner deleted successfully");

    } catch (err) {
      alert(err.message || "Error deleting banner");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ================= EDIT OPEN ================= */

  const openEdit = (banner) => {
    setEditing(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      bannerImage: null
    });
    setPreview(banner.bannerImage?.url || null);
    setFormErrors({});
  };

  /* ================= IMAGE ================= */

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, bannerImage: "Please select a valid image file" }));
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, bannerImage: "Image size must be less than 5MB" }));
      e.target.value = '';
      return;
    }

    setForm(prev => ({ ...prev, bannerImage: file }));
    setPreview(URL.createObjectURL(file));
    
    setFormErrors(prev => {
      const { bannerImage, ...rest } = prev;
      return rest;
    });
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      const errors = validateForm(form, true);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setUpdateLoading(true);
      const formData = new FormData();

      Object.keys(form).forEach(k => {
        if (form[k] !== null && form[k] !== undefined && form[k] !== '') {
          formData.append(k, form[k]);
        }
      });

      const res = await fetch(`${API}/update/${editing}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update banner");

      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      alert("Banner updated successfully");
      setEditing(null);
      fetchBanners();

    } catch (err) {
      alert(err.message || "Error updating banner");
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ================= CANCEL EDIT ================= */

  const handleCancelEdit = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setEditing(null);
    setForm({});
    setPreview(null);
    setFormErrors({});
  };

  /* ================= NAVIGATION ================= */

  const handleAddNew = () => {
    window.location.href = '/subcategorybanner';
  };

  /* ================= FILTER BANNERS ================= */

  const filteredBanners = banners.filter(banner => 
    banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.parentCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Subcategory Banners
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and organize your subcategory banners
              </p>
            </div>
            
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Subcategory Banner
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, parent category, or subcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <svg 
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Banners Grid/Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 text-lg">Loading banners...</p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">No banners found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? "Try adjusting your search" : "Click 'Add New' to create your first banner"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View (Cards) */}
              <div className="block lg:hidden">
                {filteredBanners.map(b => (
                  <div key={b._id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={b.bannerImage?.url || '/api/placeholder/80/80'}
                            alt={b.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/api/placeholder/80/80';
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{b.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Parent:</span> {b.parentCategory || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Subcategory:</span> {b.subCategory || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={deleteLoading === b._id}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {deleteLoading === b._id ? (
                          <span className="flex items-center">
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            Deleting...
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Image</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Title</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Parent Category</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Subcategory</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBanners.map(b => (
                      <tr key={b._id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="h-16 w-24 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={b.bannerImage?.url || '/api/placeholder/96/64'}
                              alt={b.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/96/64';
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-800">{b.title}</td>
                        <td className="p-4 text-gray-600">{b.parentCategory || 'N/A'}</td>
                        <td className="p-4 text-gray-600">{b.subCategory || 'N/A'}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(b)}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium shadow-sm hover:shadow"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              disabled={deleteLoading === b._id}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-medium shadow-sm hover:shadow disabled:opacity-50"
                            >
                              {deleteLoading === b._id ? (
                                <span className="flex items-center">
                                  <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                                  Deleting...
                                </span>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && filteredBanners.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
            <span>Showing {filteredBanners.length} of {banners.length} banners</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL - FIXED WIDTH AND HEIGHT ================= */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          {/* MODAL CONTAINER - Fixed width and auto height with max-height */}
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl transform transition-all overflow-hidden">
            {/* MODAL HEADER - Fixed */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Edit Banner</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* MODAL BODY - Scrollable with fixed max-height */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter banner title"
                    value={form.title}
                    onChange={e => {
                      setForm({ ...form, title: e.target.value });
                      if (formErrors.title) {
                        setFormErrors(prev => {
                          const { title, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.title 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Subtitle Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Enter subtitle (optional)"
                    value={form.subtitle}
                    onChange={e => {
                      setForm({ ...form, subtitle: e.target.value });
                      if (formErrors.subtitle) {
                        setFormErrors(prev => {
                          const { subtitle, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  {formErrors.subtitle && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.subtitle}</p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={form.description}
                    onChange={e => {
                      setForm({ ...form, description: e.target.value });
                      if (formErrors.description) {
                        setFormErrors(prev => {
                          const { description, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Image Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image {!preview && <span className="text-red-500">*</span>}
                    <span className="text-xs text-gray-500 ml-2">(Max 5MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {formErrors.bannerImage && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.bannerImage}</p>
                  )}
                  
                  {/* Image Preview */}
                  {preview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER - Fixed */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={updateLoading}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg min-w-[120px]"
                >
                  {updateLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Updating...
                    </span>
                  ) : (
                    'Update Banner'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}