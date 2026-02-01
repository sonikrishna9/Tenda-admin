import React, { useEffect, useState } from "react";
import ApiClient from "../middleware/ApiClient";
import { useNavigate } from "react-router-dom";
import {
    FiEdit,
    FiTrash2,
    FiEye,
    FiPlus,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiFolder,
    FiBox,
    FiGrid,
    FiLayers,
    FiExternalLink,
    FiCheckCircle,
    FiXCircle,
    FiImage,
    FiTag,
    FiDollarSign,
    FiInfo,
    FiSettings,
    FiFileText,
    FiCalendar,
    FiClock,
    FiHash,
    FiCode,
    FiGlobe,
    FiStar,
    FiTrendingUp,
    FiShield,
    FiWifi,
    FiCpu,
    FiPackage,
    FiLayers as FiStack,
    FiLink,
    FiAnchor
} from "react-icons/fi";

export default function ProductTable() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [viewingCategory, setViewingCategory] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [viewingProductId, setViewingProductId] = useState(null);
    const [productDetailsModal, setProductDetailsModal] = useState(null);
    const navigate = useNavigate();

    // Extract unique categories from products
    const allCategories = [...new Set(products.map(p => p.parentCategory).filter(Boolean))];
    const allSubCategories = [...new Set(products.map(p => p.subCategory).filter(Boolean))];

    const getStatusBadge = (status) => {
        if (status === "active") {
            return "bg-green-100 text-green-700 border border-green-200";
        }
        return "bg-red-100 text-red-700 border border-red-200";
    };

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await ApiClient("GET", "api/product/allproducts");
            if (response.success || response.sucess) {
                setProducts(response?.allproducts || []);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (product) => {
        navigate("/products/update", {
            state: { product },
        });
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            setDeletingProductId(productId);
            const response = await ApiClient("DELETE", `api/product/delete/${productId}`);
            if (response.success) {
                alert("Product deleted successfully");
                fetchAllProducts();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to delete product");
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleViewProductDetails = async (product) => {
        try {
            setViewingProductId(product._id);

            // You can fetch more detailed product information here if needed
            // const response = await ApiClient("GET", `api/product/details/${product._id}`);

            // For now, using the existing product data
            showProductDetailsModal(product);

        } catch (error) {
            console.error("Error viewing product details:", error);
            alert("Failed to load product details");
        } finally {
            setViewingProductId(null);
        }
    };

    const showProductDetailsModal = (product) => {
        const formatDate = (dateString) => {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const modalHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div class="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden my-8">
                    <!-- Header -->
                    <div class="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h2 class="text-2xl font-bold text-gray-800">${product.title || "Untitled Product"}</h2>
                                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                        ${product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                                    </span>
                                </div>
                                <p class="text-gray-600">${product.subtitle || "No subtitle provided"}</p>
                            </div>
                            <button onclick="document.getElementById('productDetailsModal').remove()" 
                                    class="text-gray-400 hover:text-gray-600 text-2xl ml-4">
                                &times;
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- Left Column - Basic Info & Images -->
                            <div class="lg:col-span-2 space-y-6">
                                <!-- Product Images -->
                                <div class="bg-gray-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <FiImage class="text-blue-500" />
                                        Product Images (${product.images?.length || 0})
                                    </h3>
                                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        ${product.images && product.images.length > 0
                ? product.images.map((img, index) => `
                                                <div class="relative group">
                                                    <img src="${img.url}" alt="Product Image ${index + 1}" 
                                                        class="w-full h-auto max-h-48 object-contain bg-white rounded-lg border">                                                    <span class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                        Image ${index + 1}
                                                    </span>
                                                </div>
                                            `).join('')
                : '<div class="col-span-full text-center p-8 border-2 border-dashed border-gray-300 rounded-lg"><FiImage class="mx-auto text-gray-400 mb-2" size={32} /><p class="text-gray-500">No images available</p></div>'
            }
                                    </div>
                                </div>

                                <!-- Description -->
                                ${product.description ? `
                                <div class="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiFileText class="text-blue-500" />
                                        Product Description
                                    </h3>
                                    <div class="prose max-w-none">
                                        <p class="text-gray-700 whitespace-pre-line">${product.description}</p>
                                    </div>
                                </div>` : ''}

                                <!-- USP Points -->
                                ${product.uspPoints && product.uspPoints.length > 0 ? `
                                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiStar class="text-yellow-500" />
                                        Unique Selling Points (${product.uspPoints.length})
                                    </h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        ${product.uspPoints.map((point, index) => `
                                            <div class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition">
                                                <div class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                    <span class="text-sm font-semibold">${index + 1}</span>
                                                </div>
                                                <span class="text-gray-700">${point}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>` : ''}

                                <!-- Specifications -->
                                ${product.specifications && Object.keys(product.specifications).length > 0 ? `
                                <div class="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <FiSettings class="text-green-500" />
                                        Technical Specifications
                                    </h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        ${Object.entries(product.specifications).map(([key, value]) => `
                                            <div class="border-l-4 border-green-500 pl-4 py-2">
                                                <div class="text-sm text-gray-500 font-medium">${key.replace(/_/g, ' ').toUpperCase()}</div>
                                                <div class="text-gray-800 font-medium">${value || 'N/A'}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>` : ''}
                            </div>

                            <!-- Right Column - Details & Meta Info -->
                            <div class="space-y-6">
                                <!-- Quick Stats -->
                                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <FiTrendingUp class="text-purple-500" />
                                        Quick Stats
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <span class="text-gray-600">Total Images</span>
                                            <span class="font-semibold text-gray-800">${product.images?.length || 0}</span>
                                        </div>
                                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <span class="text-gray-600">USP Points</span>
                                            <span class="font-semibold text-gray-800">${product.uspPoints?.length || 0}</span>
                                        </div>
                                        <div class="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <span class="text-gray-600">Specifications</span>
                                            <span class="font-semibold text-gray-800">${product.specifications ? Object.keys(product.specifications).length : 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Categories -->
                                <div class="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <FiLayers class="text-orange-500" />
                                        Categories
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                            <FiFolder class="text-blue-500" />
                                            <div>
                                                <div class="text-sm text-gray-500">Parent Category</div>
                                                <div class="font-semibold text-gray-800">${product.parentCategory || "Uncategorized"}</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                            <FiStack class="text-purple-500" />
                                            <div>
                                                <div class="text-sm text-gray-500">Sub Category</div>
                                                <div class="font-semibold text-gray-800">${product.subCategory || "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Pricing & Stock -->
                                
                                <!-- Dates & Metadata -->
                                <div class="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <FiCalendar class="text-indigo-500" />
                                        Timeline
                                    </h3>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3 p-3">
                                            <FiClock class="text-gray-400" />
                                            <div>
                                                <div class="text-sm text-gray-500">Created</div>
                                                <div class="text-gray-700">${formatDate(product.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3 p-3">
                                            <FiCalendar class="text-gray-400" />
                                            <div>
                                                <div class="text-sm text-gray-500">Last Updated</div>
                                                <div class="text-gray-700">${formatDate(product.updatedAt)}</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3 p-3">
                                            <FiHash class="text-gray-400" />
                                            <div>
                                                <div class="text-sm text-gray-500">Product ID</div>
                                                <div class="font-mono text-xs text-gray-600 break-all">${product._id || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Features -->
                                ${product.features && product.features.length > 0 ? `
                                <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiCheckCircle class="text-yellow-500" />
                                        Key Features
                                    </h3>
                                    <div class="space-y-2">
                                        ${product.features.map(feature => `
                                            <div class="flex items-center gap-2">
                                                <FiCheckCircle class="text-green-500 flex-shrink-0" size={16} />
                                                <span class="text-gray-700">${feature}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>` : ''}

                                <!-- Network Features (if applicable) -->
                                ${product.networkFeatures && Object.keys(product.networkFeatures).length > 0 ? `
                                <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiWifi class="text-blue-500" />
                                        Network Features
                                    </h3>
                                    <div class="grid grid-cols-2 gap-3">
                                        ${Object.entries(product.networkFeatures).map(([key, value]) => `
                                            <div class="text-center p-2 bg-white rounded-lg">
                                                <div class="text-xs text-gray-500">${key}</div>
                                                <div class="font-semibold text-gray-800">${value}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- Additional Info -->
                        ${product.additionalInfo || (product.tags && product.tags.length > 0) ? `
                        <div class="mt-6 border-t pt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${product.additionalInfo ? `
                                <div class="bg-gray-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiInfo class="text-gray-500" />
                                        Additional Information
                                    </h3>
                                    <p class="text-gray-700">${product.additionalInfo}</p>
                                </div>` : ''}
                                
                                ${product.tags && product.tags.length > 0 ? `
                                <div class="bg-gray-50 rounded-xl p-5">
                                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiTag class="text-gray-500" />
                                        Tags
                                    </h3>
                                    <div class="flex flex-wrap gap-2">
                                        ${product.tags.map(tag => `
                                            <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                                                ${tag}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>` : ''}
                    </div>
                    
                    <!-- Footer Actions -->
                    <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-gray-500">
                                <div class="flex items-center gap-2">
                                    <FiPackage class="text-gray-400" />
                                    <span>Product Details • Last Updated: ${formatDate(product.updatedAt)}</span>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <button onclick="document.getElementById('productDetailsModal').remove()" 
                                        class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                                    Close
                                </button>
                                <button onclick="window.location.href='/products/update?productId=${product._id}'" 
                                        class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition flex items-center gap-2">
                                    <FiEdit />
                                    Edit Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('productDetailsModal');
        if (existingModal) existingModal.remove();

        // Create and append new modal
        const modalDiv = document.createElement('div');
        modalDiv.id = 'productDetailsModal';
        modalDiv.innerHTML = modalHtml;

        // Add scrolling behavior
        modalDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            z-index: 9999;
        `;

        document.body.appendChild(modalDiv);

        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';

        // Clean up on modal close
        modalDiv.querySelector('button[onclick*="remove()"]').addEventListener('click', () => {
            document.body.style.overflow = '';
        });
    };

    const handleViewCategory = async (parentCategory, subCategory) => {
        if (!parentCategory || !subCategory) {
            alert("Category information is incomplete");
            return;
        }

        try {
            setLoadingCategory(true);
            setViewingCategory(`${parentCategory}/${subCategory}`);

            const response = await ApiClient(
                "GET",
                `api/product/single-product/${encodeURIComponent(parentCategory)}/${encodeURIComponent(subCategory)}`
            );

            if (response.success) {
                setCategoryData(response.category);
                showCategoryModal(response.category);
            } else {
                alert("Failed to fetch category data");
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            alert("Error fetching category data");
        } finally {
            setLoadingCategory(false);
        }
    };

    const showCategoryModal = (categoryData) => {
        // ... (keep the existing showCategoryModal function as is)
        // Modal creation code remains the same
    };

    // Filter products based on search and filters
    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === "" ||
            product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.parentCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.subCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.title + " " + product.subtitle)?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || product.status === statusFilter;

        const matchesCategory = categoryFilter === "all" ||
            product.parentCategory === categoryFilter ||
            product.subCategory === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
                            <p className="text-gray-600 mt-2">Manage your router and networking products</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchAllProducts}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                            <button
                                onClick={() => navigate("/products/add")}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                            >
                                <FiPlus />
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FiBox className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Total Products</div>
                                <div className="text-2xl font-bold text-gray-800">{products.length}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FiGrid className="text-green-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Categories</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {allCategories.length}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FiLayers className="text-green-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Active Products</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {products.filter(p => p.status === "active").length}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FiEye className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Showing</div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {currentItems.length} of {filteredProducts.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading indicator for category fetch */}
                {loadingCategory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-700">Loading category data...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products by name, category, model..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                >
                                    <option value="all">All Categories</option>
                                    {allCategories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <FiFolder className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading products...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <tr className="text-left">
                                            <th className="p-4 text-gray-700 font-semibold min-w-[300px]">Product Details</th>
                                            <th className="p-4 text-gray-700 font-semibold">Parent Category</th>
                                            <th className="p-4 text-gray-700 font-semibold">Sub Category</th>
                                            <th className="p-4 text-gray-700 font-semibold">Status</th>
                                            <th className="p-4 text-gray-700 font-semibold">Updated</th>
                                            <th className="p-4 text-gray-700 font-semibold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center">
                                                    <div className="text-gray-400">
                                                        <div className="text-4xl mb-2">📦</div>
                                                        <p className="text-gray-500 font-medium">No products found</p>
                                                        <p className="text-gray-400 text-sm mt-1">
                                                            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                                                                ? "Try changing your search or filter"
                                                                : "Add your first product to get started"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((product) => (
                                                <tr
                                                    key={product._id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition duration-150"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                                <img
                                                                    src={product.images?.[0]?.url || "https://via.placeholder.com/56"}
                                                                    alt={product.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = "https://via.placeholder.com/56";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-semibold text-gray-800 truncate">
                                                                    {product.title}
                                                                </h3>
                                                                {product.subtitle && (
                                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                        {product.subtitle}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        ${product.price || "0.00"}
                                                                    </span>
                                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        Stock: {product.stock || 0}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FiFolder className="text-blue-500" />
                                                            <span className="font-medium text-gray-800 truncate max-w-[150px]" title={product.parentCategory}>
                                                                {product.parentCategory || "Uncategorized"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FiFolder className="text-purple-500" />
                                                            <span className="font-medium text-gray-700 truncate max-w-[150px]" title={product.subCategory}>
                                                                {product.subCategory || "N/A"}
                                                            </span>
                                                        </div>
                                                        {product.subCategory && product.parentCategory && (
                                                            <button
                                                                onClick={() => handleViewCategory(product.parentCategory, product.subCategory)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                                                                disabled={loadingCategory}
                                                            >
                                                                {loadingCategory && viewingCategory === `${product.parentCategory}/${product.subCategory}` ? (
                                                                    <>
                                                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                                        Loading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FiExternalLink size={12} />
                                                                        View Category Details
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(product.status)}`}>
                                                            {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(product.updatedAt || product.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => handleViewProductDetails(product)}
                                                                disabled={viewingProductId === product._id}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-wait relative group"
                                                                title="View Product Details"
                                                            >
                                                                {viewingProductId === product._id ? (
                                                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <>
                                                                        <FiEye size={18} />
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                                                                            View Details
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdate(product)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition group relative"
                                                                title="Edit Product"
                                                            >
                                                                <FiEdit size={18} />
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                                                                    Edit
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product._id)}
                                                                disabled={deletingProductId === product._id}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-wait relative group"
                                                                title="Delete Product"
                                                            >
                                                                {deletingProductId === product._id ? (
                                                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <>
                                                                        <FiTrash2 size={18} />
                                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                                                                            Delete
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredProducts.length > itemsPerPage && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                                            <span className="font-medium">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of{" "}
                                            <span className="font-medium">{filteredProducts.length}</span> products
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                <FiChevronLeft />
                                            </button>

                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-10 h-10 rounded-lg border ${currentPage === pageNum
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Category Summary */}
                <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiGrid className="text-blue-500" />
                        Category Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {allCategories.slice(0, 4).map(category => {
                            const categoryProducts = products.filter(p => p.parentCategory === category);
                            const subCategories = [...new Set(categoryProducts.map(p => p.subCategory).filter(Boolean))];

                            return (
                                <div key={category} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FiFolder className="text-blue-500" />
                                            <h4 className="font-medium text-gray-800 truncate" title={category}>
                                                {category}
                                            </h4>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                            {categoryProducts.length}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {subCategories.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {subCategories.slice(0, 3).map(subCat => (
                                                    <button
                                                        key={subCat}
                                                        onClick={() => handleViewCategory(category, subCat)}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs truncate max-w-full hover:bg-gray-200 transition"
                                                        title={`View ${subCat} details`}
                                                    >
                                                        {subCat}
                                                    </button>
                                                ))}
                                                {subCategories.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                                        +{subCategories.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No sub-categories</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}