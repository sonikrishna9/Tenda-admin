import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../middleware/ApiClient";
import {
    FiUpload,
    FiX,
    FiVideo,
    FiFile,
    FiImage,
    FiEye,
    FiTrash2,
    FiLoader,
} from "react-icons/fi";

const AddProduct = () => {
    const navigate = useNavigate();

    /* ---------------- FORM STATE ---------------- */
    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        description: "",
        parentCategory: "",
        subCategory: "",
        status: "active",
        uspPoints: [],
        featured: false,
    });

    /* ---------------- MEDIA STATE ---------------- */




    const [images, setImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [videos, setVideos] = useState([]);
    const [newVideoPreviews, setNewVideoPreviews] = useState([]);

    const [quickstartPdfs, setQuickstartPdfs] = useState([]);
    const [downloadPdfs, setDownloadPdfs] = useState([]);

    const [featurePictures, setFeaturePictures] = useState([]);
    const [newFeaturePicturePreviews, setNewFeaturePicturePreviews] = useState([]);

    const [parameters, setParameters] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ---------------- FIXED EXTRA STATE ---------------- */
    const uploadProgress = { percent: 0 };
    const newQuickstartPdfs = quickstartPdfs;
    const newDownloadPdfs = downloadPdfs;


    /* ---------------- HELPERS ---------------- */
    const LoadingSpinner = ({ size = 18 }) => (
        <FiLoader className="animate-spin" size={size} />
    );

    const openInNewTab = (url) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleFeaturedChange = (e) => {
        setForm((p) => ({ ...p, featured: e.target.checked }));
    };

    /* ---------------- BASIC HANDLERS ---------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    /* ---------------- IMAGE ---------------- */
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((p) => [...p, ...files]);
        setNewImagePreviews((p) => [
            ...p,
            ...files.map((f) => ({
                id: Date.now() + Math.random(),
                preview: URL.createObjectURL(f),
            })),
        ]);
    };

    const removeNewImagePreview = (id) => {
        const index = newImagePreviews.findIndex((i) => i.id === id);
        if (index > -1) {
            setImages((p) => p.filter((_, i) => i !== index));
            setNewImagePreviews((p) => p.filter((i) => i.id !== id));
        }
    };

    /* ---------------- VIDEO ---------------- */
    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);
        setVideos((p) => [...p, ...files]);
        setNewVideoPreviews((p) => [
            ...p,
            ...files.map((f) => ({
                id: Date.now() + Math.random(),
                name: f.name,
                preview: URL.createObjectURL(f),
            })),
        ]);
    };

    const removeNewVideoPreview = (id) => {
        const index = newVideoPreviews.findIndex((v) => v.id === id);
        if (index > -1) {
            setVideos((p) => p.filter((_, i) => i !== index));
            setNewVideoPreviews((p) => p.filter((v) => v.id !== id));
        }
    };

    /* ---------------- FEATURE PICTURES ---------------- */
    const handleFeaturePictureChange = (e) => {
        const files = Array.from(e.target.files);

        setFeaturePictures((p) => [...p, ...files]); // ✅ ADD

        setNewFeaturePicturePreviews((p) => [
            ...p,
            ...files.map((f) => ({
                id: Date.now() + Math.random(),
                preview: URL.createObjectURL(f),
            })),
        ]);
    };


    const removeNewFeaturePicturePreview = (id) => {
        setNewFeaturePicturePreviews((p) => p.filter((i) => i.id !== id));
    };

    const removeFeaturePicture = (id) => {
        setFeaturePictures((p) => p.filter((i) => i.public_id !== id));
    };

    /* ---------------- PDF ---------------- */
    const handlePdfChange = (type, e) => {
        const files = Array.from(e.target.files);
        type === "quickstart"
            ? setQuickstartPdfs((p) => [...p, ...files])
            : setDownloadPdfs((p) => [...p, ...files]);
    };

    const removeQuickstartPdf = (i) =>
        setQuickstartPdfs((p) => p.filter((_, idx) => idx !== i));

    const removeDownloadPdf = (i) =>
        setDownloadPdfs((p) => p.filter((_, idx) => idx !== i));

    /* ---------------- PARAMETERS ---------------- */
    const addParameterBlock = () => {
        setParameters(p => [
            ...p,
            {
                id: Date.now() + Math.random(),
                title: "",
                open: true,
                items: [
                    {
                        id: Date.now() + Math.random(),
                        title: "",
                        subtitle: ""
                    }
                ]
            }
        ]);
    };


    const toggleParameter = (i) => {
        setParameters((p) =>
            p.map((x, idx) => (idx === i ? { ...x, open: !x.open } : x))
        );
    };

    const removeImage = (idOrIndex) => {
        // agar backend image (public_id) aaye
        if (typeof idOrIndex === "string") {
            setImages((p) => p.filter((i) => i.public_id !== idOrIndex));
            return;
        }

        // agar local uploaded image ho
        setImages((p) => p.filter((_, i) => i !== idOrIndex));
    };

    const removeVideo = (video) => {
        if (video?.public_id) {
            // backend video
            setVideos((p) => p.filter((v) => v.public_id !== video.public_id));
        } else {
            // local uploaded video
            setVideos((p) => p.filter((v) => v !== video));
        }
    };


    const deleteParameter = (i) =>
        setParameters((p) => p.filter((_, idx) => idx !== i));

    const updateParameterTitle = (i, v) => {
        const c = [...parameters];
        c[i].title = v;
        setParameters(c);
    };

    const addParameterItem = (i) => {
        const c = [...parameters];
        c[i].items.push({
            id: Date.now() + Math.random(),
            title: "",
            subtitle: ""
        });
        setParameters(c);
    };


    const deleteParameterItem = (p, i) => {
        const c = [...parameters];
        c[p].items = c[p].items.filter((_, idx) => idx !== i);
        setParameters(c);
    };

    const updateParameterItem = (p, i, f, v) => {
        const c = [...parameters];
        c[p].items[i][f] = v;
        setParameters(c);
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) =>
            fd.append(k, k === "uspPoints" ? JSON.stringify(v) : v)
        );

        fd.append("parameters", JSON.stringify(parameters));
        featurePictures.forEach((img) =>
            fd.append("featurePictures", img)
        );

        images.forEach((i) => fd.append("images", i));
        videos.forEach((v) => fd.append("videos", v));
        quickstartPdfs.forEach((p) => fd.append("quickstartpdfs", p));
        downloadPdfs.forEach((p) => fd.append("downloadpdfs", p));

        try {
            const res = await ApiClient("POST", "api/product/createproduct", fd);
            if (res.success) {
                alert("Product created successfully");
                navigate("/products");
            }
        } catch (err) {
            alert("Create failed");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI (UNCHANGED) ---------------- */
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Update Product</h2>
                        <p className="text-gray-600 mt-2">Edit your product details and media</p>
                    </div>
                    {loading && (
                        <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
                            <LoadingSpinner />
                            <span className="text-orange-600 font-medium">
                                {uploadProgress.percent ? `Uploading... ${uploadProgress.percent}%` : 'Processing...'}
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* BASIC INFO SECTION */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FiFile className="mr-2" /> Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Enter product title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subtitle
                                    </label>
                                    <input
                                        name="subtitle"
                                        value={form.subtitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Enter product subtitle"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 mt-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={form.featured}
                                        onChange={handleFeaturedChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor="featured"
                                        className="text-sm font-medium text-gray-700 cursor-pointer"
                                    >
                                        Mark as Featured Product
                                    </label>
                                </div>

                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parent Category
                                    </label>
                                    <input
                                        name="parentCategory"
                                        value={form.parentCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Parent category"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sub Category
                                    </label>
                                    <input
                                        name="subCategory"
                                        value={form.subCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Sub category"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        USP Points
                                    </label>
                                    <input
                                        value={form.uspPoints.join(", ")}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                uspPoints: e.target.value.split(",").map(item => item.trim()),
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder="Feature 1, Feature 2, Feature 3"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                rows="4"
                                placeholder="Enter detailed product description"
                                required
                            />
                        </div>
                    </div>

                    {/* IMAGES SECTION */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FiImage className="mr-2" /> Product Images
                        </h3>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">Existing Images</h4>
                            <div className="flex flex-wrap gap-4">
                                {images.map((img) => (
                                    <div key={img.public_id} className="relative group">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition">
                                            <img
                                                src={img.url}
                                                alt="Product"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* View Button for Images */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => openInNewTab(img.url)}
                                                    className="bg-white text-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-100 transition"
                                                >
                                                    <FiEye size={14} /> View
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(img.public_id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {images.length === 0 && (
                                <p className="text-gray-500 italic">No existing images</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">New Image Uploads</h4>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {newImagePreviews.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
                                            <img
                                                src={img.preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* View Button for New Images */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => openInNewTab(img.preview)}
                                                    className="bg-white text-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-100 transition"
                                                >
                                                    <FiEye size={14} /> View
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImagePreview(img.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    </div>

                    {/* PARAMETERS SECTION */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-100 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Product Parameters
                            </h3>
                            <button
                                type="button"
                                onClick={addParameterBlock}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                            >
                                + Add Parameter
                            </button>
                        </div>

                        {parameters.length === 0 && (
                            <p className="text-gray-500 italic">
                                No parameters added yet
                            </p>
                        )}

                        <div className="space-y-4">
                            {parameters.map((param, pIndex) => (
                                <div
                                   key={param.id}
                                    className="bg-white border border-gray-300 rounded-xl shadow-sm"
                                >
                                    {/* HEADER */}
                                    <div className="flex items-center justify-between p-4 cursor-pointer">
                                        <div
                                            className="flex-1 font-medium text-gray-800"
                                            onClick={() => toggleParameter(pIndex)}
                                        >
                                            {param.title || "Untitled Parameter"}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleParameter(pIndex)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                {param.open ? "Collapse" : "Expand"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteParameter(pIndex)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    {/* BODY */}
                                    {param.open && (
                                        <div className="border-t border-gray-200 p-4 space-y-4">
                                            {/* PARAMETER TITLE EDIT */}
                                            <input
                                                value={param.title}
                                                onChange={(e) =>
                                                    updateParameterTitle(pIndex, e.target.value)
                                                }
                                                placeholder="Parameter title (e.g. Specifications)"
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />

                                            {/* ITEMS */}
                                            <div className="space-y-3">
                                                {param.items.map((item, iIndex) => (
                                                    <div
                                                        key={iIndex}
                                                        className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                                                    >
                                                        <input
                                                            value={item.title}
                                                            onChange={(e) =>
                                                                updateParameterItem(
                                                                    pIndex,
                                                                    iIndex,
                                                                    "title",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Title"
                                                            className="md:col-span-2 px-3 py-2 border rounded-lg"
                                                        />
                                                        <input
                                                            value={item.subtitle}
                                                            onChange={(e) =>
                                                                updateParameterItem(
                                                                    pIndex,
                                                                    iIndex,
                                                                    "subtitle",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Subtitle"
                                                            className="md:col-span-2 px-3 py-2 border rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteParameterItem(pIndex, iIndex)
                                                            }
                                                            className="text-red-500 hover:text-red-700 flex justify-center"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addParameterItem(pIndex)}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                + Add Item
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FEATURE PICTURES SECTION */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FiImage className="mr-2" /> Feature Pictures (Max 10)
                        </h3>

                        {/* EXISTING FEATURE PICTURES */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">
                                Existing Feature Pictures
                            </h4>

                            <div className="flex flex-wrap gap-4">
                                {featurePictures.map((img) => (
                                    <div key={img.public_id} className="relative group">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition">
                                            <img
                                                src={img.url}
                                                alt="Feature"
                                                className="w-full h-full object-cover"
                                            />

                                            {/* VIEW BUTTON */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => openInNewTab(img.url)}
                                                    className="bg-white text-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-100 transition"
                                                >
                                                    <FiEye size={14} /> View
                                                </button>
                                            </div>
                                        </div>

                                        {/* REMOVE */}
                                        <button
                                            type="button"
                                            onClick={() => removeFeaturePicture(img.public_id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {featurePictures.length === 0 && (
                                <p className="text-gray-500 italic">
                                    No existing feature pictures
                                </p>
                            )}
                        </div>

                        {/* NEW FEATURE PICTURE PREVIEWS */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">
                                New Feature Picture Uploads
                            </h4>

                            <div className="flex flex-wrap gap-4 mb-4">
                                {newFeaturePicturePreviews.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
                                            <img
                                                src={img.preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />

                                            {/* VIEW */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => openInNewTab(img.preview)}
                                                    className="bg-white text-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-100 transition"
                                                >
                                                    <FiEye size={14} /> View
                                                </button>
                                            </div>
                                        </div>

                                        {/* REMOVE */}
                                        <button
                                            type="button"
                                            onClick={() => removeNewFeaturePicturePreview(img.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* UPLOAD INPUT */}
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, WEBP — Max 10 images
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFeaturePictureChange}
                                    className="hidden"
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    </div>


                    {/* VIDEO SECTION */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FiVideo className="mr-2" /> Product Videos (Max: 10)
                        </h3>

                        <div className="space-y-6">
                            {/* Existing Videos */}
                            {videos.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Existing Videos</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {videos.map((video, index) => (
                                            <div key={video.public_id || index} className="relative group">
                                                <div className="bg-black rounded-lg overflow-hidden">
                                                    <video
                                                        src={video.url}
                                                        controls
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                                <div className="absolute top-2 left-2 right-2 flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => openInNewTab(video.url)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-600 transition"
                                                    >
                                                        <FiEye size={14} /> View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVideo(video)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-red-600 transition"
                                                        disabled={loading}
                                                    >
                                                        <FiTrash2 size={14} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Video Previews */}
                            {newVideoPreviews.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">New Videos to Upload</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {newVideoPreviews.map((video, index) => (
                                            <div key={video.id} className="relative group">
                                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                                    <div className="w-full h-48 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <FiVideo className="w-12 h-12 mx-auto text-white mb-2" />
                                                            <p className="text-white text-sm truncate px-2">{video.name}</p>
                                                            <p className="text-green-400 text-xs mt-1">Ready to upload</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2 right-2 flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => openInNewTab(video.preview)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-600 transition"
                                                    >
                                                        <FiEye size={14} /> View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewVideoPreview(video.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-red-600 transition"
                                                        disabled={loading}
                                                    >
                                                        <FiTrash2 size={14} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Upload */}
                            <div>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload videos</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            MP4, MOV, AVI up to 100MB each. Max 10 videos total
                                        </p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            Currently: {videos.length} existing + {newVideoPreviews.length} new = {videos.length + newVideoPreviews.length} videos
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* PDF SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* QUICKSTART PDF */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quickstart Guides</h3>

                            <div className="space-y-4">
                                {/* Existing Quickstart PDFs */}
                                {quickstartPdfs.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-700">Existing PDFs</h4>
                                        {quickstartPdfs.map((pdf, index) => (
                                            <div key={pdf.name + pdf.size} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                        <FiFile className="text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-medium text-sm max-w-[220px] truncate break-all"
                                                            title={decodeURIComponent(pdf?.url?.split("/")?.pop() || "")}
                                                        >
                                                            {decodeURIComponent(
                                                                pdf?.url?.split("/")?.pop() || `Quickstart-${index + 1}.pdf`
                                                            )}
                                                        </p>

                                                        <div className="flex gap-3 mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openInNewTab(pdf)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                            >
                                                                <FiEye size={12} /> View PDF
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openInNewTab(pdf)}
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        title="View PDF"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuickstartPdf(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        disabled={loading}
                                                        title="Remove PDF"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Quickstart PDFs */}
                                {newQuickstartPdfs.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-700">New PDFs to Upload</h4>
                                        {newQuickstartPdfs.map((pdf, index) => (
                                            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <FiFile className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{pdf.name}</p>
                                                        <p className="text-xs text-green-600">Ready to upload</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(pdf);
                                                            openInNewTab(url);
                                                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        title="View PDF"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewQuickstartPdf(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        disabled={loading}
                                                        title="Remove PDF"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {quickstartPdfs.length === 0 && newQuickstartPdfs.length === 0 && (
                                    <p className="text-gray-500 italic">No quickstart PDFs</p>
                                )}


                                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
                                    <div className="flex flex-col items-center justify-center">
                                        <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold">Upload Quickstart PDFs</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Multiple PDFs allowed</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf"
                                        onChange={(e) => handlePdfChange('quickstart', e)}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* DOWNLOAD PDF */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Download PDFs</h3>

                            <div className="space-y-4">
                                {/* Existing Download PDFs */}
                                {downloadPdfs.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-700">Existing PDFs</h4>
                                        {downloadPdfs.map((pdf, index) => (
                                            <div key={index} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FiFile className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-medium text-sm max-w-[220px] truncate break-all"
                                                            title={decodeURIComponent(pdf?.url?.split("/")?.pop() || "")}
                                                        >
                                                            {decodeURIComponent(
                                                                pdf?.url?.split("/")?.pop() || `Download-${index + 1}.pdf`
                                                            )}
                                                        </p>
                                                        <div className="flex gap-3 mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openInNewTab(pdf)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                            >
                                                                <FiEye size={12} /> View PDF
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openInNewTab(pdf)}
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        title="View PDF"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDownloadPdf(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        disabled={loading}
                                                        title="Remove PDF"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Download PDFs */}
                                {newDownloadPdfs.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-700">New PDFs to Upload</h4>
                                        {newDownloadPdfs.map((pdf, index) => (
                                            <div key={pdf.name + pdf.size} className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <FiFile className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{pdf.name}</p>
                                                        <p className="text-xs text-green-600">Ready to upload</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(pdf);
                                                            openInNewTab(url);
                                                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        title="View PDF"
                                                    >
                                                        <FiEye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewDownloadPdf(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        disabled={loading}
                                                        title="Remove PDF"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {downloadPdfs.length === 0 && newDownloadPdfs.length === 0 && (
                                    <p className="text-gray-500 italic">No download PDFs</p>
                                )}

                                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
                                    <div className="flex flex-col items-center justify-center">
                                        <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-500">
                                            <span className="font-semibold">Upload Download PDFs</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Multiple PDFs allowed</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf"
                                        onChange={(e) => handlePdfChange('download', e)}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate("/products")}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size={20} />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Update Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
