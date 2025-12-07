"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { ArrowRight, Heart, Star, Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { BannerCarousel } from "@/app/components/BannerCarousel";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { useCartStore } from "@/hooks/useCartStore";
import { ShopService, Category } from "@/services/shopService";
import coustomerService from "@/services/customerSerbice";
import type { ProductType } from "@/types";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const INITIAL_PRODUCT_COUNT = 4;
const LOAD_MORE_COUNT = 4;

export default function HomePage() {
  const [visibleProductCount, setVisibleProductCount] = useState(
    INITIAL_PRODUCT_COUNT
  );
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { isLoading: isCartLoading } = useCartStore();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real Data State
  const [categories, setCategories] = useState<Category[]>([]);
  // const [products, setProducts] = useState<ShopProduct[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  // const [searchSuggestions, setSearchSuggestions] = useState<ShopProduct[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<ProductType[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Infinite Scroll Ref
  const observerTarget = useRef(null);

  useEffect(() => {
    setIsClient(true);

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catsData, prodsData] = await Promise.all([
          ShopService.getCategories(),
          // ShopService.getAllProducts(),
          await coustomerService.getProducts(),
        ]);

        setCategories(catsData);
        console.log("Fetched Products:", prodsData);
        setProducts(prodsData.products);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchSuggestions([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const matches = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
    setSearchSuggestions(matches.slice(0, 5));
  }, [searchQuery, products]);

  const visibleProducts = useMemo(() => {
    return products?.slice(0, visibleProductCount);
  }, [products, visibleProductCount]);

  const hasMoreProducts = visibleProductCount < products?.length;

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setVisibleProductCount((prev) => prev + LOAD_MORE_COUNT);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the target is visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMoreProducts, isLoading]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24">
      <motion.div
        className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Search Bar Section */}
        <motion.section variants={itemVariants} className="relative z-20">
          <div className="relative">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search your product..."
                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full py-3.5 pl-12 pr-4 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all shadow-sm"
              />
              {/* Added pointer-events-none to prevent icon from stealing focus */}
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yellow-500 transition-colors pointer-events-none"
                size={20}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isSearchFocused && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-60 overflow-y-auto z-50"
                >
                  {searchSuggestions.length > 0 ? (
                    <ul>
                      {searchSuggestions.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                              {product.images && product.images.length > 0 && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {product.category}
                              </p>
                            </div>
                            <div className="text-sm font-bold text-yellow-600 dark:text-yellow-500">
                              ₹{product.prices[0].price}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found for {searchQuery}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Banners Carousel */}
        <motion.div variants={itemVariants}>
          <BannerCarousel />
        </motion.div>

        {/* Categories Carousel */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Categories
            </h2>
            <Link
              href="/categories"
              className="flex items-center text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 transition-colors"
            >
              <span className="text-sm font-semibold">See All</span>
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="relative">
            <motion.div
              key={isLoading ? "loading" : "loaded"}
              className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {isLoading
                ? // Loading Skeletons
                  [1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="flex flex-col items-center space-y-2 shrink-0"
                    >
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                      <div className="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </motion.div>
                  ))
                : categories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <Link
                        href={`/categories/${category.slug}`}
                        key={category.id}
                      >
                        <motion.div
                          className="flex flex-col items-center space-y-2 text-center group cursor-pointer shrink-0"
                          variants={itemVariants}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:border-yellow-500 dark:group-hover:border-yellow-500 transition-colors duration-200 overflow-hidden relative">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                layout="fill"
                                objectFit="cover"
                              />
                            ) : Icon ? (
                              <Icon
                                size={32}
                                className="text-gray-400 dark:text-gray-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
                              />
                            ) : (
                              <div className="text-2xl font-bold text-gray-400">
                                {category.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate">
                            {category.name}
                          </span>
                        </motion.div>
                      </Link>
                    );
                  })}
            </motion.div>
          </div>
        </motion.section>

        {/* Products Section */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              All Products
            </h2>
          </div>

          <motion.div
            key={isLoading ? "products-loading" : "products-loaded"}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Suspense
              fallback={
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="bg-white dark:bg-gray-800 rounded-2xl h-64 animate-pulse border border-gray-100 dark:border-gray-700"
                    />
                  ))}
                </>
              }
            >
              {visibleProducts.map((item) => {
                const liked = isClient
                  ? isWishlisted(item.id.toString())
                  : false;
                return (
                  <ProductCard
                    key={item.id}
                    product={item}
                    liked={liked}
                    toggleWishlist={toggleWishlist}
                    isCartLoading={isCartLoading}
                  />
                );
              })}
            </Suspense>
          </motion.div>
        </motion.section>

        {/* Scroll Observer Sentinel (Invisible Element) */}
        {hasMoreProducts && !isLoading && (
          <div
            ref={observerTarget}
            className="h-10 w-full flex justify-center items-center"
          >
            {<Loader2 className="animate-spin text-gray-400" size={24} />}
          </div>
        )}
      </motion.div>
    </div>
  );
}

const ProductCard = ({
  product,
  liked,
  toggleWishlist,
  isCartLoading,
}: {
  product: ProductType;
  liked: boolean;
  toggleWishlist: (productId: string) => void;
  isCartLoading: boolean;
}) => {
  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group h-full flex flex-col"
        variants={itemVariants}
        layout
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700">
          {product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              height={400}
              width={400}
              alt={product.name}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id.toString());
            }}
            className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all shadow-sm z-10 ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={18} className={`${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-3 md:p-4 flex flex-col grow">
          <div className="flex items-center space-x-1 mb-1">
            <Star size={12} className="text-yellow-400 fill-current" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.rating || "4.0"}
            </span>
          </div>
          <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between">
            {/* Price Formatted */}
            <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
              ₹{product.prices[0].price}
            </p>
            <button
              disabled={isCartLoading}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-yellow-500 group-hover:text-white transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
