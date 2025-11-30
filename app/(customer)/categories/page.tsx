"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion"; 
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Search, ArrowLeft, Loader2, LayoutGrid } from "lucide-react";
import { ShopService, Category } from "@/services/shopService";
import Image from "next/image";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await ShopService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            All Categories
            </h1>
        </div>
        
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Find a category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all shadow-sm"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
          <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
          </div>
      ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCategories.map((category) => {
              const Icon = category.icon; // Get icon component
              
              return (
                <Link href={`/categories/${category.slug}`} key={category.id}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-4 h-40 md:h-48 transition-colors hover:border-yellow-500/50 dark:hover:border-yellow-500/50 group relative overflow-hidden"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors relative overflow-hidden">
                       {category.image ? (
                           <Image 
                              src={category.image} 
                              alt={category.name} 
                              layout="fill" 
                              objectFit="cover" 
                              className="rounded-full"
                           />
                       ) : Icon ? (
                           <Icon size={32} className="text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors" />
                       ) : (
                           <LayoutGrid className="text-gray-400" size={24} />
                       )}
                    </div>
                    <div className="text-center z-10">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors block">
                          {category.name}
                        </span>
                        {category.itemCount !== undefined && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                              {category.itemCount} Items
                            </span>
                        )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
      )}

      {!isLoading && filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No categories found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}