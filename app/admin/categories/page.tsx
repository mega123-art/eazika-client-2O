"use client";

import React, { useState, useEffect } from "react";
import { AdminService, ProductCategory } from "@/services/adminService";
import { Plus, Tag, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await AdminService.getAllCategories();
      setCategories(data);
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;

    setIsSubmitting(true);
    try {
      await AdminService.createCategory(newCat.name, newCat.description);
      toast.success("Category created!");
      setNewCat({ name: "", description: "" });
      fetchCategories(); 
    } catch (e) {
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Product Categories
      </h1>

      {/* Create Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">
          Add New Category
        </h3>
        <form
          onSubmit={handleCreate}
          className="flex flex-col md:flex-row gap-4 items-start"
        >
          <div className="flex-1 w-full">
            <input
              placeholder="Category Name (e.g., Dairy)"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 w-full">
            <input
              placeholder="Description (Optional)"
              value={newCat.description}
              onChange={(e) =>
                setNewCat({ ...newCat, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newCat.name}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-10 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center">
                <Tag size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {cat.name}
                </h4>
                {cat.description && (
                  <p className="text-xs text-gray-500">{cat.description}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
}
