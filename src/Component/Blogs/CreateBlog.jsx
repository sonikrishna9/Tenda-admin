import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import { createBlog } from "./blogApi";
import { toast } from "react-hot-toast";

const MAX_WORDS = 3500;

const CreateBlog = () => {
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "draft",
    author: "",
  });

  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [gallery, setGallery] = useState([]);

  /* ---------- WORD COUNT ---------- */
  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    return text ? text.split(/\s+/).length : 0;
  }, [content]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (wordCount > MAX_WORDS) {
      return toast.error(`Blog content exceeds ${MAX_WORDS} words`);
    }

    if (!featuredImage) {
      return toast.error("Featured image is required");
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("slug", form.title); // backend auto-slugify
    data.append("excerpt", form.excerpt);
    data.append("content", content);
    data.append("category", form.category);
    data.append("tags", JSON.stringify(form.tags.split(",")));
    data.append("status", form.status);
    data.append("author", form.author);
    data.append("featurePictures", featuredImage);

    gallery.forEach((img) => {
      data.append("images", img);
    });

    try {
      await createBlog(data);
      toast.success("Blog created successfully");
    } catch (err) {
      toast.error("Failed to create blog");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Create Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Excerpt */}
        <textarea
          name="excerpt"
          placeholder="Short Excerpt"
          value={form.excerpt}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          rows={3}
          required
        />

        {/* HTML Editor */}
        <div>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your blog content here..."
          />
          <div
            className={`text-sm mt-2 ${
              wordCount > MAX_WORDS ? "text-red-600" : "text-gray-600"
            }`}
          >
            {wordCount} / {MAX_WORDS} words
          </div>
        </div>

        {/* Category */}
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Tags */}
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        {/* Author */}
        <input
          type="text"
          name="author"
          placeholder="Author Name"
          value={form.author}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Status */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        {/* Featured Image */}
        <div>
          <label className="block mb-2 font-medium">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFeaturedImage(e.target.files[0])}
            required
          />
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block mb-2 font-medium">Gallery Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGallery([...e.target.files])}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;
