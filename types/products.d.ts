interface ProductPriceType {
  id: number | string;
  price: number;
  discount: number;
  weight: number;
  unit: "gram" | "kg" | "ml" | "litre" | "piece";
}

interface ProductType {
  id: number | string;
  isGlobalProduct: boolean;
  category: string;
  brand: string;
  name: string;
  description: string;
  rating: number;
  images: string[];
  prices: ProductPriceType[];
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

type ProductListType = {
  products: ProductType[];
  pagination: Pagination;
};

interface ProductDetailType {
  id: number | string;
  isGlobalProduct: boolean;
  category: string;
  brand: string;
  name: string;
  description: string;
  rating: {
    rate: number;
    count: number;
    ratings: {
      id: number | string;
      userId: number | string;
      userName: string;
      userImage?: string;
      rating: number;
      review: string;
      images?: string[];
      createdAt: string;
    }[];
  };
  images: string[];
  prices: ProductPriceType[];
}

interface CartItem {
  id: number | string;
  userId: number | string;
  productId: number | string;
  priceId: number | string;
  quantity: number;
  product: {
    name: string;
    description?: string;
    image: string;
    price: number;
  };
}

export interface AddToCartPayload {
  productId: number | string;
  priceId: number | string;
  quantity: number;
}
export interface OrderPayload {
  addressId: number;
  paymentMethod: string;
  items?: CartItem[];
}

export {
  ProductType,
  Pagination,
  ProductListType,
  ProductDetailType,
  ProductPriceType,
  CartItem,
  AddToCartPayload,
  OrderPayload,
};
