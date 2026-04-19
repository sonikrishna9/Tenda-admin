import React, { useEffect, useRef, useState } from "react";
import ApiClient from "../middleware/ApiClient";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCopy,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiImage,
  FiInfo,
  FiMove,
  FiPlus,
  FiRefreshCw,
  FiSettings,
  FiSliders,
  FiTrash2,
  FiUploadCloud,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const createLocalImage = (file) => {
  const clientId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: `new:${clientId}`,
    clientId,
    kind: "new",
    file,
    preview: URL.createObjectURL(file),
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
  };
};

const createExistingImage = (image, index) => ({
  id: `existing:${image.public_id}`,
  kind: "existing",
  public_id: image.public_id,
  url: image.url,
  preview: image.url,
  name: image.public_id || `image-${index + 1}`,
  size: "Uploaded",
  order: image.order ?? index,
});

const sortImages = (images = []) =>
  [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const reorderItems = (items, fromIndex, toIndex) => {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
};

const revokeBlobPreviews = (images = []) => {
  images.forEach((image) => {
    if (image.kind === "new" && image.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(image.preview);
    }
  });
};

const initialEditState = {
  open: false,
  slug: "",
  images: [],
};

const Slidermanagement = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(initialEditState);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });
  const [newSlider, setNewSlider] = useState({ slug: "", images: [] });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const dragImageIdRef = useRef(null);
  const touchStartRef = useRef({});
  const newSliderImagesRef = useRef([]);
  const editModalImagesRef = useRef([]);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
  };

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await ApiClient("GET", "api/admin/slider/all");

      if (response.success) {
        const normalizedSliders = (response.data || []).map((slider) => ({
          ...slider,
          images: sortImages(slider.images || []),
        }));

        setSliders(normalizedSliders);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
      showSnackbar("Error fetching sliders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    newSliderImagesRef.current = newSlider.images;
  }, [newSlider.images]);

  useEffect(() => {
    editModalImagesRef.current = editModal.images;
  }, [editModal.images]);

  useEffect(() => {
    if (!snackbar.open) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [snackbar.open]);

  useEffect(() => {
    return () => {
      revokeBlobPreviews(newSliderImagesRef.current);
      revokeBlobPreviews(editModalImagesRef.current);
    };
  }, []);

  const validateSelectedFiles = (files) => {
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      showSnackbar("Only image files under 5MB were added", "warning");
    }

    return validFiles;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = validateSelectedFiles(files);

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    const preparedImages = validFiles.map(createLocalImage);

    setNewSlider((prev) => ({
      ...prev,
      images: [...prev.images, ...preparedImages],
    }));

    event.target.value = "";
  };

  const handleEditFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = validateSelectedFiles(files);

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    const preparedImages = validFiles.map(createLocalImage);

    setEditModal((prev) => ({
      ...prev,
      images: [...prev.images, ...preparedImages],
    }));

    event.target.value = "";
  };

  const removeNewImage = (imageId) => {
    setNewSlider((prev) => {
      const imageToRemove = prev.images.find((image) => image.id === imageId);
      revokeBlobPreviews(imageToRemove ? [imageToRemove] : []);

      return {
        ...prev,
        images: prev.images.filter((image) => image.id !== imageId),
      };
    });
  };

  const removeEditImage = (imageId) => {
    setEditModal((prev) => {
      const imageToRemove = prev.images.find((image) => image.id === imageId);
      revokeBlobPreviews(imageToRemove ? [imageToRemove] : []);

      return {
        ...prev,
        images: prev.images.filter((image) => image.id !== imageId),
      };
    });
  };

  const moveNewImage = (imageId, direction) => {
    setNewSlider((prev) => {
      const currentIndex = prev.images.findIndex((image) => image.id === imageId);
      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex >= prev.images.length) {
        return prev;
      }

      return {
        ...prev,
        images: reorderItems(prev.images, currentIndex, targetIndex),
      };
    });
  };

  const moveEditImage = (imageId, direction) => {
    setEditModal((prev) => {
      const currentIndex = prev.images.findIndex((image) => image.id === imageId);
      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex >= prev.images.length) {
        return prev;
      }

      return {
        ...prev,
        images: reorderItems(prev.images, currentIndex, targetIndex),
      };
    });
  };

  const reorderNewImages = (fromId, toId) => {
    setNewSlider((prev) => {
      const fromIndex = prev.images.findIndex((image) => image.id === fromId);
      const toIndex = prev.images.findIndex((image) => image.id === toId);

      return {
        ...prev,
        images: reorderItems(prev.images, fromIndex, toIndex),
      };
    });
  };

  const reorderEditImages = (fromId, toId) => {
    setEditModal((prev) => {
      const fromIndex = prev.images.findIndex((image) => image.id === fromId);
      const toIndex = prev.images.findIndex((image) => image.id === toId);

      return {
        ...prev,
        images: reorderItems(prev.images, fromIndex, toIndex),
      };
    });
  };

  const handleSwipeAction = (scope, imageId) => {
    const startX = touchStartRef.current[imageId];

    if (typeof startX !== "number") return;

    const endX = touchStartRef.current[`${imageId}-end`];
    if (typeof endX !== "number") {
      delete touchStartRef.current[imageId];
      return;
    }

    const deltaX = endX - startX;

    delete touchStartRef.current[imageId];
    delete touchStartRef.current[`${imageId}-end`];

    if (Math.abs(deltaX) < 60) return;

    if (scope === "new") {
      moveNewImage(imageId, deltaX < 0 ? 1 : -1);
      return;
    }

    moveEditImage(imageId, deltaX < 0 ? 1 : -1);
  };

  const resetNewSlider = () => {
    revokeBlobPreviews(newSlider.images);
    setNewSlider({ slug: "", images: [] });
  };

  const closeEditModal = () => {
    revokeBlobPreviews(editModal.images.filter((image) => image.kind === "new"));
    setEditModal(initialEditState);
  };

  const handleCreateSlider = async () => {
    if (!newSlider.slug.trim()) {
      showSnackbar("Please enter a slider slug/name", "error");
      return;
    }

    if (newSlider.images.length === 0) {
      showSnackbar("Please select at least one image", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("slug", newSlider.slug.trim());

      newSlider.images.forEach((image) => {
        formData.append("images", image.file);
      });

      const response = await ApiClient(
        "POST",
        `api/admin/slider/${newSlider.slug.trim()}`,
        formData
      );

      if (response.success) {
        showSnackbar("Slider created successfully");
        resetNewSlider();
        fetchSliders();
      }
    } catch (error) {
      console.error("Error creating slider:", error);
      showSnackbar(
        error.response?.data?.message || "Error creating slider",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlider = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(
        "imageOrder",
        JSON.stringify(editModal.images.map((image) => image.id))
      );

      editModal.images
        .filter((image) => image.kind === "new")
        .forEach((image) => {
          formData.append("newImageIds", image.clientId);
          formData.append("images", image.file);
        });

      const response = await ApiClient(
        "PUT",
        `api/admin/slider/${editModal.slug}`,
        formData
      );

      if (response.success) {
        showSnackbar("Slider updated successfully");
        closeEditModal();
        fetchSliders();
      }
    } catch (error) {
      console.error("Error updating slider:", error);
      showSnackbar(
        error.response?.data?.message || "Error updating slider",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSlider = async (slug) => {
    setUploading(true);

    try {
      const response = await ApiClient("DELETE", `api/admin/slider/${slug}`);

      if (response.success) {
        showSnackbar(`Slider "${slug}" deleted successfully`);
        setDeleteConfirm(null);
        fetchSliders();
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
      showSnackbar(
        error.response?.data?.message || "Error deleting slider",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (slug) => {
    const slider = sliders.find((item) => item.slug === slug);

    if (!slider) return;

    const images = sortImages(slider.images || []).map(createExistingImage);

    setEditModal({
      open: true,
      slug,
      images,
    });
  };

  const openPreviewModal = (images, index = 0) => {
    setPreviewModal({
      open: true,
      images,
      currentIndex: index,
    });
  };

  const navigatePreview = (direction) => {
    setPreviewModal((prev) => ({
      ...prev,
      currentIndex:
        direction === "next"
          ? (prev.currentIndex + 1) % prev.images.length
          : (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar("Copied to clipboard");
    } catch (error) {
      showSnackbar("Unable to copy right now", "error");
    }
  };

  const filteredSliders = sliders.filter((slider) => {
    if (activeTab === "all") return true;
    if (activeTab === "with-images") return slider.images.length > 0;
    if (activeTab === "empty") return slider.images.length === 0;
    return true;
  });

  const getApiEndpoint = (slug) => `/api/slider/${slug}`;

  const renderSortableCard = (image, index, total, scope) => {
    const onRemove = scope === "new" ? removeNewImage : removeEditImage;
    const onMove = scope === "new" ? moveNewImage : moveEditImage;
    const onDrop = scope === "new" ? reorderNewImages : reorderEditImages;

    return (
      <div
        key={image.id}
        draggable
        onDragStart={() => {
          dragImageIdRef.current = image.id;
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => {
          if (dragImageIdRef.current && dragImageIdRef.current !== image.id) {
            onDrop(dragImageIdRef.current, image.id);
          }
          dragImageIdRef.current = null;
        }}
        onDragEnd={() => {
          dragImageIdRef.current = null;
        }}
        onTouchStart={(event) => {
          touchStartRef.current[image.id] = event.changedTouches[0].clientX;
        }}
        onTouchMove={(event) => {
          touchStartRef.current[`${image.id}-end`] =
            event.changedTouches[0].clientX;
        }}
        onTouchEnd={() => handleSwipeAction(scope, image.id)}
        className="group rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
            <FiMove size={12} />
            Position {index + 1}
          </span>
          <button
            onClick={() => onRemove(image.id)}
            className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
            title="Remove image"
          >
            <FiTrash2 size={14} />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={image.preview}
            alt={image.name}
            className="h-36 w-full object-cover"
          />
        </div>

        <div className="mt-3">
          <p className="truncate text-sm font-medium text-gray-800">{image.name}</p>
          <p className="text-xs text-gray-500">{image.size}</p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onMove(image.id, -1)}
            disabled={index === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiArrowLeft size={14} />
            Earlier
          </button>
          <button
            onClick={() => onMove(image.id, 1)}
            disabled={index === total - 1}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Later
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 md:p-6">
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Slider Management
            </h1>
            <p className="mt-2 text-gray-600">
              Edit sliders, remove previous photos, and drag or swipe images to set display order.
            </p>
          </div>

          <button
            onClick={fetchSliders}
            className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-2.5 font-medium text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3">
                <FiSliders className="text-xl text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700">
                  {sliders.length}
                </div>
                <div className="text-sm text-gray-600">Total Sliders</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3">
                <FiImage className="text-xl text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700">
                  {sliders.reduce((total, slider) => total + slider.images.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3">
                <FiSettings className="text-xl text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">
                  {sliders.filter((slider) => slider.images.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Active Sliders</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-100 p-3">
                <FiAlertCircle className="text-xl text-rose-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-rose-700">
                  {sliders.filter((slider) => slider.images.length === 0).length}
                </div>
                <div className="text-sm text-gray-600">Empty Sliders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <FiPlus className="text-orange-600" />
              Create New Slider
            </h2>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Slider Slug *
              </label>
              <input
                type="text"
                value={newSlider.slug}
                onChange={(event) =>
                  setNewSlider((prev) => ({ ...prev, slug: event.target.value }))
                }
                placeholder="e.g. home-banner"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                API path:{" "}
                <code className="rounded bg-orange-50 px-2 py-1 text-orange-700">
                  /api/slider/{"{slug}"}
                </code>
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Upload Images *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  newSlider.images.length
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50"
                }`}
              >
                <FiUploadCloud className="mx-auto mb-4 text-4xl text-orange-500" />
                <p className="font-medium text-gray-800">
                  {newSlider.images.length
                    ? `${newSlider.images.length} image(s) selected`
                    : "Click to upload images"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  PNG, JPG, WebP up to 5MB each
                </p>
              </div>
            </div>

            {newSlider.images.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Selected Images</h3>
                  <button
                    onClick={resetNewSlider}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>

                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                  <FiInfo className="mt-0.5 shrink-0" />
                  Drag cards on desktop, or swipe left/right on mobile to adjust order before upload.
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {newSlider.images.map((image, index) =>
                    renderSortableCard(image, index, newSlider.images.length, "new")
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleCreateSlider}
              disabled={!newSlider.slug.trim() || !newSlider.images.length || uploading}
              className={`w-full rounded-2xl py-3 font-semibold transition ${
                !newSlider.slug.trim() || !newSlider.images.length || uploading
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-200 hover:from-orange-700 hover:to-amber-600"
              }`}
            >
              {uploading ? "Saving..." : "Create Slider"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-6 flex flex-wrap gap-2">
            {["all", "with-images", "empty"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                    : "border border-orange-100 bg-white text-gray-700 hover:bg-orange-50"
                }`}
              >
                {tab === "all" && "All Sliders"}
                {tab === "with-images" && "With Images"}
                {tab === "empty" && "Empty"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : filteredSliders.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
              <FiSliders className="mx-auto mb-4 text-5xl text-orange-300" />
              <h3 className="text-xl font-semibold text-gray-800">No sliders found</h3>
              <p className="mt-2 text-gray-500">
                Create your first slider to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredSliders.map((slider) => (
                <div
                  key={slider.slug}
                  className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-lg hover:shadow-orange-100/40"
                >
                  <div className="p-6">
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{slider.slug}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiImage />
                            {slider.images.length} images
                          </span>
                          <span className="flex items-center gap-1">
                            <FiSettings />
                            {slider.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openPreviewModal(slider.images)}
                          className="rounded-xl bg-orange-50 p-2.5 text-orange-600 transition hover:bg-orange-100"
                          title="Preview"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => openEditModal(slider.slug)}
                          className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition hover:bg-emerald-100"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(slider.slug)}
                          className="rounded-xl bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-600">API Endpoint</p>
                          <code className="mt-1 inline-block rounded-xl bg-white px-3 py-2 text-sm text-orange-700">
                            {getApiEndpoint(slider.slug)}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(getApiEndpoint(slider.slug))}
                          className="rounded-xl p-2 text-gray-500 transition hover:bg-white hover:text-gray-800"
                          title="Copy URL"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </div>

                    {slider.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {slider.images.slice(0, 4).map((image, index) => (
                          <div key={image.public_id || index} className="relative group">
                            <img
                              src={image.url}
                              alt={`${slider.slug}-${index + 1}`}
                              className="h-32 w-full rounded-2xl border border-gray-200 object-cover"
                            />
                            <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-xs font-semibold text-white">
                              {index + 1}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                              <button
                                onClick={() => openPreviewModal(slider.images, index)}
                                className="rounded-full bg-white p-2 shadow-lg"
                              >
                                <FiExternalLink className="text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                        <FiAlertCircle className="mx-auto mb-3 text-3xl text-gray-400" />
                        <p className="text-gray-600">No images uploaded yet</p>
                        <button
                          onClick={() => openEditModal(slider.slug)}
                          className="mt-3 font-medium text-orange-600 hover:text-orange-700"
                        >
                          Add images now
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

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="border-b border-orange-100 bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Edit Slider: {editModal.slug}</h2>
                  <p className="mt-1 text-sm text-orange-50">
                    Remove previous photos and drag or swipe to control which image appears first.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
                >
                  <FiXCircle className="text-xl" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                <FiInfo className="mt-0.5 shrink-0" />
                Desktop par image cards ko drag karo. Mobile par left/right swipe karo. Remove button se purani image bhi delete ho jayegi.
              </div>

              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Slider Images ({editModal.images.length})
                  </h3>
                  {!!editModal.images.length && (
                    <button
                      onClick={() => {
                        revokeBlobPreviews(
                          editModal.images.filter((image) => image.kind === "new")
                        );
                        setEditModal((prev) => ({ ...prev, images: [] }));
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove All
                    </button>
                  )}
                </div>

                {editModal.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {editModal.images.map((image, index) =>
                      renderSortableCard(
                        image,
                        index,
                        editModal.images.length,
                        "edit"
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                    <FiImage className="mx-auto mb-3 text-4xl text-gray-400" />
                    <p className="text-gray-600">No images left in this slider.</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add fresh images below if you want to keep this slider active.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Add More Images
                </h3>
                <input
                  ref={editFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="cursor-pointer rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50 p-8 text-center transition hover:bg-orange-100"
                >
                  <FiUploadCloud className="mx-auto mb-4 text-4xl text-orange-500" />
                  <p className="font-medium text-gray-800">Click to add more images</p>
                  <p className="mt-1 text-sm text-gray-500">
                    New images join the same order list and can be dragged anywhere.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-100 bg-orange-50/70 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeEditModal}
                  disabled={uploading}
                  className="rounded-2xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSlider}
                  disabled={uploading}
                  className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-700 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Saving..." : "Save Slider Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() =>
                setPreviewModal({ open: false, images: [], currentIndex: 0 })
              }
              className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-lg"
            >
              <FiXCircle className="text-xl text-gray-700" />
            </button>

            <div className="relative">
              {previewModal.images.length > 0 && (
                <>
                  <img
                    src={
                      previewModal.images[previewModal.currentIndex]?.url ||
                      previewModal.images[previewModal.currentIndex]?.preview
                    }
                    alt={`Preview ${previewModal.currentIndex + 1}`}
                    className="h-[70vh] w-full rounded-3xl object-contain"
                  />

                  {previewModal.images.length > 1 && (
                    <>
                      <button
                        onClick={() => navigatePreview("prev")}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
                      >
                        <FiChevronLeft className="text-xl text-gray-700" />
                      </button>
                      <button
                        onClick={() => navigatePreview("next")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
                      >
                        <FiChevronRight className="text-xl text-gray-700" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                    {previewModal.currentIndex + 1} / {previewModal.images.length}
                  </div>
                </>
              )}
            </div>

            {previewModal.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {previewModal.images.map((image, index) => (
                  <button
                    key={image.public_id || image.id || index}
                    onClick={() =>
                      setPreviewModal((prev) => ({ ...prev, currentIndex: index }))
                    }
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${
                      index === previewModal.currentIndex
                        ? "border-orange-400"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.url || image.preview}
                      alt={`thumb-${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <FiTrash2 className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Slider</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm}</strong>?
                All slider images will be removed.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-2xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSlider(deleteConfirm)}
                disabled={uploading}
                className="rounded-2xl bg-red-600 px-6 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {uploading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex max-w-sm items-center rounded-2xl border-l-4 p-4 shadow-lg ${
              snackbar.type === "success"
                ? "border-green-400 bg-green-50"
                : snackbar.type === "error"
                  ? "border-red-400 bg-red-50"
                  : "border-amber-400 bg-amber-50"
            }`}
          >
            {snackbar.type === "success" ? (
              <FiCheckCircle className="mr-3 text-xl text-green-500" />
            ) : snackbar.type === "error" ? (
              <FiXCircle className="mr-3 text-xl text-red-500" />
            ) : (
              <FiAlertCircle className="mr-3 text-xl text-amber-500" />
            )}

            <p
              className={`flex-1 font-medium ${
                snackbar.type === "success"
                  ? "text-green-800"
                  : snackbar.type === "error"
                    ? "text-red-800"
                    : "text-amber-800"
              }`}
            >
              {snackbar.message}
            </p>

            <button
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <FiXCircle />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slidermanagement;
