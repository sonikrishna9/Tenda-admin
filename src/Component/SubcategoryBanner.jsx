import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

export default function SubcategoryBanner() {
  const navigate = useNavigate();
  const [FilterSubcategories, setFilterSubcategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    parentCategory: "",
    subCategory: "",
    description: "",
    bannerImage: null
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ================= VALIDATION ================= */

  const validateForm = (formData, isSubmitting = false) => {
    const errors = {};

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    // Subtitle validation (optional but with length limit)
    if (formData.subtitle?.trim() && formData.subtitle.trim().length > 200) {
      errors.subtitle = "Subtitle must be less than 200 characters";
    }

    // Parent Category validation
    if (!formData.parentCategory) {
      errors.parentCategory = "Please select a parent category";
    }

    // Subcategory validation
    if (!formData.subCategory) {
      errors.subCategory = "Please select a subcategory";
    }

    // Description validation (optional but with length limit)
    if (formData.description?.replace(/<[^>]*>/g, '').trim().length > 2000) {
      errors.description = "Description must be less than 2000 characters";
    }

    // Image validation - only validate on submit or if touched
    if (isSubmitting || touched.bannerImage) {
      if (!formData.bannerImage) {
        errors.bannerImage = "Banner image is required";
      } else if (formData.bannerImage.size > 5 * 1024 * 1024) {
        errors.bannerImage = "Image must be less than 5MB";
      } else if (!formData.bannerImage.type.startsWith('image/')) {
        errors.bannerImage = "File must be an image";
      }
    }

    return errors;
  };

  /* ================= FETCH ================= */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_LOCAL_API}api/product/all-categories`
      );

      const result = await res.json();
      const arr = result?.allproducts || [];

      if (Array.isArray(arr)) {
        const subs = [];
        const parents = [];

        for (const item of arr) {
          if (item?.subCategory && !subs.includes(item.subCategory)) {
            subs.push(item.subCategory);
          }
          if (item?.parentCategory && !parents.includes(item.parentCategory)) {
            parents.push(item.parentCategory);
          }
        }

        setFilterSubcategories(subs);
        setParentCategories(parents);
      }

    } catch (err) {
      console.error("Failed to fetch products", err);
      alert("Failed to load categories. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    const fieldErrors = validateForm({ ...form, [name]: form[name] }, false);
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, bannerImage: "Please select a valid image file" }));
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, bannerImage: "Image size must be less than 5MB" }));
      e.target.value = '';
      return;
    }

    // Clean up previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setForm(prev => ({ ...prev, bannerImage: file }));
    setPreview(URL.createObjectURL(file));
    setTouched(prev => ({ ...prev, bannerImage: true }));

    // Clear image error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.bannerImage;
      return newErrors;
    });
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setForm(prev => ({ ...prev, bannerImage: null }));
    setPreview(null);
    setTouched(prev => ({ ...prev, bannerImage: true }));
    setErrors(prev => ({ ...prev, bannerImage: "Banner image is required" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const validationErrors = validateForm(form, true);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(form).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append all form fields
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          if (key === 'description') {
            // Strip HTML tags for length validation but keep for submission
            const textOnly = form[key].replace(/<[^>]*>/g, '');
            if (textOnly.trim()) {
              formData.append(key, form[key]);
            }
          } else {
            formData.append(key, form[key]);
          }
        }
      });

      const res = await fetch(
        `${import.meta.env.VITE_LOCAL_API}api/subcategory/create`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("✅ Banner created successfully");
      navigate("/subcategorybannertable");

      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Reset form
      setForm({
        title: "",
        subtitle: "",
        parentCategory: "",
        subCategory: "",
        description: "",
        bannerImage: null
      });

      setPreview(null);
      setErrors({});
      setTouched({});

    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Quill editor modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Create Subcategory Banner
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Add a new banner for your subcategory
              </p>
            </div>

            {/* Back Button */}
            <button
              onClick={() => window.location.href = '/subcategorybannertable'}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Banners
            </button>
          </div>
        </div>
      </div>

      {/* Loading State for Categories */}
      {loading ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading categories...</p>
          </div>
        </div>
      ) : (
        /* Main Form Card */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">

              {/* Form Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center text-blue-600">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                      <span className="ml-2 text-sm font-medium text-gray-700">Basic Info</span>
                    </div>
                    <div className="w-12 h-0.5 mx-2 bg-gray-300"></div>
                    <div className="flex items-center text-gray-400">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">2</div>
                      <span className="ml-2 text-sm font-medium text-gray-500">Categories</span>
                    </div>
                    <div className="w-12 h-0.5 mx-2 bg-gray-300"></div>
                    <div className="flex items-center text-gray-400">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">3</div>
                      <span className="ml-2 text-sm font-medium text-gray-500">Content</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* TITLE FIELD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter banner title (e.g., Summer Sale Banner)"
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:outline-none transition ${errors.title && touched.title
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.title && touched.title && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.title}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {form.title.length}/100 characters
                  </p>
                </div>

                {/* SUBTITLE FIELD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter subtitle (optional)"
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:outline-none transition ${errors.subtitle && touched.subtitle
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.subtitle && touched.subtitle && (
                    <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {form.subtitle.length}/200 characters
                  </p>
                </div>

                {/* CATEGORY SELECTION */}
                <div className="grid md:grid-cols-2 gap-5">
                  {/* PARENT CATEGORY */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parent Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parentCategory"
                      value={form.parentCategory}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:outline-none transition ${errors.parentCategory && touched.parentCategory
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    >
                      <option value="">Select parent category</option>
                      {parentCategories.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.parentCategory && touched.parentCategory && (
                      <p className="text-red-500 text-xs mt-1">{errors.parentCategory}</p>
                    )}
                  </div>

                  {/* SUBCATEGORY */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!form.parentCategory}
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:outline-none transition ${!form.parentCategory ? 'opacity-50 cursor-not-allowed' : ''
                        } ${errors.subCategory && touched.subCategory
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    >
                      <option value="">Select subcategory</option>
                      {FilterSubcategories.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subCategory && touched.subCategory && (
                      <p className="text-red-500 text-xs mt-1">{errors.subCategory}</p>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION EDITOR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <div className={`border rounded-xl overflow-hidden bg-white ${errors.description && touched.description
                      ? 'border-red-500'
                      : 'border-gray-300'
                    }`}>
                    <ReactQuill
                      theme="snow"
                      value={form.description}
                      onChange={(val) => {
                        setForm({ ...form, description: val });
                        if (errors.description) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.description;
                            return newErrors;
                          });
                        }
                      }}
                      modules={quillModules}
                      placeholder="Enter banner description..."
                      style={{ height: '200px' }}
                    />
                  </div>
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {form.description.replace(/<[^>]*>/g, '').length}/2000 characters
                  </p>
                </div>

                {/* IMAGE UPLOAD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Max 5MB)</span>
                  </label>

                  {!preview ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-blue-500 transition bg-gray-50 group">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4v-8m32-8l-6-6m6 6l-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600 group-hover:text-blue-600">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        name="bannerImage"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded-xl border-2 border-dashed border-gray-300 p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {errors.bannerImage && touched.bannerImage && (
                    <p className="text-red-500 text-xs mt-2">{errors.bannerImage}</p>
                  )}
                </div>

                {/* FORM ACTIONS */}
                <div className="pt-6 flex items-center justify-end space-x-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/subcategorybannertable'}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl text-white font-semibold 
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    hover:from-blue-700 hover:to-indigo-700
                    shadow-md hover:shadow-lg transform transition-all duration-200 
                    hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:hover:scale-100 min-w-[140px]"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Banner'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Banner Guidelines
            </h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Title should be clear and descriptive (3-100 characters)</li>
              <li>• Image must be at least 1200x400px for best quality</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Supported formats: PNG, JPG, WEBP</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}