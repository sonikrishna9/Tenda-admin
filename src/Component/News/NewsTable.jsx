"use client";

import React, { useEffect, useState } from "react";
import {
    FiEdit2,
    FiTrash2,
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
    FiEye
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function NewsTable() {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [editNews, setEditNews] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [selectedNews, setSelectedNews] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        publishedDate: "",
        location: "",
        category: "",
        author: "",
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [removeCurrentBanner, setRemoveCurrentBanner] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Character counters
    const [titleCount, setTitleCount] = useState(0);
    const [descriptionCount, setDescriptionCount] = useState(0);

    // Get today's date for max date attribute
    const today = new Date().toISOString().split('T')[0];

    /* ================= NOTIFICATION ================= */

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    /* ================= FETCH NEWS ================= */

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/news/all`
            );
            const data = await res.json();

            if (data.success) {
                setNews(data.data);
            }
        } catch (error) {
            console.error("Fetch News Error:", error);
            showNotification('error', 'Failed to fetch news');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    /* ================= DELETE NEWS ================= */

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this news? This action cannot be undone.")) return;

        try {
            setActionLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/news/delete/${id}`,
                { method: "DELETE" }
            );

            const data = await res.json();

            if (data.success) {
                showNotification('success', 'News deleted successfully');
                fetchNews();
            }
        } catch (error) {
            console.error("Delete Error:", error);
            showNotification('error', 'Failed to delete news');
        } finally {
            setActionLoading(false);
        }
    };

    /* ================= OPEN EDIT MODAL ================= */

    const openEditModal = (item) => {
        setEditNews(item);
        setEditForm({
            title: item.title || "",
            description: item.description || "",
            publishedDate: item.publishedDate ? item.publishedDate.split("T")[0] : "",
            location: item.location || "",
            category: item.category || "",
            author: item.author || "",
        });
        setBannerImage(null);
        setBannerPreview(null);
        setRemoveCurrentBanner(false);
        setErrors({});
        setTouched({});
        setTitleCount(item.title?.length || 0);
        setDescriptionCount(item.description?.length || 0);
    };

    /* ================= CLOSE EDIT MODAL ================= */

    const closeEditModal = () => {
        setEditNews(null);
        setEditForm({
            title: "",
            description: "",
            publishedDate: "",
            location: "",
            category: "",
            author: "",
        });
        setBannerImage(null);
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerPreview(null);
        setRemoveCurrentBanner(false);
        setErrors({});
        setTouched({});
    };

    /* ================= HANDLE EDIT FORM CHANGE ================= */

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });

        // Update character counts
        if (name === 'title') setTitleCount(value.length);
        if (name === 'description') setDescriptionCount(value.length);

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    /* ================= HANDLE BANNER CHANGE ================= */

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
        setRemoveCurrentBanner(true); // Mark that we're replacing the banner

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
        setRemoveCurrentBanner(true); // Mark that we want to remove the banner
        document.getElementById('edit-banner-upload').value = '';
    };

    const keepCurrentBanner = () => {
        setRemoveCurrentBanner(false);
        setBannerImage(null);
        setBannerPreview(null);
    };

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

    const validateEditForm = () => {
        let newErrors = {};

        // Validate all fields
        Object.keys(editForm).forEach(key => {
            const error = validateField(key, editForm[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const error = validateField(field, editForm[field]);
        setErrors({ ...errors, [field]: error });
    };

    /* ================= HANDLE EDIT SUBMIT ================= */

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(editForm).forEach(key => allTouched[key] = true);
        setTouched(allTouched);

        if (!validateEditForm()) {
            showNotification('error', 'Please fix all errors before submitting');
            return;
        }

        try {
            setActionLoading(true);
            const formData = new FormData();

            Object.keys(editForm).forEach((key) => {
                formData.append(key, editForm[key].trim());
            });

            // Add banner image if new one is selected
            if (bannerImage) {
                formData.append("bannerImage", bannerImage);
            }

            // Add flag to indicate if current banner should be removed
            formData.append("removeCurrentBanner", removeCurrentBanner.toString());

            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/news/update/${editNews._id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            showNotification('success', 'News updated successfully');

            // Clean up preview
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }

            closeEditModal();
            fetchNews();

        } catch (error) {
            console.error("Update Error:", error);
            showNotification('error', error.message || "Failed to update news");
        } finally {
            setActionLoading(false);
        }
    };

    /* ================= VIEW PREVIEW ================= */

    const openPreview = (item) => {
        setSelectedNews(item);
        setShowPreview(true);
    };

    const closePreview = () => {
        setSelectedNews(null);
        setShowPreview(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slideIn ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">News Management</h1>
                        <p className="text-gray-600 mt-2">Manage your news articles and publications</p>
                    </div>

                    <button
                        onClick={() => navigate('/addnews')}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        <FiFileText size={18} />
                        Add News
                    </button>
                </div>

                {/* News Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-md">
                        <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Banner</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Author</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {news.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <FiFileText size={48} className="text-gray-400 mb-4" />
                                                    <p className="text-gray-500 text-lg">No News Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        news.map((item) => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">

                                                {/* Banner */}
                                                <td className="px-6 py-4">
                                                    {item.bannerImage?.url ? (
                                                        <div className="w-16 h-16 overflow-hidden rounded-lg border border-gray-200">
                                                            <img
                                                                src={item.bannerImage.url}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                            <FiImage className="text-gray-400" size={20} />
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Title */}
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {item.title}
                                                </td>

                                                {/* Location */}
                                                <td className="px-6 py-4">{item.location}</td>

                                                {/* Category */}
                                                <td className="px-6 py-4">{item.category || "—"}</td>

                                                {/* Author */}
                                                <td className="px-6 py-4">{item.author || "—"}</td>

                                                {/* Date */}
                                                <td className="px-6 py-4">
                                                    {new Date(item.publishedDate).toLocaleDateString()}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editNews && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-8 py-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiEdit2 className="text-blue-600" />
                                Edit News Article
                            </h2>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
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
                                        value={editForm.title}
                                        onChange={handleEditChange}
                                        onBlur={() => handleBlur('title')}
                                        className={`w-full pl-10 pr-16 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${touched.title && errors.title
                                            ? 'border-red-300 bg-red-50'
                                            : touched.title && !errors.title
                                                ? 'border-green-300 bg-green-50'
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
                                        rows={5}
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        onBlur={() => handleBlur('description')}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none ${touched.description && errors.description
                                            ? 'border-red-300 bg-red-50'
                                            : touched.description && !errors.description
                                                ? 'border-green-300 bg-green-50'
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
                                    </label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            name="publishedDate"
                                            value={editForm.publishedDate}
                                            onChange={handleEditChange}
                                            onBlur={() => handleBlur('publishedDate')}
                                            max={today}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${touched.publishedDate && errors.publishedDate
                                                ? 'border-red-300 bg-red-50'
                                                : touched.publishedDate && !errors.publishedDate
                                                    ? 'border-green-300 bg-green-50'
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
                                            value={editForm.location}
                                            onChange={handleEditChange}
                                            onBlur={() => handleBlur('location')}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${touched.location && errors.location
                                                ? 'border-red-300 bg-red-50'
                                                : touched.location && !errors.location
                                                    ? 'border-green-300 bg-green-50'
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
                                            value={editForm.category}
                                            onChange={handleEditChange}
                                            onBlur={() => handleBlur('category')}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all hover:border-blue-300"
                                            placeholder="Enter category"
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
                                            value={editForm.author}
                                            onChange={handleEditChange}
                                            onBlur={() => handleBlur('author')}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all hover:border-blue-300"
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

                            {/* Banner Image Section with Remove Option */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Banner Image
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        (Optional - leave empty to keep current)
                                    </span>
                                </label>

                                {/* Current Banner with Remove Option */}
                                {editNews.bannerImage?.url && !bannerPreview && !removeCurrentBanner && (
                                    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Current Banner:</p>
                                                <div className="relative group">
                                                    <img
                                                        src={editNews.bannerImage.url}
                                                        alt="Current banner"
                                                        className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/128x80?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRemoveCurrentBanner(true)}
                                                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                                            >
                                                <FiTrash2 size={14} />
                                                Remove Banner
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Show message if banner is marked for removal */}
                                {removeCurrentBanner && !bannerPreview && (
                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FiAlertCircle className="text-yellow-600" size={18} />
                                            <span className="text-sm text-yellow-700">Current banner will be removed</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={keepCurrentBanner}
                                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                                        >
                                            Keep Banner
                                        </button>
                                    </div>
                                )}

                                {/* Upload New Banner */}
                                <div className="border-3 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 hover:bg-blue-100 transition-all">
                                    <input
                                        type="file"
                                        id="edit-banner-upload"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={handleBannerChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="edit-banner-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                            <FiImage size={28} className="text-blue-600" />
                                        </div>
                                        <p className="text-base font-medium text-gray-700 mb-1">
                                            Click to upload new banner
                                        </p>
                                        <p className="text-xs text-gray-500 text-center">
                                            Supported: JPG, PNG, WEBP (max 5MB)
                                        </p>
                                    </label>
                                </div>

                                {/* New Banner Preview */}
                                {bannerPreview && (
                                    <div className="relative group mt-4">
                                        <p className="text-xs text-gray-500 mb-2">New Banner Preview:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={bannerPreview}
                                                alt="New banner preview"
                                                className="w-32 h-20 object-cover rounded-lg border-2 border-blue-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeBanner}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                                title="Remove new banner"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {actionLoading ? (
                                        <>
                                            <FiLoader size={20} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle size={20} />
                                            Update News
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <FiX size={20} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedNews && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-8 py-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">News Preview</h2>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8">
                            {selectedNews.bannerImage?.url && (
                                <img
                                    src={selectedNews.bannerImage.url}
                                    alt={selectedNews.title}
                                    className="w-full h-64 object-cover rounded-xl mb-6"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/800x256?text=No+Image';
                                    }}
                                />
                            )}

                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedNews.title}</h1>

                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <FiCalendar className="mr-2" size={16} />
                                    {new Date(selectedNews.publishedDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="flex items-center">
                                    <FiMapPin className="mr-2" size={16} />
                                    {selectedNews.location}
                                </div>
                                {selectedNews.category && (
                                    <div className="flex items-center">
                                        <FiFolder className="mr-2" size={16} />
                                        {selectedNews.category}
                                    </div>
                                )}
                                {selectedNews.author && (
                                    <div className="flex items-center">
                                        <FiUser className="mr-2" size={16} />
                                        {selectedNews.author}
                                    </div>
                                )}
                            </div>

                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-line">{selectedNews.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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