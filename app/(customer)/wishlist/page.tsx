"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import Image from "next/image";
import { ArrowLeft, Heart, Star, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import { useCartStore } from "@/hooks/useCartStore"; 
import { ShopService, ShopProduct } from "@/services/shopService";

export default function WishlistPage() {
  const router = useRouter(); 
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore(); 
  
  const [wishlistProducts, setWishlistProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch products when wishlistIds change
  useEffect(() => {
    if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setIsLoading(false);
        return;
    }

    const fetchWishlistItems = async () => {
        setIsLoading(true);
        try {
            // 1. Create a Set of input IDs to remove exact string duplicates
            const uniqueInputIds = Array.from(new Set(wishlistIds));

            // 2. Fetch all products in parallel
            const promises = uniqueInputIds.map(id => 
                ShopService.getProductById(Number(id.toString().replace(/\D/g, ''))) 
                    .catch(() => null) 
            );
            
            const results = await Promise.all(promises);
            
            // 3. Filter nulls, placeholders, AND Deduplicate
            // Filter out products that failed to load or are placeholders ("Product Not Found")
            const validProducts = results.filter((p): p is ShopProduct => {
                return p !== null && p.name !== "Product Not Found";
            });

            const uniqueProductsMap = new Map();
            validProducts.forEach(p => uniqueProductsMap.set(p.id, p));
            
            setWishlistProducts(Array.from(uniqueProductsMap.values()));
            
        } catch (error) {
            console.error("Failed to load wishlist products", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isClient) {
        fetchWishlistItems();
    }
  }, [wishlistIds, isClient]);

  // Handler to add item to cart
  const handleAddToCart = async (product: ShopProduct) => {
    // Use safe fallback for price ID
    const priceId = product.prices && product.prices.length > 0 ? product.prices[0].id : 1;

    await addToCart({
        shopProductId: product.id,
        productPriceId: priceId || 1,
        quantity: 1
    });
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                </p>
            </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-yellow-500" size={32} />
         </div>
      ) : wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode='popLayout'>
            {wishlistProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col group relative"
              >
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id.toString());
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove from wishlist"
                >
                    <Trash2 size={18} />
                </button>

                <Link href={`/products/${product.id}`} className="relative w-full aspect-square bg-gray-50 dark:bg-gray-700 block">
                    {product.images && product.images.length > 0 ? (
                         <Image
                            src={product.images[0]}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">No Image</span>
                        </div>
                    )}
                </Link>

                <div className="p-4 flex flex-col grow">
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 mb-3">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{product.rating || '4.5'} (20+ reviews)</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{product.price}
                        </span>
                        
                        <button 
                            onClick={() => handleAddToCart(product)}
                            disabled={isCartLoading}
                            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isCartLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                            Add
                        </button>
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
        >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Heart size={48} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">
                Looks like you haven't added any items to your wishlist yet.
            </p>
            <Link 
                href="/" 
                className="bg-yellow-500 text-white px-8 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
                Start Shopping <ArrowRight size={20} />
            </Link>
        </motion.div>
      )}
    </div>
  );
}