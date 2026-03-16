import React, { useEffect, useState } from "react";
import ApiClient from "../middleware/ApiClient";
import { FiUpload, FiTrash2, FiEdit, FiX, FiLoader } from "react-icons/fi";

const CompanyManager = () => {

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        companyName: "",
        logo: null
    });

    const [preview, setPreview] = useState("");
    const [editingId, setEditingId] = useState(null);

    /* ---------------- FETCH COMPANIES ---------------- */

    const fetchCompanies = async () => {
        try {
            const res = await ApiClient("GET", "api/admin/company");
            if (res.success) {
                setCompanies(res.companies);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    /* ---------------- INPUT CHANGE ---------------- */

    const handleChange = (e) => {
        setForm({
            ...form,
            companyName: e.target.value
        });
    };

    const handleLogoChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setForm({
            ...form,
            logo: file
        });

        setPreview(URL.createObjectURL(file));
    };

    /* ---------------- CREATE / UPDATE COMPANY ---------------- */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.companyName) {
            alert("Company name required");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append("companyName", form.companyName);

        if (form.logo) {
            formData.append("logo", form.logo);
        }

        try {

            let res;

            if (editingId) {
                res = await ApiClient("PUT", `api/admin/company/update/${editingId}`, formData);
            } else {
                res = await ApiClient("POST", "api/admin/company/create", formData);
            }

            if (res.success) {

                alert(editingId ? "Company Updated" : "Company Created");

                resetForm();
                fetchCompanies();
            }

        } catch (err) {
            alert("Operation failed");
        }

        setLoading(false);
    };

    /* ---------------- DELETE COMPANY ---------------- */

    const deleteCompany = async (id) => {

        if (!window.confirm("Delete this company?")) return;

        try {

            const res = await ApiClient("DELETE", `api/admin/company/delete/${id}`);

            if (res.success) {
                fetchCompanies();
            }

        } catch (err) {
            alert("Delete failed");
        }
    };

    /* ---------------- EDIT COMPANY ---------------- */

    const editCompany = (company) => {

        setEditingId(company._id);

        setForm({
            companyName: company.companyName,
            logo: null
        });

        setPreview(company.logo?.url || "");
    };

    /* ---------------- RESET ---------------- */

    const resetForm = () => {

        setEditingId(null);

        setForm({
            companyName: "",
            logo: null
        });

        setPreview("");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">

            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">

                <h2 className="text-2xl font-bold mb-6">
                    Company Buy Link Management
                </h2>

                {/* ---------------- FORM ---------------- */}

                <form onSubmit={handleSubmit} className="space-y-4 mb-8">

                    <input
                        type="text"
                        placeholder="Company Name"
                        value={form.companyName}
                        onChange={handleChange}
                        className="w-full border px-4 py-3 rounded-lg"
                    />

                    {/* LOGO UPLOAD */}

                    <label className="flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-lg cursor-pointer">

                        {preview ? (
                            <img
                                src={preview}
                                alt="preview"
                                className="h-16 object-contain"
                            />
                        ) : (
                            <>
                                <FiUpload size={28} />
                                <span>Upload Logo</span>
                            </>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                        />

                    </label>

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                        >
                            {loading ? (
                                <FiLoader className="animate-spin" />
                            ) : editingId ? "Update Company" : "Add Company"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-200 px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

                {/* ---------------- COMPANY LIST ---------------- */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {companies.map((company) => (

                        <div
                            key={company._id}
                            className="flex items-center justify-between border rounded-lg p-4"
                        >

                            <div className="flex items-center gap-3">

                                <img
                                    src={company.logo?.url}
                                    alt={company.companyName}
                                    className="h-10 object-contain"
                                />

                                <span className="font-medium">
                                    {company.companyName}
                                </span>

                            </div>

                            <div className="flex gap-2">

                                <button
                                    onClick={() => editCompany(company)}
                                    className="text-blue-600"
                                >
                                    <FiEdit />
                                </button>

                                <button
                                    onClick={() => deleteCompany(company._id)}
                                    className="text-red-600"
                                >
                                    <FiTrash2 />
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default CompanyManager;