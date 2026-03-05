"use client";

import React, { useState, useEffect } from "react";
import {
    FiUpload,
    FiX,
    FiCalendar,
    FiMapPin,
    FiFileText,
    FiImage,
    FiAlertCircle,
    FiCheckCircle,
    FiLoader,
    FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AddGallery() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        eventDate: "",
        location: "",
    });

    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState([]);
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
        setTitleCount(form.title.length);
    }, [form.title]);

    useEffect(() => {
        setDescriptionCount(form.description.length);
    }, [form.description]);

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            preview.forEach(url => URL.revokeObjectURL(url));
        };
    }, [preview]);

    /* ================= VALIDATION ================= */

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value.trim()) error = "Title is required";
                else if (value.trim().length < 3) error = "Title must be at least 3 characters";
                else if (value.trim().length > 100) error = "Title must be less than 100 characters";
                break;

            case "description":
                if (!value.trim()) error = "Description is required";
                else if (value.trim().length < 10) error = "Description must be at least 10 characters";
                else if (value.trim().length > 1000) error = "Description must be less than 1000 characters";
                break;

            case "eventDate":
                if (!value) error = "Event date is required";
                else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Check if selected date is in the future
                    if (selectedDate > today) {
                        error = "Event date cannot be in the future. Only past dates are allowed.";
                    }
                }
                break;

            case "location":
                if (!value.trim()) error = "Location is required";
                else if (value.trim().length < 3) error = "Location must be at least 3 characters";
                else if (value.trim().length > 200) error = "Location must be less than 200 characters";
                break;

            default:
                break;
        }

        return error;
    };

    const validate = () => {
        let newErrors = {};

        // Validate all fields
        Object.keys(form).forEach(key => {
            const error = validateField(key, form[key]);
            if (error) newErrors[key] = error;
        });

        // Validate images
        if (images.length === 0) {
            newErrors.images = "Upload at least one image";
        } else if (images.length > 7) {
            newErrors.images = "Maximum 7 images allowed";
        } else {
            // Check file sizes and types again
            const invalidFiles = images.filter(file => {
                const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
                return !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024;
            });

            if (invalidFiles.length > 0) {
                newErrors.images = "Some files are invalid (max 5MB, JPG/PNG/WEBP only)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const error = validateField(field, form[field]);
        setErrors({ ...errors, [field]: error });
    };

    /* ================= IMAGE HANDLER ================= */

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        let validFiles = [...images]; // Keep existing images
        let newErrors = { ...errors };

        files.forEach((file) => {
            // Check total count
            if (validFiles.length >= 7) {
                newErrors.images = "Maximum 7 images allowed";
                showNotification('error', 'Maximum 7 images allowed');
                return;
            }

            // Check file type
            if (!allowedTypes.includes(file.type)) {
                showNotification('error', `${file.name} is not allowed. Only JPG, PNG, WEBP allowed`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                showNotification('error', `${file.name} must be less than 5MB`);
                return;
            }

            // Check for duplicates (by name and size)
            const isDuplicate = validFiles.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );

            if (!isDuplicate) {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 7) {
            newErrors.images = "Maximum 7 images allowed";
        } else {
            delete newErrors.images;
        }

        setImages(validFiles);
        setErrors(newErrors);

        // Create previews
        const previews = validFiles.map((file) => URL.createObjectURL(file));
        
        // Cleanup old previews
        preview.forEach(url => URL.revokeObjectURL(url));
        
        setPreview(previews);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        const newPreview = [...preview];

        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(newPreview[index]);

        newImages.splice(index, 1);
        newPreview.splice(index, 1);

        setImages(newImages);
        setPreview(newPreview);

        // Update errors if needed
        if (newImages.length === 0) {
            setErrors({ ...errors, images: "Upload at least one image" });
        } else if (newImages.length <= 7) {
            const { images, ...rest } = errors;
            setErrors(rest);
        }
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(form).forEach(key => allTouched[key] = true);
        setTouched(allTouched);

        if (!validate()) {
            showNotification('error', 'Please fix all errors before submitting');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("title", form.title.trim());
            formData.append("description", form.description.trim());
            formData.append("eventDate", form.eventDate);
            formData.append("location", form.location.trim());

            images.forEach((img) => {
                formData.append("images", img);
            });

            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/gallery/create`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Upload failed");
            }

            showNotification('success', 'Gallery created successfully');

            // Reset form after successful submission
            setTimeout(() => {
                setForm({
                    title: "",
                    description: "",
                    eventDate: "",
                    location: "",
                });

                // Cleanup previews
                preview.forEach(url => URL.revokeObjectURL(url));
                
                setImages([]);
                setPreview([]);
                setErrors({});
                setTouched({});
                
                // Navigate back to gallery manager after 1 second
                setTimeout(() => navigate('/gallery'), 1000);
            }, 1500);

        } catch (error) {
            console.error(error);
            showNotification('error', error.message || "Failed to create gallery");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slideIn ${
                    notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {notification.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Create New Gallery</h1>
                    <button
                        onClick={() => navigate('/gallery')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        Back to Gallery
                    </button>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FiPlus className="text-white" />
                            Add New Gallery
                        </h2>
                        <p className="text-blue-100 mt-1">Fill in the details to create a new photo gallery</p>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    onBlur={() => handleBlur('title')}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                        touched.title && errors.title
                                            ? 'border-red-300 bg-red-50'
                                            : touched.title && !errors.title
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    placeholder="Enter gallery title"
                                    maxLength={100}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    {titleCount}/100
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
                                Description <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    onBlur={() => handleBlur('description')}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none ${
                                        touched.description && errors.description
                                            ? 'border-red-300 bg-red-50'
                                            : touched.description && !errors.description
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    placeholder="Enter gallery description"
                                    maxLength={1000}
                                />
                                <div className="absolute right-3 bottom-3 text-sm text-gray-400">
                                    {descriptionCount}/1000
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
                            {/* Event Date Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Event Date <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        (Past dates only)
                                    </span>
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={form.eventDate}
                                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                        onBlur={() => handleBlur('eventDate')}
                                        max={today}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.eventDate && errors.eventDate
                                                ? 'border-red-300 bg-red-50'
                                                : touched.eventDate && !errors.eventDate
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    />
                                </div>
                                {touched.eventDate && errors.eventDate && (
                                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                        <FiAlertCircle size={14} />
                                        {errors.eventDate}
                                    </p>
                                )}
                                {!errors.eventDate && form.eventDate && (
                                    <p className="text-green-500 text-sm flex items-center gap-1 mt-1">
                                        <FiCheckCircle size={14} />
                                        Valid past date
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
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        onBlur={() => handleBlur('location')}
                                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                            touched.location && errors.location
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

                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Gallery Images <span className="text-red-500">*</span>
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    (Max 7 images, 5MB each)
                                </span>
                            </label>

                            {/* Upload Area */}
                            <div className={`border-3 border-dashed rounded-2xl p-8 transition-all ${
                                images.length >= 7 
                                    ? 'border-gray-200 bg-gray-50' 
                                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                            }`}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleImages}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={images.length >= 7}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`cursor-pointer flex flex-col items-center ${
                                        images.length >= 7 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <FiUpload size={32} className="text-blue-600" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-700 mb-2">
                                        {images.length >= 7 ? 'Maximum images reached' : 'Click to upload images'}
                                    </p>
                                    <p className="text-sm text-gray-500 text-center">
                                        Drag and drop or click to select<br />
                                        Supported: JPG, PNG, WEBP (max 5MB each)
                                    </p>
                                </label>
                            </div>

                            {/* Image Count */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    {images.length} of 7 images selected
                                </p>
                                {errors.images && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <FiAlertCircle size={14} />
                                        {errors.images}
                                    </p>
                                )}
                            </div>

                            {/* Image Previews Grid */}
                            {preview.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Image Previews</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {preview.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                                                    title="Remove image"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                                        Creating Gallery...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={20} />
                                        Create Gallery
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/gallery')}
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