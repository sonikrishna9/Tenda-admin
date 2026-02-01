import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUploadCloud,
  FiImage,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_LOCAL_API || 'http://localhost:8080/api';

const ParentCategoryui = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    categoryname: '',
    image: null,
    imagePreview: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/parentcategory/getall`);
      if (response.data.success) {
        setCategories(response.data.parentcategory);
        setTotalPages(Math.ceil(response.data.parentcategory.length / 6));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('Error fetching categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please upload an image file', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size should be less than 5MB', 'error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryname.trim()) {
      showSnackbar('Category name is required', 'error');
      return;
    }

    if (!formData.image && !editingCategory) {
      showSnackbar('Image is required', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('categoryname', formData.categoryname);
      
      if (formData.image) {
        formDataToSend.append('images', formData.image);
      }

      setUploadProgress(0);

      if (editingCategory) {
        // Update category
        await axios.put(`${API_URL}/parentcategory/update/${editingCategory._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        showSnackbar('Category updated successfully', 'success');
      } else {
        // Create new category
        await axios.post(`${API_URL}/parentcategory/create`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        showSnackbar('Category created successfully', 'success');
      }

      // Reset form and fetch updated categories
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar(error.response?.data?.message || 'Error saving category', 'error');
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryname: category.categoryname,
      image: null,
      imagePreview: category.images.url
    });
    setOpenDialog(true);
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_URL}/parentcategory/${id}`);
        showSnackbar('Category deleted successfully', 'success');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        showSnackbar('Error deleting category', 'error');
      }
    }
  };

  // Toggle category status
  const toggleStatus = async (category) => {
    try {
      await axios.put(`${API_URL}/parentcategory/${category._id}/toggle-status`, {
        status: !category.status
      });
      showSnackbar('Status updated successfully', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Error updating status', 'error');
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      categoryname: '',
      image: null,
      imagePreview: null
    });
    setUploadProgress(0);
  };

  // Show snackbar
  const showSnackbar = (message, type) => {
    setSnackbar({ open: true, message, type });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.categoryname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate categories
  const itemsPerPage = 6;
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Parent Categories Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <button
              onClick={fetchCategories}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Refresh"
            >
              <FiRefreshCw className="text-gray-600" />
            </button>
            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              <FiPlus /> Add Category
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {categories.length}
            </div>
            <div className="text-gray-600">Total Categories</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {categories.filter(c => c.status).length}
            </div>
            <div className="text-gray-600">Active Categories</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {categories.filter(c => !c.status).length}
            </div>
            <div className="text-gray-600">Inactive Categories</div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">Image</th>
                <th className="py-3 px-4 text-left font-semibold">Category Name</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Created At</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={category.images.url}
                          alt={category.categoryname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">
                        {category.categoryname}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          category.status
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        {category.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredCategories.length > itemsPerPage && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-lg ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                } transition-colors duration-200`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(filteredCategories.length / itemsPerPage)}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid View */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Category Cards View</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={category.images.url}
                  alt={category.categoryname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category.categoryname}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    category.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-gray-600 text-sm mb-4">
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex items-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex items-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="categoryname"
                    value={formData.categoryname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category Image {!editingCategory && '*'}
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {formData.imagePreview ? (
                      <div className="relative w-full h-48">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                          <FiTrash2 className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiUploadCloud className="text-4xl text-blue-400 mb-3" />
                        <p className="text-gray-600 mb-1">Click to upload category image</p>
                        <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploadProgress > 0 && uploadProgress < 100}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  uploadProgress > 0 && uploadProgress < 100
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {editingCategory ? (
                  <>
                    <FiEdit /> Update
                  </>
                ) : (
                  <>
                    <FiPlus /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            snackbar.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {snackbar.type === 'success' ? (
                <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <FiXCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  snackbar.type === 'success' ? 'text-green-800' : 'text-red-800'
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
    </div>
  );
};

export default ParentCategoryui;