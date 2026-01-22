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
  FiExternalLink
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
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await ApiClient("DELETE", `api/product/delete/${productId}`);
                if (response.success) {
                    alert("Product deleted successfully");
                    fetchAllProducts();
                }
            } catch (error) {
                console.error(error);
                alert("Failed to delete product");
            }
        }
    };

    const handleViewProductDetails = (product) => {
        // Show product details in a modal or navigate to product details page
        console.log("View product details:", product);
        // You can implement a modal here or navigate to a product details page
        // For now, let's show an alert with basic info
        alert(`Product: ${product.title}\nCategory: ${product.parentCategory}\nSub-Category: ${product.subCategory}\nStatus: ${product.status}`);
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
                // Show the category data in a modal or separate section
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
        // Create a modal to display category details
        const modalHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div class="flex justify-between items-center p-6 border-b">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">${categoryData.title}</h2>
                            <p class="text-gray-600">${categoryData.parentCategory} > ${categoryData.subCategory}</p>
                        </div>
                        <button onclick="document.getElementById('categoryModal').remove()" 
                                class="text-gray-400 hover:text-gray-600 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <div class="p-6 overflow-y-auto max-h-[70vh]">
                        <div class="mb-6">
                            <h3 class="font-semibold text-gray-700 mb-2">Description</h3>
                            <p class="text-gray-600">${categoryData.description}</p>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="font-semibold text-gray-700 mb-2">USP Points</h3>
                            <ul class="list-disc pl-5 text-gray-600 space-y-1">
                                ${categoryData.uspPoints.map(point => `<li>${point}</li>`).join('')}
                            </ul>
                        </div>
                        
                        ${categoryData.images.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="font-semibold text-gray-700 mb-3">Images</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                ${categoryData.images.map(img => `
                                    <img src="${img.url}" alt="Product" class="w-full h-32 object-cover rounded-lg border">
                                `).join('')}
                            </div>
                        </div>` : ''}
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-500">Status</p>
                                <p class="font-medium ${categoryData.status === 'active' ? 'text-green-600' : 'text-red-600'}">
                                    ${categoryData.status}
                                </p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-500">Last Updated</p>
                                <p class="font-medium">${new Date(categoryData.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-6 border-t bg-gray-50">
                        <div class="flex justify-end gap-3">
                            <button onclick="document.getElementById('categoryModal').remove()" 
                                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                                Close
                            </button>
                            <button onclick="window.location.href='/products/update?productId=${categoryData._id}'" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Edit Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('categoryModal');
        if (existingModal) existingModal.remove();
        
        // Create and append new modal
        const modalDiv = document.createElement('div');
        modalDiv.id = 'categoryModal';
        modalDiv.innerHTML = modalHtml;
        document.body.appendChild(modalDiv);
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
                                onClick={() => navigate("/products/create")}
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
                                                                        {product.uspPoints?.[0] || "No USP"}
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
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Product Details"
                                                            >
                                                                <FiEye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdate(product)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                title="Edit Product"
                                                            >
                                                                <FiEdit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete Product"
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
                                                        className={`w-10 h-10 rounded-lg border ${
                                                            currentPage === pageNum
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