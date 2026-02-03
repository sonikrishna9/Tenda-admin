import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FiUploadCloud,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiImage,
  FiSettings,
  FiSliders,
  FiExternalLink,
  FiCopy,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_LOCAL_API || 'http://localhost:8080/api';

const Slidermanagement = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, slug: '', images: [] });
  const [previewModal, setPreviewModal] = useState({ open: false, images: [], currentIndex: 0 });
  const [newSlider, setNewSlider] = useState({ slug: '', images: [] });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Fetch all sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      // Note: You might want to create a "get all sliders" endpoint
      // For now, we'll use a mock or you can implement backend endpoint
      const response = await axios.get(`${API_BASE}api/admin/slider/all`);
      if (response.data.success) {
        setSliders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
      showSnackbar('Error fetching sliders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Handle file selection for new slider
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      showSnackbar('Some files were skipped (must be images < 5MB)', 'warning');
    }

    // Create preview URLs
    const imagePreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setNewSlider(prev => ({
      ...prev,
      images: [...prev.images, ...imagePreviews]
    }));
  };

  // Handle file selection for edit slider
  const handleEditFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    const imagePreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      isNew: true
    }));

    setEditModal(prev => ({
      ...prev,
      images: [...prev.images, ...imagePreviews]
    }));
  };

  // Remove image from new slider
  const removeNewImage = (index) => {
    setNewSlider(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Remove image from edit slider
  const removeEditImage = (index) => {
    setEditModal(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Create new slider
  const handleCreateSlider = async () => {
    if (!newSlider.slug.trim()) {
      showSnackbar('Please enter a slider slug/name', 'error');
      return;
    }

    if (newSlider.images.length === 0) {
      showSnackbar('Please select at least one image', 'error');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('slug', newSlider.slug);
      
      newSlider.images.forEach((image) => {
        formData.append('images', image.file);
      });

      const response = await axios.post(
        `${API_BASE}api/admin/slider/${newSlider.slug}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            // You can show upload progress here
          },
        }
      );

      if (response.data.success) {
        showSnackbar('Slider created successfully', 'success');
        resetNewSlider();
        fetchSliders();
      }
    } catch (error) {
      console.error('Error creating slider:', error);
      showSnackbar(error.response?.data?.message || 'Error creating slider', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Update slider
  const handleUpdateSlider = async () => {
    if (editModal.images.filter(img => !img.isNew).length === 0) {
      showSnackbar('Please add at least one image', 'error');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      // Only include new images
      const newImages = editModal.images.filter(img => img.isNew);
      newImages.forEach((image) => {
        formData.append('images', image.file);
      });

      const response = await axios.put(
        `${API_BASE}api/admin/slider/${editModal.slug}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        showSnackbar('Slider updated successfully', 'success');
        setEditModal({ open: false, slug: '', images: [] });
        fetchSliders();
      }
    } catch (error) {
      console.error('Error updating slider:', error);
      showSnackbar(error.response?.data?.message || 'Error updating slider', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Delete slider
  const handleDeleteSlider = async (slug) => {
    try {
      const response = await axios.delete(`${API_BASE}/admin/slider/${slug}`);
      
      if (response.data.success) {
        showSnackbar(`Slider "${slug}" deleted successfully`, 'success');
        setDeleteConfirm(null);
        fetchSliders();
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting slider', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (slug) => {
    const slider = sliders.find(s => s.slug === slug);
    if (slider) {
      const images = slider.images.map(img => ({
        url: img.url,
        preview: img.url,
        name: `Image-${img.public_id?.slice(-8) || '1'}`,
        size: 'Uploaded',
        isNew: false
      }));
      setEditModal({ open: true, slug, images });
    }
  };

  // Open preview modal
  const openPreviewModal = (images, index = 0) => {
    setPreviewModal({ open: true, images, currentIndex: index });
  };

  // Navigate preview images
  const navigatePreview = (direction) => {
    setPreviewModal(prev => ({
      ...prev,
      currentIndex: direction === 'next' 
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }));
  };

  // Copy slug to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Copied to clipboard', 'success');
  };

  // Reset new slider form
  const resetNewSlider = () => {
    setNewSlider({ slug: '', images: [] });
  };

  // Show snackbar
  const showSnackbar = (message, type) => {
    setSnackbar({ open: true, message, type });
  };

  // Filter sliders by active tab
  const filteredSliders = sliders.filter(slider => {
    if (activeTab === 'all') return true;
    if (activeTab === 'with-images') return slider.images.length > 0;
    if (activeTab === 'empty') return slider.images.length === 0;
    return true;
  });

  // Get API endpoint for a slider
  const getApiEndpoint = (slug) => {
    return `${API_BASE.replace('/api', '')}api/slider/${slug}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Slider Management
            </h1>
            <p className="text-gray-600">Upload and manage slider images for different sections</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchSliders}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <FiRefreshCw className="text-gray-600" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiSliders className="text-blue-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{sliders.length}</div>
                <div className="text-sm text-gray-600">Total Sliders</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiImage className="text-green-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sliders.reduce((acc, s) => acc + s.images.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiSettings className="text-purple-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {sliders.filter(s => s.images.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Active Sliders</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="text-yellow-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {sliders.filter(s => s.images.length === 0).length}
                </div>
                <div className="text-sm text-gray-600">Empty Sliders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Create New Slider */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              Create New Slider
            </h2>

            {/* Slug Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Slider Slug *
              </label>
              <input
                type="text"
                value={newSlider.slug}
                onChange={(e) => setNewSlider(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., home-banner, product-showcase"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                Used in API calls: <code className="bg-gray-100 px-2 py-1 rounded">/api/slider/{"{slug}"}</code>
              </p>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Images *
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${newSlider.images.length > 0 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <FiUploadCloud className="text-4xl text-blue-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  {newSlider.images.length > 0 
                    ? `${newSlider.images.length} image(s) selected`
                    : 'Click to upload images'
                  }
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG, WebP up to 5MB each
                </p>
                {newSlider.images.length > 0 && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Ready to upload
                  </p>
                )}
              </div>
            </div>

            {/* Selected Images Preview */}
            {newSlider.images.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">Selected Images</h3>
                  <button
                    onClick={() => setNewSlider(prev => ({ ...prev, images: [] }))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {newSlider.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={handleCreateSlider}
              disabled={!newSlider.slug.trim() || newSlider.images.length === 0 || uploading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${!newSlider.slug.trim() || newSlider.images.length === 0 || uploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Uploading...
                </div>
              ) : (
                'Create Slider'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Sliders List */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'with-images', 'empty'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {tab === 'all' && 'All Sliders'}
                {tab === 'with-images' && 'With Images'}
                {tab === 'empty' && 'Empty'}
              </button>
            ))}
          </div>

          {/* Sliders Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSliders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <FiSliders className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No sliders found</h3>
              <p className="text-gray-500 mb-6">Create your first slider to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredSliders.map((slider) => (
                <div
                  key={slider.slug}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {slider.slug}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiImage />
                            {slider.images.length} images
                          </span>
                          <span className="flex items-center gap-1">
                            <FiSettings />
                            {slider.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPreviewModal(slider.images)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Preview"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => openEditModal(slider.slug)}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(slider.slug)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    {/* API Endpoint */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">API Endpoint</p>
                          <code className="text-sm bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                            {getApiEndpoint(slider.slug)}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(getApiEndpoint(slider.slug))}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Copy URL"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </div>

                    {/* Images Preview */}
                    {slider.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {slider.images.slice(0, 3).map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`${slider.slug} - ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => openPreviewModal(slider.images, index)}
                                className="p-2 bg-white rounded-full shadow-lg"
                              >
                                <FiExternalLink className="text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {slider.images.length > 3 && (
                          <div className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                            <span className="text-gray-700 font-medium">
                              +{slider.images.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FiAlertCircle className="text-3xl text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No images uploaded yet</p>
                        <button
                          onClick={() => openEditModal(slider.slug)}
                          className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Upload images now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Slider: {editModal.slug}
                </h2>
                <button
                  onClick={() => setEditModal({ open: false, slug: '', images: [] })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FiXCircle className="text-gray-500 text-xl" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Current Images */}
              {editModal.images.filter(img => !img.isNew).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Current Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {editModal.images
                      .filter(img => !img.isNew)
                      .map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Current ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => openPreviewModal(editModal.images.filter(img => !img.isNew), index)}
                              className="p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="View"
                            >
                              <FiEye size={12} className="text-gray-700" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Add New Images (will replace existing ones)
                </h3>
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileSelect}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                >
                  <FiUploadCloud className="text-4xl text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Click to upload new images</p>
                  <p className="text-gray-500 text-sm">Existing images will be replaced</p>
                </div>
              </div>

              {/* New Images Preview */}
              {editModal.images.filter(img => img.isNew).length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">
                      New Images ({editModal.images.filter(img => img.isNew).length})
                    </h3>
                    <button
                      onClick={() => {
                        const filtered = editModal.images.filter(img => !img.isNew);
                        setEditModal(prev => ({ ...prev, images: filtered }));
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All New
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {editModal.images
                      .filter(img => img.isNew)
                      .map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeEditImage(
                              editModal.images.findIndex(img => 
                                img.isNew && img.preview === image.preview
                              )
                            )}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditModal({ open: false, slug: '', images: [] })}
                  disabled={uploading}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSlider}
                  disabled={uploading || editModal.images.filter(img => img.isNew).length === 0}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md ${uploading || editModal.images.filter(img => img.isNew).length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg'
                    }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Slider'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewModal({ open: false, images: [], currentIndex: 0 })}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <FiXCircle className="text-gray-700 text-xl" />
            </button>
            
            <div className="relative h-full">
              {previewModal.images.length > 0 && (
                <>
                  <img
                    src={previewModal.images[previewModal.currentIndex]?.url || previewModal.images[previewModal.currentIndex]?.preview}
                    alt={`Preview ${previewModal.currentIndex + 1}`}
                    className="w-full h-[70vh] object-contain rounded-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  {previewModal.images.length > 1 && (
                    <>
                      <button
                        onClick={() => navigatePreview('prev')}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <FiChevronLeft className="text-gray-700 text-xl" />
                      </button>
                      <button
                        onClick={() => navigatePreview('next')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <FiChevronRight className="text-gray-700 text-xl" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
                    {previewModal.currentIndex + 1} / {previewModal.images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {previewModal.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {previewModal.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setPreviewModal(prev => ({ ...prev, currentIndex: index }))}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === previewModal.currentIndex 
                      ? 'border-blue-500' 
                      : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url || image.preview}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Slider</h3>
              <p className="text-gray-600">
                Are you sure you want to delete slider <strong>"{deleteConfirm}"</strong>?
                All images will be permanently deleted from Cloudinary.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSlider(deleteConfirm)}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-xl shadow-lg p-4 max-w-sm border-l-4 ${snackbar.type === 'success'
            ? 'bg-green-50 border-green-400'
            : snackbar.type === 'error'
            ? 'bg-red-50 border-red-400'
            : 'bg-yellow-50 border-yellow-400'
            }`}>
            <div className="flex items-center">
              {snackbar.type === 'success' ? (
                <FiCheckCircle className="text-green-500 mr-3 text-xl flex-shrink-0" />
              ) : snackbar.type === 'error' ? (
                <FiXCircle className="text-red-500 mr-3 text-xl flex-shrink-0" />
              ) : (
                <FiAlertCircle className="text-yellow-500 mr-3 text-xl flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${snackbar.type === 'success' ? 'text-green-800' 
                  : snackbar.type === 'error' ? 'text-red-800' 
                  : 'text-yellow-800'
                }`}>
                  {snackbar.message}
                </p>
              </div>
              <button
                onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <FiXCircle />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Slidermanagement;