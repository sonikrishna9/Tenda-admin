"use client";

import React, { useState, useEffect } from "react";
import {
    FiUpload,
    FiLoader,
    FiX,
    FiCalendar,
    FiMapPin,
    FiUser,
    FiFolder,
    FiFileText,
    FiImage,
    FiAlertCircle,
    FiCheckCircle,
    FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AddNewsForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        publishedDate: "",
        location: "",
        category: "",
        author: "",
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Character counters
    const [titleCount, setTitleCount] = useState(0);
    const [descriptionCount, setDescriptionCount] = useState(0);

    // Get today's date in YYYY-MM-DD format for max date attribute
    const today = new Date().toISOString().split('T')[0];

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    // Update character counts
    useEffect(() => {
        setTitleCount(formData.title.length);
    }, [formData.title]);

    useEffect(() => {
        setDescriptionCount(formData.description.length);
    }, [formData.description]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [bannerPreview]);

    /* ================= VALIDATION ================= */

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value.trim()) error = "Title is required";
                else if (value.trim().length < 5) error = "Title must be at least 5 characters";
                else if (value.trim().length > 200) error = "Title must be less than 200 characters";
                break;

            case "description":
                if (!value.trim()) error = "Description is required";
                else if (value.trim().length < 20) error = "Description must be at least 20 characters";
                else if (value.trim().length > 5000) error = "Description must be less than 5000 characters";
                break;

            case "publishedDate":
                if (!value) error = "Published date is required";
                else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate > today) {
                        error = "Published date cannot be in the future";
                    }
                }
                break;

            case "location":
                if (!value.trim()) error = "Location is required";
                else if (value.trim().length < 3) error = "Location must be at least 3 characters";
                else if (value.trim().length > 200) error = "Location must be less than 200 characters";
                break;

            case "category":
                if (value && value.trim().length > 100) error = "Category must be less than 100 characters";
                break;

            case "author":
                if (value && value.trim().length > 100) error = "Author must be less than 100 characters";
                break;

            default:
                break;
        }

        return error;
    };

    const validate = () => {
        let newErrors = {};

        // Validate all fields
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        // Validate banner image
        if (!bannerImage) {
            newErrors.banner = "Banner image is required";
        } else {
            // Check file type
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
            if (!allowedTypes.includes(bannerImage.type)) {
                newErrors.banner = "Only JPG, PNG, WEBP images are allowed";
            }
            // Check file size (max 5MB)
            else if (bannerImage.size > 5 * 1024 * 1024) {
                newErrors.banner = "Banner image must be less than 5MB";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const error = validateField(field, formData[field]);
        setErrors({ ...errors, [field]: error });
    };

    /* ================= TEXT INPUT ================= */

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        
        // Clear error for this field when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    /* ================= BANNER IMAGE (SINGLE) ================= */

    const handleBannerChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            showNotification('error', 'Only JPG, PNG, and WEBP images are allowed');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('error', 'Banner image must be less than 5MB');
            return;
        }

        // Clean up previous preview
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }

        setBannerImage(file);
        setBannerPreview(URL.createObjectURL(file));
        
        // Clear banner error if exists
        if (errors.banner) {
            setErrors({ ...errors, banner: "" });
        }
    };

    const removeBanner = () => {
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerImage(null);
        setBannerPreview(null);
        document.getElementById('banner-upload').value = '';
        
        // Set banner error
        setErrors({ ...errors, banner: "Banner image is required" });
    };

    /* ================= SUBMIT FORM ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(key => allTouched[key] = true);
        setTouched(allTouched);

        if (!validate()) {
            showNotification('error', 'Please fix all errors before submitting');
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key].trim());
            });

            if (bannerImage) {
                data.append("bannerImage", bannerImage);
            }

            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/news/create`,
                {
                    method: "POST",
                    body: data,
                }
            );

            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            showNotification('success', 'News created successfully');

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    title: "",
                    description: "",
                    publishedDate: "",
                    location: "",
                    category: "",
                    author: "",
                });

                if (bannerPreview) {
                    URL.revokeObjectURL(bannerPreview);
                }
                
                setBannerImage(null);
                setBannerPreview(null);
                setErrors({});
                setTouched({});
                
                // Navigate back to news manager after 1 second
                setTimeout(() => navigate('/news'), 1000);
            }, 1500);

        } catch (error) {
            console.error(error);
            showNotification('error', error.message || "Failed to create news");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slideIn ${
                    notification.type === 'success' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {notification.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Create News Article</h1>
                    <button
                        onClick={() => navigate('/news')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        Back to News
                    </button>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FiFileText className="text-white" />
                            Add News Article
                        </h2>
                        <p className="text-blue-100 mt-1">Fill in the details to create a new news article</p>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                News Title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('title')}
                                    className={`w-full pl-10 pr-16 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                        touched.title && errors.title
                                            ? 'border-red-300 bg-red-50'
                                            : touched.title && !errors.title
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    placeholder="Enter news title"
                                    maxLength={200}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    {titleCount}/200
                                </div>
                            </div>
                            {touched.title && errors.title && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <FiAlertCircle size={14} />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                News Description <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    name="description"
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('description')}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none ${
                                        touched.description && errors.description
                                            ? 'border-red-300 bg-red-50'
                                            : touched.description && !errors.description
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    placeholder="Enter detailed news description"
                                    maxLength={5000}
                                />
                                <div className="absolute right-3 bottom-3 text-sm text-gray-400">
                                    {descriptionCount}/5000
                                </div>
                            </div>
                            {touched.description && errors.description && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                    <FiAlertCircle size={14} />
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Two Column Layout for Date and Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Published Date Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Published Date <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        (Past dates only)
                                    </span>
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="publishedDate"
                                        value={formData.publishedDate}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('publishedDate')}
                                        max={today}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.publishedDate && errors.publishedDate
                                                ? 'border-red-300 bg-red-50'
                                                : touched.publishedDate && !errors.publishedDate
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    />
                                </div>
                                {touched.publishedDate && errors.publishedDate && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <FiAlertCircle size={14} />
                                        {errors.publishedDate}
                                    </p>
                                )}
                                {!errors.publishedDate && formData.publishedDate && (
                                    <p className="text-blue-500 text-sm flex items-center gap-1 mt-1">
                                        <FiCheckCircle size={14} />
                                        Valid date
                                    </p>
                                )}
                            </div>

                            {/* Location Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('location')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.location && errors.location
                                                ? 'border-red-300 bg-red-50'
                                                : touched.location && !errors.location
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        placeholder="Enter location"
                                        maxLength={200}
                                    />
                                </div>
                                {touched.location && errors.location && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <FiAlertCircle size={14} />
                                        {errors.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Two Column Layout for Category and Author */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Category
                                </label>
                                <div className="relative">
                                    <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('category')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.category && errors.category
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        placeholder="Enter category (e.g., Politics, Sports)"
                                        maxLength={100}
                                    />
                                </div>
                                {touched.category && errors.category && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <FiAlertCircle size={14} />
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Author Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Author
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('author')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.author && errors.author
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        placeholder="Enter author name"
                                        maxLength={100}
                                    />
                                </div>
                                {touched.author && errors.author && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <FiAlertCircle size={14} />
                                        {errors.author}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Banner Image Upload (Single Image) */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Banner Image <span className="text-red-500">*</span>
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    (Single image, max 5MB)
                                </span>
                            </label>

                            {/* Upload Area */}
                            {!bannerImage ? (
                                <div className="border-3 border-dashed border-blue-300 rounded-2xl p-8 bg-blue-50 hover:bg-blue-100 transition-all">
                                    <input
                                        type="file"
                                        id="banner-upload"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={handleBannerChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="banner-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                            <FiImage size={32} className="text-blue-600" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            Click to upload banner image
                                        </p>
                                        <p className="text-sm text-gray-500 text-center">
                                            Supported: JPG, PNG, WEBP (max 5MB)
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                /* Banner Preview with Remove Option */
                                <div className="relative group">
                                    <div className="rounded-xl overflow-hidden border-2 border-blue-200">
                                        <img
                                            src={bannerPreview}
                                            alt="Banner Preview"
                                            className="w-full h-64 object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                                        title="Remove banner image"
                                    >
                                        <FiX size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                        Banner Image
                                    </div>
                                </div>
                            )}

                            {/* Banner Error Message */}
                            {errors.banner && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                                    <FiAlertCircle size={14} />
                                    {errors.banner}
                                </p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader size={20} className="animate-spin" />
                                        Creating News...
                                    </>
                                ) : (
                                    <>
                                        <FiUpload size={20} />
                                        Create News Article
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/news')}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <FiX size={20} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

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
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}