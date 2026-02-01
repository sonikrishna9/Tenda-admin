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
  FiChevronRight,
  FiSave,
  FiCalendar,
  FiTag,
  FiUser,
  FiHash,
  FiLoader
} from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_LOCAL_API || 'http://localhost:8080/api';

const Blogmanage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'published',
    author: '',
    featuredImage: null,
    featuredImagePreview: null,
    galleryImages: [],
    galleryPreviews: []
  });

  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}blog/get-all`);
      if (response.data.success) {
        setBlogs(response.data.data || []);
        setTotalPages(Math.ceil((response.data.data?.length || 0) / 8));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showSnackbar('Error fetching blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle content change for rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle tags input
  const handleTagsKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagsInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      setTagsInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please upload an image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size should be less than 5MB', 'error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        featuredImage: file,
        featuredImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Handle gallery images upload
  const handleGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showSnackbar(`${file.name} is not an image file`, 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar(`${file.name} exceeds 5MB limit`, 'error');
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...validFiles],
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews]
    }));
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, index) => index !== indexToRemove),
      galleryPreviews: prev.galleryPreviews.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Generate slug from title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------- VALIDATION ----------------
    if (!formData.title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }
    if (!formData.excerpt.trim()) {
      showSnackbar('Excerpt is required', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showSnackbar('Content is required', 'error');
      return;
    }
    if (!formData.category.trim()) {
      showSnackbar('Category is required', 'error');
      return;
    }
    if (!formData.author.trim()) {
      showSnackbar('Author name is required', 'error');
      return;
    }
    if (!formData.featuredImage && !editingBlog) {
      showSnackbar('Featured image is required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      const finalSlug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, "-");

      formDataToSend.append("slug", finalSlug);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('author', formData.author);

      // Featured image
      if (formData.featuredImage) {
        formDataToSend.append('featurePictures', formData.featuredImage);
      }

      // Gallery images
      formData.galleryImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      setUploadProgress(0);

      let response;

      if (editingBlog) {
        // -------- UPDATE BLOG --------
        response = await axios.put(
          `${API_URL}blog/update/${editingBlog._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            },
          }
        );

        showSnackbar('Blog updated successfully', 'success');
      } else {
        // -------- CREATE BLOG --------
        response = await axios.post(
          `${API_URL}blog/create_blog`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            },
          }
        );

        showSnackbar('Blog created successfully', 'success');
      }

      // Refresh + close
      handleCloseDialog();
      fetchBlogs();

    } catch (error) {
      console.error('Error saving blog:', error);
      showSnackbar(
        error.response?.data?.message || 'Error saving blog',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle edit blog
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || [],
      status: blog.status,
      author: blog.author?.name || '',
      featuredImage: null,
      featuredImagePreview: blog.featuredImage?.url,
      galleryImages: [],
      galleryPreviews: blog.gallery?.map(img => img.url) || []
    });
    setOpenDialog(true);
  };

  // Handle delete blog
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.post(`${API_URL}blog/delete/${id}`);
        showSnackbar('Blog deleted successfully', 'success');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        showSnackbar(
          error.response?.data?.message || 'Error deleting blog',
          'error'
        );
      }
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBlog(null);
    setIsSubmitting(false);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'draft',
      author: '',
      featuredImage: null,
      featuredImagePreview: null,
      galleryImages: [],
      galleryPreviews: []
    });
    setTagsInput('');
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

  // Filter blogs based on search
  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate blogs
  const itemsPerPage = 8;
  const paginatedBlogs = filteredBlogs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Quill editor modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Blog Management
            </h1>
            <p className="text-gray-600">Create, edit, and manage your blog posts</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={fetchBlogs}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-200"
              title="Refresh"
            >
              <FiRefreshCw className="text-gray-600" />
            </button>
            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <FiPlus className="text-lg" /> Create Blog
            </button>
          </div>
        </div>


      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-600 font-medium">Loading...</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={blog.featuredImage?.url}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusOptions.find(s => s.value === blog.status)?.color}`}>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCalendar className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-500">
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                      <FiHash size={10} /> {blog.category}
                    </span>
                    {blog.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-400" />
                      <span className="text-sm text-gray-600">{blog.author?.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredBlogs.length > itemsPerPage && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: Math.ceil(filteredBlogs.length / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === Math.ceil(filteredBlogs.length / itemsPerPage)}
                  className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiXCircle className="text-gray-500 text-xl" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Slug
                      <button
                        type="button"
                        onClick={generateSlug}
                        disabled={isSubmitting}
                        className="ml-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        (Generate from title)
                      </button>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="blog-url-slug"
                    />
                  </div>
                </div>

                {/* Category and Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Enter category"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                {/* Status and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Tags
                    </label>
                    <div className="relative">
                      <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        onKeyDown={handleTagsKeyDown}
                        disabled={isSubmitting}
                        placeholder="Type and press Enter to add tags"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              disabled={isSubmitting}
                              className="hover:text-blue-900 disabled:opacity-50"
                            >
                              <FiXCircle size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Brief description of the blog"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Content *
                  </label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleContentChange}
                      modules={quillModules}
                      className="h-64"
                      readOnly={isSubmitting}
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Featured Image {!editingBlog && '*'}
                  </label>
                  <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-2xl transition-all duration-200 bg-white ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'
                    }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    {formData.featuredImagePreview ? (
                      <div className="relative w-full max-w-md">
                        <img
                          src={formData.featuredImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: null, featuredImagePreview: null }))}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                        >
                          <FiTrash2 className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiUploadCloud className="text-5xl text-blue-400 mb-4" />
                        <p className="text-gray-700 font-medium mb-1">Click to upload featured image</p>
                        <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gallery Images (Optional)
                  </label>
                  <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl transition-all duration-200 bg-white ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                    }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <div className="text-center">
                      <FiImage className="text-4xl text-gray-400 mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Click to upload gallery images</p>
                      <p className="text-gray-500 text-sm">Multiple images allowed, 5MB each</p>
                    </div>
                  </label>
                  {formData.galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {formData.galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-30"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm font-medium text-blue-800 mb-2">
                      <span>Uploading images...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isSubmitting && (
                  <div className="fixed inset-0 bg-black bg-opacity-20 z-10 flex items-center justify-center rounded-2xl">
                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="text-gray-700 font-medium">
                        {editingBlog ? 'Updating Blog...' : 'Creating Blog...'}
                      </p>
                      <p className="text-gray-500 text-sm">Please wait while we save your changes</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (uploadProgress > 0 && uploadProgress < 100)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md ${isSubmitting || (uploadProgress > 0 && uploadProgress < 100)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <FiSave /> {editingBlog ? 'Update Blog' : 'Publish Blog'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-xl shadow-lg p-4 max-w-sm border-l-4 ${snackbar.type === 'success'
            ? 'bg-green-50 border-green-400'
            : 'bg-red-50 border-red-400'
            }`}>
            <div className="flex items-center">
              {snackbar.type === 'success' ? (
                <FiCheckCircle className="text-green-500 mr-3 text-xl flex-shrink-0" />
              ) : (
                <FiXCircle className="text-red-500 mr-3 text-xl flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${snackbar.type === 'success' ? 'text-green-800' : 'text-red-800'
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

export default Blogmanage;