import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

export default function ParentCategoryBanner() {
  const navigate = useNavigate();

  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    parentCategory: "",
    description: "",
    bannerImage: null
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  /* ================= FETCH PARENT CATEGORIES ================= */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_LOCAL_API}api/parentcategory/getall`
      );

      const result = await res.json();
      const arr = result?.parentcategory || [];

      if (Array.isArray(arr)) {
        setParentCategories(arr.map(p => p.categoryname));
      }

    } catch (err) {
      alert("Failed to load parent categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ================= VALIDATION ================= */

  const validateForm = (formData, isSubmitting = false) => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.parentCategory) {
      errors.parentCategory = "Please select a parent category";
    }

    if (isSubmitting && !formData.bannerImage) {
      errors.bannerImage = "Banner image is required";
    }

    return errors;
  };

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, bannerImage: "Please select an image file" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, bannerImage: "Image size should be less than 5MB" }));
      return;
    }

    setForm(prev => ({ ...prev, bannerImage: file }));
    setPreview(URL.createObjectURL(file));
    
    // Clear any existing image errors
    if (errors.bannerImage) {
      setErrors(prev => ({ ...prev, bannerImage: null }));
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, bannerImage: null }));
    setPreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validateForm({ ...form, [fieldName]: form[fieldName] });
    if (fieldErrors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(form, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(form).forEach(key => {
        if (key !== 'bannerImage' || validationErrors.bannerImage) {
          allTouched[key] = true;
        }
      });
      setTouched(allTouched);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("parentCategory", form.parentCategory);
      formData.append("description", form.description);
      formData.append("bannerImage", form.bannerImage);

      const res = await fetch(
        `${import.meta.env.VITE_LOCAL_API}api/parentcategorybanner/create`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Show success message
      alert("✅ Parent Category Banner Created Successfully");
      navigate("/parentcategorybannertable");

    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Create Parent Category Banner
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new banner for your parent category
            </p>
          </div>
          <button
            onClick={() => navigate("/parentcategorybannertable")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Banner Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Two Column Layout for basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TITLE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    placeholder="Enter banner title"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      touched.title && errors.title 
                        ? 'border-red-500 ring-1 ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    } transition-all duration-200 outline-none`}
                  />
                  {touched.title && errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* SUBTITLE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Enter banner subtitle (optional)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              {/* PARENT CATEGORY */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="parentCategory"
                  value={form.parentCategory}
                  onChange={handleChange}
                  onBlur={() => handleBlur('parentCategory')}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.parentCategory && errors.parentCategory
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  } transition-all duration-200 outline-none bg-white`}
                >
                  <option value="">Select Parent Category</option>
                  {loading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    parentCategories.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))
                  )}
                </select>
                {touched.parentCategory && errors.parentCategory && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.parentCategory}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="prose max-w-none">
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(val) => setForm({ ...form, description: val })}
                    modules={modules}
                    placeholder="Enter banner description..."
                    className="bg-white rounded-lg"
                  />
                </div>
              </div>

              {/* IMAGE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                
                {!preview ? (
                  <div className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
                    errors.bannerImage 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4V12a4 4 0 014-4h12m16 0h4m-4-4v4m0 0h-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4 flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {errors.bannerImage && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.bannerImage}
                  </p>
                )}
              </div>

              {/* FORM ACTIONS */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/parentcategorybannertable")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Banner
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Banner Guidelines
          </h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Use high-quality images for best results</li>
            <li>Recommended image size: 1920x600 pixels</li>
            <li>Keep title concise and descriptive (max 60 characters)</li>
            <li>Description can include formatting like bold, lists, and colors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}