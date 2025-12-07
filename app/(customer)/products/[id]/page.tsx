"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
// import Link from "next/link";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Share2,
  Truck,
  ShieldCheck,
  Loader2,
  CreditCard, // Added CreditCard icon for Buy Now
} from "lucide-react";
import { motion } from "framer-motion";
// import { ShopService, ShopProduct } from "@/services/shopService";
// import { useCartStore } from "@/hooks/useCartStore";
import { useCartStore } from "@/store";
import { useWishlistStore } from "@/hooks/useWishlistStore";
import coustomerService from "@/services/customerService";
import type { ProductDetailType, ProductPriceType } from "@/types";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  // Stores
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  // State
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  // const [relatedProducts, setRelatedProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false); // State for Buy Now loading
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Variant State
  const [selectedPrice, setSelectedPrice] = useState<ProductPriceType | null>(
    null
  );

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const numericId = parseInt(id.replace(/\D/g, "")) || 0;
        const productData = await coustomerService.getProductById(numericId);
        setProduct(productData);
        setSelectedPrice(productData.prices[0]);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const isLiked = product ? isWishlisted(product?.id?.toString()) : false;

  // Handlers
  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({
      productId: Number(product.id),
      priceId: selectedPrice?.id || product.prices[0].id,
      quantity: quantity,
    });
  };

  // NEW: Handle Buy Now
  const handleBuyNow = async () => {
    if (!product) return;
    setIsBuying(true);
    try {
      await handleAddToCart();
      router.push("/checkout");
    } finally {
      setIsBuying(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-32 md:pb-8">
      <Suspense
        fallback={
          isLoading && (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
              <Loader2 className="animate-spin text-yellow-500" size={40} />
            </div>
          )
        }
      >
        {/* {JSON.stringify(product)} */}
        <div className="md:hidden flex items-center justify-between p-4 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={24} className="text-gray-700 dark:text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform"
            >
              <Share2 size={24} className="text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
        {product && (
          <div className="max-w-7xl mx-auto px-0 md:px-8 md:py-8">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* --- LEFT: Image Gallery --- */}
              <div className="w-full md:w-1/2 space-y-4">
                <motion.div
                  layoutId={`product-image-${product.id}`}
                  className="relative w-full aspect-square md:aspect-4/3 bg-gray-100 dark:bg-gray-800 md:rounded-3xl overflow-hidden"
                >
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[activeImage] || product.images[0]}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="priority"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </motion.div>

                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 px-4 md:px-0 overflow-x-auto no-scrollbar">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === idx
                            ? "border-yellow-500"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          src={img}
                          layout="fill"
                          objectFit="cover"
                          alt=""
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* --- RIGHT: Details & Actions --- */}
              <div className="w-full md:w-1/2 px-4 md:px-0 space-y-6">
                {/* Title & Header Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                      {product.name}
                    </h1>
                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Copy Link"
                      >
                        <Share2
                          size={24}
                          className="text-gray-600 dark:text-gray-300"
                        />
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id.toString())}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Heart
                          size={24}
                          className={
                            isLiked
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="ml-1 font-bold">
                        {product.rating.rate}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {product.rating.count} Reviews
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                      In Stock
                    </span>
                  </div>
                </div>

                {/* Price Block */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                      Total Price
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹
                      {selectedPrice
                        ? (selectedPrice.price * quantity).toFixed(2)
                        : (product.prices[0].price * quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-xl p-1.5 shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500 text-white shadow-sm hover:bg-yellow-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Variant / Size Selection */}
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                    Select Size
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.prices.map((price) => (
                      <button
                        key={price.id}
                        onClick={() => setSelectedPrice(price)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                          selectedPrice?.id === price.id
                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {`${price.weight}${price.unit} - ₹${price.price}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <Truck
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        Fast Delivery
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Within 2 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <ShieldCheck
                      className="text-green-600 dark:text-green-400"
                      size={24}
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        Quality Check
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        100% Verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky Bottom Actions (Add to Cart + Buy Now) */}
                <div className="fixed md:static bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:border-none md:p-0 md:bg-transparent z-20">
                  <div className="flex gap-3 max-w-7xl mx-auto">
                    <button
                      onClick={() => toggleWishlist(product.id.toString())}
                      className="md:hidden p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 shrink-0"
                    >
                      <Heart
                        size={24}
                        className={isLiked ? "fill-red-500 text-red-500" : ""}
                      />
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isCartLoading || isBuying}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isCartLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </>
                      )}
                    </button>

                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      disabled={isBuying || isCartLoading}
                      className="flex-1 bg-yellow-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-yellow-500/30 hover:bg-yellow-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isBuying ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={20} />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RELATED PRODUCTS --- */}
            {/* {relatedProducts.length > 0 && (
              <div className="mt-16 px-4 md:px-0 mb-20 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  You might also like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((rp) => (
                    <Link
                      href={`/products/${rp.id}`}
                      key={rp.id}
                      className="group"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
                        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-3">
                          {rp.images && rp.images.length > 0 ? (
                            <Image
                              src={rp.images[0]}
                              alt={rp.name}
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {rp.name}
                        </h3>
                        <p className="text-sm font-bold text-gray-500">
                          ₹{rp.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        )}
      </Suspense>
    </div>
  );
}
