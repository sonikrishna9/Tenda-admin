import React, { useEffect, useMemo, useRef, useState } from "react";
import ApiClient from "../../middleware/ApiClient";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiGlobe,
  FiLoader,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const PRODUCTS_PAGE_VALUE = "__products__";
const SINGLE_PRODUCT_PAGE_VALUE = "__single_product__";

const STATIC_PAGE_OPTIONS = [
  { value: "home", label: "Home Page" },
  { value: "contactus", label: "Contact Us" },
  { value: "about", label: "About Page" },
  { value: "partner-program", label: "Partner Program" },
  { value: "si-partner", label: "SI Partner" },
  { value: "dealer", label: "Dealer/Distributor" },
  { value: "blogs", label: "Blogs Page" },
  { value: "news", label: "News Page" },
  { value: "gallery", label: "Gallery Page" },
  { value: "privacy-policy", label: "Privacy Policy" },
];

const createDefaultForm = () => ({
  pageType: "static",
  slug: "home",
  entityType: "parentCategory",
  parentCategory: "",
  subCategory: "",
  productTitle: "",
  metaTitle: "",
  metaDescription: "",
});

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getComputedSlug = (form) => {
  if (form.pageType === "singleProduct") {
    if (!form.parentCategory || !form.productTitle) {
      return "";
    }

    return `product/${slugify(form.parentCategory)}/${slugify(form.productTitle)}`;
  }

  if (form.pageType !== "product") {
    return form.slug;
  }

  if (!form.parentCategory) {
    return "";
  }

  if (form.entityType === "subCategory") {
    if (!form.subCategory) {
      return "";
    }

    return `products/${slugify(form.parentCategory)}/${slugify(form.subCategory)}`;
  }

  return `products/${slugify(form.parentCategory)}`;
};

const getEntryLabel = (item) => {
  const isSingleProduct =
    item.pageType === "singleProduct" || item.slug?.startsWith("product/");
  const isProduct =
    item.pageType === "product" || item.slug?.startsWith("products/");

  if (isSingleProduct) {
    if (item.parentCategory && item.productTitle) {
      return `Single Product Page / ${item.parentCategory} / ${item.productTitle}`;
    }
  }

  if (isProduct) {
    if ((item.entityType === "subCategory" || item.subCategory) && item.parentCategory) {
      return `Product Page / ${item.parentCategory} / ${item.subCategory}`;
    }

    if (item.parentCategory) {
      return `Product Page / ${item.parentCategory}`;
    }
  }

  return (
    STATIC_PAGE_OPTIONS.find((option) => option.value === item.slug)?.label ||
    item.pageLabel ||
    item.slug
  );
};

const SeoAdmin = () => {
  const [form, setForm] = useState(createDefaultForm);
  const [seoList, setSeoList] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const notificationTimerRef = useRef(null);

  const selectedParentCategory = useMemo(
    () =>
      parentCategories.find(
        (item) => item.categoryname === form.parentCategory
      ),
    [form.parentCategory, parentCategories]
  );

  const availableSubcategories = selectedParentCategory?.subcategories || [];
  const filteredProducts = useMemo(() => {
    const selectedParentProducts = products.filter(
      (item) => item.parentCategory === form.parentCategory
    );
    const term = productSearch.trim().toLowerCase();

    if (!term) {
      return selectedParentProducts;
    }

    return selectedParentProducts.filter((item) =>
      [item.title, item.subCategory, item.parentCategory]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [form.parentCategory, productSearch, products]);
  const computedSlug = getComputedSlug(form);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const resetForm = () => {
    setForm(createDefaultForm());
    setProductSearch("");
    setEditId(null);
    setIsFormVisible(false);
  };

  const fetchSEO = async () => {
    try {
      const res = await ApiClient("GET", "api/admin/meta/seo");
      setSeoList(res.data || []);
    } catch (error) {
      console.error(error);
      showNotification("error", "Failed to fetch SEO data");
    }
  };

  const fetchParentCategories = async () => {
    try {
      const res = await ApiClient("GET", "api/admin/parentcategory/getall");
      setParentCategories(res.parentcategory || []);
    } catch (error) {
      console.error(error);
      showNotification("error", "Failed to fetch product categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await ApiClient("GET", "api/admin/product/allproducts");
      setProducts(res.allproducts || []);
    } catch (error) {
      console.error(error);
      showNotification("error", "Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchSEO();
    fetchParentCategories();
    fetchProducts();

    return () => {
      window.clearTimeout(notificationTimerRef.current);
    };
  }, []);

  const handlePageChange = (value) => {
    if (value === PRODUCTS_PAGE_VALUE) {
      setForm((prev) => ({
        ...prev,
        pageType: "product",
        slug: "",
        entityType: "parentCategory",
        parentCategory: "",
        subCategory: "",
        productTitle: "",
      }));
      setProductSearch("");
      return;
    }

    if (value === SINGLE_PRODUCT_PAGE_VALUE) {
      setForm((prev) => ({
        ...prev,
        pageType: "singleProduct",
        slug: "",
        entityType: "productDetail",
        parentCategory: "",
        subCategory: "",
        productTitle: "",
      }));
      setProductSearch("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      pageType: "static",
      slug: value,
      entityType: "parentCategory",
      parentCategory: "",
      subCategory: "",
      productTitle: "",
    }));
    setProductSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        slug: computedSlug || form.slug,
      };

      if (editId) {
        await ApiClient("PUT", `api/admin/meta/seo/${editId}`, payload);
        showNotification("success", "SEO updated successfully");
      } else {
        await ApiClient("POST", "api/admin/meta/seo", payload);
        showNotification("success", "SEO created successfully");
      }

      resetForm();
      fetchSEO();
    } catch (error) {
      console.error(error);
      showNotification(
        "error",
        error?.response?.data?.message || "Operation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const isProduct = item.pageType === "product" || item.slug?.startsWith("products/");
    const isSingleProduct =
      item.pageType === "singleProduct" || item.slug?.startsWith("product/");

    setForm({
      pageType: isSingleProduct ? "singleProduct" : isProduct ? "product" : "static",
      slug: isProduct || isSingleProduct ? "" : item.slug,
      entityType:
        isSingleProduct
          ? "productDetail"
          : isProduct && (item.entityType === "subCategory" || item.subCategory)
            ? "subCategory"
            : "parentCategory",
      parentCategory: item.parentCategory || "",
      subCategory: item.subCategory || "",
      productTitle: item.productTitle || "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
    });
    setProductSearch(item.productTitle || "");
    setEditId(item._id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this SEO entry?")) {
      return;
    }

    try {
      await ApiClient("DELETE", `api/admin/meta/seo/${id}`);
      showNotification("success", "SEO deleted successfully");
      fetchSEO();
    } catch (error) {
      console.error(error);
      showNotification("error", "Failed to delete SEO");
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const filteredSeoList = seoList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const haystack = [
      item.slug,
      item.pageLabel,
      item.metaTitle,
      item.metaDescription,
      item.parentCategory,
      item.subCategory,
      item.productTitle,
      getEntryLabel(item),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.type === "success" ? (
            <FiCheckCircle size={20} />
          ) : (
            <FiAlertCircle size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            SEO Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage meta tags for better search engine visibility
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by page, slug, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
            />
          </div>

          {!isFormVisible && (
            <button
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              <FiPlus size={20} />
              Add New SEO
            </button>
          )}
        </div>

        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-300 border border-orange-100">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {editId ? "Edit SEO Entry" : "Create New SEO Entry"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-white hover:bg-white/10 rounded-lg p-1 transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page *
                </label>
                <select
                  value={
                    form.pageType === "product"
                      ? PRODUCTS_PAGE_VALUE
                      : form.pageType === "singleProduct"
                        ? SINGLE_PRODUCT_PAGE_VALUE
                        : form.slug
                  }
                  onChange={(e) => handlePageChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                  required
                >
                  {STATIC_PAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value={PRODUCTS_PAGE_VALUE}>Product Page</option>
                  <option value={SINGLE_PRODUCT_PAGE_VALUE}>Single Product Page</option>
                </select>
              </div>

              {form.pageType === "product" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO For *
                      </label>
                      <select
                        value={form.entityType}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            entityType: e.target.value,
                            subCategory: "",
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                        required
                      >
                        <option value="parentCategory">Parent Category</option>
                        <option value="subCategory">Subcategory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Category *
                      </label>
                      <select
                        value={form.parentCategory}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            parentCategory: e.target.value,
                            subCategory: "",
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                        required
                      >
                        <option value="">Select parent category</option>
                        {parentCategories.map((item) => (
                          <option key={item._id} value={item.categoryname}>
                            {item.categoryname}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {form.entityType === "subCategory" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory *
                      </label>
                      <select
                        value={form.subCategory}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            subCategory: e.target.value,
                          }))
                        }
                        disabled={!form.parentCategory}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        required
                      >
                        <option value="">Select subcategory</option>
                        {availableSubcategories.map((item, index) => (
                          <option
                            key={item._id || `${item.name}-${index}`}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {form.parentCategory && !availableSubcategories.length && (
                        <p className="text-xs text-red-500 mt-2">
                          No subcategories available inside this parent category.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                      Generated SEO slug
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      {computedSlug || "Select category options to generate slug"}
                    </p>
                  </div>
                </>
              )}

              {form.pageType === "singleProduct" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Category *
                      </label>
                      <select
                        value={form.parentCategory}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            parentCategory: e.target.value,
                            productTitle: "",
                          }));
                          setProductSearch("");
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                        required
                      >
                        <option value="">Select parent category</option>
                        {parentCategories.map((item) => (
                          <option key={item._id} value={item.categoryname}>
                            {item.categoryname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Product
                      </label>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search product by title..."
                        disabled={!form.parentCategory}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product *
                    </label>
                    <select
                      value={form.productTitle}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          productTitle: e.target.value,
                        }))
                      }
                      disabled={!form.parentCategory}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:text-gray-400"
                      required
                    >
                      <option value="">Select product</option>
                      {filteredProducts.map((item) => (
                        <option key={item._id} value={item.title}>
                          {item.title}{item.subCategory ? ` (${item.subCategory})` : ""}
                        </option>
                      ))}
                    </select>
                    {form.parentCategory && !filteredProducts.length && (
                      <p className="text-xs text-red-500 mt-2">
                        No products found for this parent category.
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                      Generated SEO slug
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      {computedSlug || "Select parent category and product to generate slug"}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter meta title (50-60 characters recommended)"
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description *
                </label>
                <textarea
                  placeholder="Enter meta description (150-160 characters recommended)"
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      {editId ? "Update SEO" : "Create SEO"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Page
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Meta Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Meta Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSeoList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <FiGlobe className="w-12 h-12 mx-auto mb-3 text-orange-300" />
                      <p>No SEO entries found</p>
                      <button
                        onClick={() => setIsFormVisible(true)}
                        className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Create your first SEO entry →
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSeoList.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-orange-50 transition duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <FiFileText size={16} className="text-orange-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getEntryLabel(item)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2">
                            {item.metaTitle}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-lg">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.metaDescription}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition duration-200"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete"
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

          {filteredSeoList.length > 0 && (
            <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
              <p className="text-sm text-gray-600">
                Showing {filteredSeoList.length} of {seoList.length} entries
              </p>
            </div>
          )}
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

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SeoAdmin;
