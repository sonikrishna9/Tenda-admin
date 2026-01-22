import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Sidebar from "./Component/Sidebar"
import Dashboard from "./Component/Dashboard"
import ProductTable from "./Component/Products"
import UpdateProduct from "./Component/UpdateProduct"

export default function App() {
  return (
    <>
      <BrowserRouter>
        <div className="flex min-h-screen">
          <Sidebar />

          {/* 👇 RIGHT SIDE CONTENT */}
          <div className="flex-1 p-6 bg-gray-100">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductTable />} />
              <Route path="/products/update" element={<UpdateProduct />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}