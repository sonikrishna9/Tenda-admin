import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Sidebar from "./Component/Sidebar"
import Dashboard from "./Component/Dashboard"
import ProductTable from "./Component/Products"
import UpdateProduct from "./Component/UpdateProduct"
import CreateBlog from "./Component/Blogs/CreateBlog"
import Addblogs from "./Component/Addblogs"
import { Toaster } from "react-hot-toast";
import AddProduct from "./Component/AddProducts"
import ParentCategoryui from "./Component/ParentCategoryui"
import Blogmanage from "./Component/Blogs/Blogmanage"
import Slidermanagement from "./Component/Slidermanagement"
import SubcategoryBanner from "./Component/SubcategoryBanner"
import SubcategoryBannerTable from "./Component/SubcategoryBannerTable"
import ParentCategoryBanner from "./Component/ParentCategoryBanner"
import ParentCategoryBannerTable from "./Component/ParentCategoryBannerTable"


export default function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster position="top-right" />

        <div className="flex min-h-screen">
          <Sidebar />

          {/* 👇 RIGHT SIDE CONTENT */}
          <div className="flex-1 p-6 bg-gray-100">
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}