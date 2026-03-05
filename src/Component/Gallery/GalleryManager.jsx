"use client";

import React, { useEffect, useState } from "react";
import {
    FiEdit2,
    FiTrash2,
    FiX,
    FiImage,
    FiCalendar,
    FiMapPin,
    FiFileText,
    FiLoader,
    FiAlertCircle,
    FiCheckCircle,
    FiUpload,
    FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function GalleryManager() {
    const navigate = useNavigate();
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [editGallery, setEditGallery] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        eventDate: "",
    });

    const [images, setImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

    // Track which existing images to keep/remove
    const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    /* ================= FETCH GALLERIES ================= */

    const fetchGalleries = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/gallery/get-all`
            );
            const data = await res.json();

            if (data.success) {
                setGalleries(data.data);
            }
        } catch (error) {
            console.error(error);
            showNotification('error', 'Failed to fetch galleries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, []);

    /* ================= DELETE ================= */

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this gallery? This action cannot be undone.")) return;

        try {
            setActionLoading(true);
            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/gallery/delete/${id}`,
                { method: "DELETE" }
            );

            const data = await res.json();

            if (data.success) {
                showNotification('success', 'Gallery deleted successfully');
                fetchGalleries();
            }
        } catch (error) {
            console.error(error);
            showNotification('error', 'Failed to delete gallery');
        } finally {
            setActionLoading(false);
        }
    };

    /* ================= OPEN EDIT ================= */

    const openEdit = (gallery) => {
        setEditGallery(gallery);
        setForm({
            title: gallery.title,
            description: gallery.description,
            location: gallery.location,
            eventDate: gallery.eventDate.split("T")[0],
        });
        setImages([]);
        setImagePreviewUrls([]);
        // Initialize with all existing images
        setExistingImagesToKeep(gallery.images || []);
    };

    /* ================= HANDLE IMAGE CHANGE ================= */

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Check total images (existing + new)
        const totalImages = existingImagesToKeep.length + files.length;
        if (totalImages > 7) {
            showNotification('error', `You can only have up to 7 images total. You currently have ${existingImagesToKeep.length} existing images.`);
            return;
        }

        setImages(files);

        // Create preview URLs
        const previewUrls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(previewUrls);
    };

    /* ================= REMOVE NEW IMAGE ================= */

    const removeNewImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

        setImages(newImages);
        setImagePreviewUrls(newPreviewUrls);
    };

    /* ================= REMOVE EXISTING IMAGE ================= */

    const removeExistingImage = (imageToRemove) => {
        const updatedImages = existingImagesToKeep.filter(
            img => img.public_id !== imageToRemove.public_id
        );
        setExistingImagesToKeep(updatedImages);
    };

    /* ================= UPDATE ================= */

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Check total images
        const totalImages = existingImagesToKeep.length + images.length;
        if (totalImages > 7) {
            showNotification('error', 'Maximum 7 images allowed');
            return;
        }

        try {
            setActionLoading(true);
            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("location", form.location);
            formData.append("eventDate", form.eventDate);

            // Send IDs of images to keep
            const originalImages = editGallery.images.map(img => img.public_id);
            const keptImages = existingImagesToKeep.map(img => img.public_id);

            const imagesToRemove = originalImages.filter(
                id => !keptImages.includes(id)
            );

            formData.append("removeImages", JSON.stringify(imagesToRemove));

            // Add new images
            images.forEach((img) => {
                formData.append("images", img);
            });

            const res = await fetch(
                `${import.meta.env.VITE_LOCAL_API}api/gallery/update/${editGallery._id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.success) {
                showNotification('success', 'Gallery updated successfully');
                setEditGallery(null);
                setImages([]);
                setImagePreviewUrls([]);
                setExistingImagesToKeep([]);
                fetchGalleries();
            }
        } catch (error) {
            console.error(error);
            showNotification('error', 'Failed to update gallery');
        } finally {
            setActionLoading(false);
        }
    };

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

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
                        <h1 className="text-3xl font-bold text-gray-800">Gallery Manager</h1>
                        <p className="text-gray-600 mt-2">Manage your photo galleries and memories</p>
                    </div>
                    
                    {/* Add New Gallery Button */}
                    <button
                        onClick={() => navigate('/galleryadd')}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        <FiPlus size={20} />
                        <span>Add New Gallery</span>
                    </button>
                </div>

                {/* Galleries Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleries.map((gallery) => (
                            <div
                                key={gallery._id}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Image Preview */}
                                <div className="relative h-48 bg-gray-100">
                                    {gallery.images && gallery.images.length > 0 ? (
                                        <>
                                            <img
                                                src={gallery.images[0].url}
                                                alt={gallery.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {gallery.images.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-lg text-sm">
                                                    +{gallery.images.length - 1} more
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiImage size={48} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{gallery.title}</h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {gallery.description || "No description"}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FiMapPin size={16} className="mr-2" />
                                            <span>{gallery.location || "No location"}</span>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FiCalendar size={16} className="mr-2" />
                                            <span>
                                                {gallery.eventDate
                                                    ? new Date(gallery.eventDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : "No date"}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FiFileText size={16} className="mr-2" />
                                            <span>{gallery.images?.length || 0} images</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(gallery)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                        >
                                            <FiEdit2 size={18} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gallery._id)}
                                            disabled={actionLoading}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiTrash2 size={18} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {galleries.length === 0 && !loading && (
                            <div className="col-span-full text-center py-12">
                                <div className="bg-white rounded-lg p-8">
                                    <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Galleries Found</h3>
                                    <p className="text-gray-500 mb-6">Create your first gallery to get started</p>
                                    <button
                                        onClick={() => navigate('/galleryadd')}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                                    >
                                        <FiPlus size={20} />
                                        <span>Add New Gallery</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Update Modal */}
                {editGallery && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Edit Gallery</h2>
                                <button
                                    onClick={() => {
                                        setEditGallery(null);
                                        setImages([]);
                                        setImagePreviewUrls([]);
                                        setExistingImagesToKeep([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Enter gallery title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Enter gallery description"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Enter location"
                                    />
                                </div>

                                {/* Event Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.eventDate}
                                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                </div>

                                {/* Existing Images with Remove Option */}
                                {existingImagesToKeep.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Existing Images ({existingImagesToKeep.length}/7)
                                            </label>
                                            <span className="text-xs text-gray-500">
                                                Click × to remove
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {existingImagesToKeep.map((img, index) => (
                                                <div key={img.public_id} className="relative group">
                                                    <img
                                                        src={img.url}
                                                        alt={`Existing ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(img)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        title="Remove image"
                                                    >
                                                        <FiX size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Images Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add More Images (Max {7 - existingImagesToKeep.length} remaining)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                            disabled={existingImagesToKeep.length >= 7}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`cursor-pointer flex flex-col items-center ${existingImagesToKeep.length >= 7 ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <FiUpload size={32} className="text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                {existingImagesToKeep.length >= 7
                                                    ? 'Maximum images reached'
                                                    : 'Click to upload images'}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, GIF up to 10MB
                                            </span>
                                        </label>
                                    </div>

                                    {/* New Image Previews */}
                                    {imagePreviewUrls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                New Images to Add ({images.length}/{7 - existingImagesToKeep.length})
                                            </p>
                                            <div className="grid grid-cols-4 gap-3">
                                                {imagePreviewUrls.map((url, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                            title="Remove image"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Image Count Summary */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Total images: {existingImagesToKeep.length + images.length}/7
                                    </p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <FiLoader size={18} className="animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Gallery'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditGallery(null);
                                            setImages([]);
                                            setImagePreviewUrls([]);
                                            setExistingImagesToKeep([]);
                                        }}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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