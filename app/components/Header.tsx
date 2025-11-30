"use client";

import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Deals", href: "/trending" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-md border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-100/50 dark:border-gray-800/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* --- LEFT SECTION: Logo --- */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-12 transition-transform">
                E
              </div>
              <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Eazika
              </span>
            </Link>
          </div>
        </div>

        {/* --- CENTER SECTION: Navigation Links (Right Aligned) --- */}
        {/* Added ml-auto to push this section to the right */}
        <nav className="hidden md:flex items-center gap-8 ml-auto mr-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`font-medium text-lg transition-colors hover:text-yellow-500 ${
                pathname === link.href
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* --- RIGHT SECTION: Actions --- */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/wishlist"
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all hover:scale-105 hover:text-red-500 dark:hover:text-red-500"
          >
            <Heart size={22} strokeWidth={2} />
          </Link>

          <Link
            href="/cart"
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all hover:scale-105 relative group"
          >
            <ShoppingCart
              size={22}
              strokeWidth={2}
              className="group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
            />
            {cartCount > 0 && (
              <span className="absolute top-1 right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="hidden md:flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="w-8 h-8 bg-linear-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              R
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}