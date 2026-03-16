import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./Component/Sidebar";
import Dashboard from "./Component/Dashboard";
import ProductTable from "./Component/Products";
import UpdateProduct from "./Component/UpdateProduct";
import AddProduct from "./Component/AddProducts";
import ParentCategoryui from "./Component/ParentCategoryui";
import Blogmanage from "./Component/Blogs/Blogmanage";
import Slidermanagement from "./Component/Slidermanagement";
import SubcategoryBanner from "./Component/SubcategoryBanner";
import SubcategoryBannerTable from "./Component/SubcategoryBannerTable";
import ParentCategoryBanner from "./Component/ParentCategoryBanner";
import ParentCategoryBannerTable from "./Component/ParentCategoryBannerTable";
import AddGallery from "./Component/Gallery/AddGallery";
import GalleryManager from "./Component/Gallery/GalleryManager";
import AddNewsForm from "./Component/News/AddNewsForm";
import NewsTable from "./Component/News/NewsTable";
import CompanyManager from "./Component/CompanyManager";
import ResetPassword from "./Component/ResetPassword";
import AdminLogin from "./Component/AdminLogin";
import { Toaster } from "react-hot-toast";


function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/parent-category" element={<ParentCategoryui />} />
          <Route path="/products" element={<ProductTable />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/update" element={<UpdateProduct />} />
          <Route path="/blogs" element={<Blogmanage />} />
          <Route path="/slider-management" element={<Slidermanagement />} />
          <Route path="/subcategorybanner" element={<SubcategoryBanner />} />
          <Route path="/subcategorybannertable" element={<SubcategoryBannerTable />} />
          <Route path="/parentcategorybanner" element={<ParentCategoryBanner />} />
          <Route path="/parentcategorybannertable" element={<ParentCategoryBannerTable />} />
          <Route path="/galleryadd" element={<AddGallery />} />
          <Route path="/gallery" element={<GalleryManager />} />
          <Route path="/addnews" element={<AddNewsForm />} />
          <Route path="/newstable" element={<NewsTable />} />
          <Route path="/company" element={<CompanyManager />} />
        </Routes>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>

      <Toaster position="top-right" />

      <Routes>

        {/* Login */}
        <Route path="/" element={<AdminLogin />} />

        {/* Admin Panel */}
        <Route path="/*" element={<AdminLayout />} />

      </Routes>

    </BrowserRouter>
  );
}
