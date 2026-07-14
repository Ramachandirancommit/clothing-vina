// hooks/useProducts.ts - COMPLETE FIXED VERSION WITH ALL TYPES

import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { Product } from "../utils/types";
import { useDeviceInfo } from "./useDeviceInfo";

interface UseProductsOptions {
  category?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  sortBy?: "price" | "rating" | "name" | "popularity";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const { getUserId, getDeviceInfo } = useDeviceInfo();

  const {
    category,
    searchQuery,
    limit = 20,
    offset = 0,
    sortBy = "popularity",
    sortOrder = "desc",
    minPrice,
    maxPrice,
    sizes: sizeFilter,
  } = options;

  // Helper function to safely get rating as number
  const getRatingAsNumber = (rating: any): number => {
    if (typeof rating === "number") return rating;
    if (typeof rating === "string") return parseFloat(rating) || 0;
    return 0;
  };

  // Helper function to safely get date
  const getDateAsNumber = (date: any): number => {
    if (!date) return 0;
    if (date instanceof Date) return date.getTime();
    if (typeof date === "string") return new Date(date).getTime();
    if (typeof date === "number") return date;
    return 0;
  };

  // Helper to normalize product data to match Product interface
  const normalizeProduct = (product: any): Product => {
    return {
      id: product.id?.toString() || product.product_id?.toString() || "",
      product_name: product.product_name || "",
      product_category: product.product_category || "",
      price:
        typeof product.price === "string"
          ? product.price
          : product.price?.toString() || "0",
      size: product.size || "",
      image: product.product_image || product.image || "",
      product_image: product.product_image || product.image || "",
      description: product.description || "",
      quantity: product.quantity || 0,
      created_at: product.created_at || product.createdAt || "",
      updated_at: product.updated_at || product.updatedAt || "",
      rating: product.rating || 0,
      reviews: product.reviews || "0",
      sold: product.sold || 0,
      is_featured: product.is_featured || 0,
      // Keep any other fields
      ...product,
    };
  };

  // Fetch products from API
  const fetchProducts = useCallback(
    async (refresh: boolean = false) => {
      try {
        console.log("🔄 Fetching products...", { refresh, options });

        if (refresh) {
          setRefreshing(true);
          setCurrentPage(1);
        } else {
          setLoading(true);
        }

        setError(null);

        const params: any = {
          limit: limit,
          offset: refresh ? 0 : offset + (currentPage - 1) * limit,
          sortBy,
          sortOrder,
        };

        if (category) params.category = category;
        if (searchQuery) params.search = searchQuery;
        if (minPrice !== undefined) params.minPrice = minPrice;
        if (maxPrice !== undefined) params.maxPrice = maxPrice;
        if (sizeFilter && sizeFilter.length > 0) {
          params.sizes = sizeFilter.join(",");
        }

        console.log("📤 Request params:", params);

        const response = await api.getProducts(params);

        console.log("📥 API Response:", response);

        // Extract products from various response formats
        let newProducts: any[] = [];
        let total = 0;
        let page = 1;
        let totalPages = 1;
        let success = true;
        let errorMsg = null;

        if (!response) {
          throw new Error("No response from API");
        }

        // Case 1: Response is an array directly
        if (Array.isArray(response)) {
          newProducts = response;
          total = response.length;
          console.log("✅ Response is array:", newProducts.length);
        }
        // Case 2: Response has products property
        else if (response && typeof response === "object") {
          if ("products" in response && Array.isArray(response.products)) {
            newProducts = response.products;
            total = (response as any).total || newProducts.length;
            page = (response as any).page || 1;
            totalPages = (response as any).totalPages || 1;
            success =
              (response as any).success !== undefined
                ? (response as any).success
                : true;
            errorMsg = (response as any).error || null;
            console.log("✅ Response has products:", newProducts.length);
          }
          // Case 3: Response has data property
          else if ("data" in response) {
            const data = (response as any).data;
            if (Array.isArray(data)) {
              newProducts = data;
              total = (response as any).total || newProducts.length;
              console.log("✅ Response has data array:", newProducts.length);
            } else if (
              data &&
              typeof data === "object" &&
              "products" in data &&
              Array.isArray(data.products)
            ) {
              newProducts = data.products;
              total = data.total || newProducts.length;
              page = data.page || 1;
              totalPages = data.totalPages || 1;
              console.log("✅ Response has data.products:", newProducts.length);
            }
          }
          // Case 4: Response has items or results
          else if (
            "items" in response &&
            Array.isArray((response as any).items)
          ) {
            newProducts = (response as any).items;
            total =
              (response as any).total ||
              (response as any).count ||
              newProducts.length;
            console.log("✅ Response has items:", newProducts.length);
          } else if (
            "results" in response &&
            Array.isArray((response as any).results)
          ) {
            newProducts = (response as any).results;
            total =
              (response as any).total ||
              (response as any).count ||
              newProducts.length;
            console.log("✅ Response has results:", newProducts.length);
          } else {
            console.error("❌ Unexpected response format:", response);
            setError("Unexpected API response format");
            setLoading(false);
            setRefreshing(false);
            return;
          }
        } else {
          console.error("❌ Unexpected response type:", typeof response);
          setError("Unexpected API response format");
          setLoading(false);
          setRefreshing(false);
          return;
        }

        // Normalize products to match our Product interface
        const normalizedProducts = newProducts
          .filter((product: any) => product && product.id) // FIXED: Added explicit type
          .map((product: any) => normalizeProduct(product)); // FIXED: Added explicit type

        console.log(`✅ Normalized ${normalizedProducts.length} products`);

        if (normalizedProducts.length > 0 || success) {
          if (refresh) {
            setProducts(normalizedProducts);
            setFilteredProducts(normalizedProducts);
          } else {
            setProducts((prev: Product[]) => {
              // FIXED: Added explicit type
              const existingIds = new Set(prev.map((p: Product) => p.id)); // FIXED: Added explicit type
              const uniqueNew = normalizedProducts.filter(
                (p: Product) => !existingIds.has(p.id),
              ); // FIXED: Added explicit type
              return [...prev, ...uniqueNew];
            });
            setFilteredProducts((prev: Product[]) => {
              // FIXED: Added explicit type
              const existingIds = new Set(prev.map((p: Product) => p.id)); // FIXED: Added explicit type
              const uniqueNew = normalizedProducts.filter(
                (p: Product) => !existingIds.has(p.id),
              ); // FIXED: Added explicit type
              return [...prev, ...uniqueNew];
            });
          }

          setTotalProducts(total || normalizedProducts.length);
          setTotalPages(
            totalPages ||
              Math.ceil((total || normalizedProducts.length) / limit),
          );
          setCurrentPage(page || 1);
          setHasMore((page || 1) < (totalPages || 1));

          // Extract unique categories and sizes
          if (normalizedProducts.length > 0) {
            const uniqueCategories = [
              ...new Set(
                normalizedProducts.map((p: Product) => p.product_category),
              ), // FIXED: Added explicit type
            ].filter(Boolean) as string[];
            setCategories((prev: string[]) => [
              // FIXED: Added explicit type
              ...new Set([...prev, ...uniqueCategories]),
            ]);

            const uniqueSizes = [
              ...new Set(normalizedProducts.map((p: Product) => p.size)), // FIXED: Added explicit type
            ].filter(Boolean) as string[];
            setSizes((prev: string[]) => [
              // FIXED: Added explicit type
              ...new Set([...prev, ...uniqueSizes]),
            ]);
          }

          if (errorMsg) {
            setError(errorMsg);
          } else {
            setError(null);
          }
        } else {
          if (refresh) {
            setProducts([]);
            setFilteredProducts([]);
          }
          setError(errorMsg || "No products found");
        }
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Network error. Please check your connection.",
        );
        if (refresh) {
          setProducts([]);
          setFilteredProducts([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      category,
      searchQuery,
      limit,
      offset,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      sizeFilter,
      currentPage,
    ],
  );

  // Load more products (pagination)
  const loadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      setCurrentPage((prev: number) => prev + 1); // FIXED: Added explicit type
    }
  }, [loading, refreshing, hasMore]);

  // Refresh products
  const refreshProducts = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // Get single product by ID - handles both string and number IDs
  const getProductById = useCallback(
    (productId: string | number): Product | undefined => {
      const id = productId.toString();
      return products.find((p: Product) => p.id.toString() === id); // FIXED: Added explicit type
    },
    [products],
  );

  // Get products by category
  const getProductsByCategory = useCallback(
    (categoryName: string): Product[] => {
      return products.filter(
        (p: Product) => p.product_category === categoryName,
      ); // FIXED: Added explicit type
    },
    [products],
  );

  // Filter products locally
  const filterProducts = useCallback(
    (filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sizes?: string[];
      search?: string;
    }) => {
      let filtered = [...products];

      if (filters.category) {
        filtered = filtered.filter(
          (p: Product) => p.product_category === filters.category, // FIXED: Added explicit type
        );
      }

      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(
          (p: Product) => parseFloat(p.price || "0") >= (filters.minPrice || 0), // FIXED: Added explicit type
        );
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(
          (p: Product) =>
            parseFloat(p.price || "0") <= (filters.maxPrice || Infinity), // FIXED: Added explicit type
        );
      }

      if (filters.sizes && filters.sizes.length > 0) {
        filtered = filtered.filter((p: Product) =>
          filters.sizes?.includes(p.size),
        ); // FIXED: Added explicit type
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (
            p: Product, // FIXED: Added explicit type
          ) =>
            p.product_name.toLowerCase().includes(query) ||
            p.product_category.toLowerCase().includes(query),
        );
      }

      setFilteredProducts(filtered);
      return filtered;
    },
    [products],
  );

  // Sort products
  const sortProducts = useCallback(
    (
      sortBy: "price" | "rating" | "name" | "popularity",
      order: "asc" | "desc" = "asc",
    ) => {
      const sorted = [...filteredProducts];

      sorted.sort((a: Product, b: Product) => {
        // FIXED: Added explicit types
        let comparison = 0;

        switch (sortBy) {
          case "price":
            comparison =
              parseFloat(a.price || "0") - parseFloat(b.price || "0");
            break;
          case "rating":
            const ratingA = getRatingAsNumber(a.rating);
            const ratingB = getRatingAsNumber(b.rating);
            comparison = ratingA - ratingB;
            break;
          case "name":
            comparison = a.product_name.localeCompare(b.product_name);
            break;
          case "popularity":
            comparison = (a.sold || 0) - (b.sold || 0);
            break;
          default:
            comparison = 0;
        }

        return order === "asc" ? comparison : -comparison;
      });

      setFilteredProducts(sorted);
      return sorted;
    },
    [filteredProducts],
  );

  // Get featured products
  const getFeaturedProducts = useCallback((): Product[] => {
    return products
      .filter((p: Product) => p.is_featured === 1 || p.is_featured === true) // FIXED: Added explicit type
      .slice(0, 10);
  }, [products]);

  // Get trending products
  const getTrendingProducts = useCallback((): Product[] => {
    return [...products]
      .sort((a: Product, b: Product) => (b.sold || 0) - (a.sold || 0)) // FIXED: Added explicit types
      .slice(0, 10);
  }, [products]);

  // Get new arrivals
  const getNewArrivals = useCallback((): Product[] => {
    return [...products]
      .sort((a: Product, b: Product) => {
        // FIXED: Added explicit types
        const dateA = getDateAsNumber(a.createdAt || a.created_at);
        const dateB = getDateAsNumber(b.createdAt || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [products]);

  // Search products
  const searchProducts = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setFilteredProducts(products);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setLoading(true);
      setError(null);

      try {
        const response = await api.searchProducts(query.trim());

        let searchResults: any[] = [];
        if (Array.isArray(response)) {
          searchResults = response;
        } else if (response && typeof response === "object") {
          if (
            "products" in response &&
            Array.isArray((response as any).products)
          ) {
            searchResults = (response as any).products;
          } else if ("data" in response) {
            const data = (response as any).data;
            if (Array.isArray(data)) {
              searchResults = data;
            } else if (
              data &&
              "products" in data &&
              Array.isArray(data.products)
            ) {
              searchResults = data.products;
            }
          } else if (
            "items" in response &&
            Array.isArray((response as any).items)
          ) {
            searchResults = (response as any).items;
          } else if (
            "results" in response &&
            Array.isArray((response as any).results)
          ) {
            searchResults = (response as any).results;
          }
        }

        const normalizedResults = searchResults
          .filter((product: any) => product && product.id) // FIXED: Added explicit type
          .map((product: any) => normalizeProduct(product)); // FIXED: Added explicit type

        setSearchResults(normalizedResults);
        setFilteredProducts(normalizedResults);
        setTotalProducts((response as any)?.total || normalizedResults.length);
        setTotalPages((response as any)?.totalPages || 1);
        setHasMore(
          ((response as any)?.page || 1) < ((response as any)?.totalPages || 1),
        );

        if (normalizedResults.length === 0) {
          setError("No products found matching your search");
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Error searching products:", err);
        setError("Search failed. Please try again.");
        setSearchResults([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [products],
  );

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setFilteredProducts(products);
    setIsSearching(false);
    setError(null);
  }, [products]);

  // Add product to recently viewed
  const addToRecentlyViewed = useCallback(
    async (productId: string) => {
      try {
        const userId = await getUserId();
        await api.addRecentlyViewed(userId, productId);
      } catch (error) {
        console.error("Error adding to recently viewed:", error);
      }
    },
    [getUserId],
  );

  // Get recently viewed products
  const getRecentlyViewed = useCallback(async (): Promise<Product[]> => {
    try {
      const userId = await getUserId();
      const response = await api.getRecentlyViewed(userId);
      let products: any[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && typeof response === "object") {
        if (
          "products" in response &&
          Array.isArray((response as any).products)
        ) {
          products = (response as any).products;
        } else if ("data" in response) {
          const data = (response as any).data;
          if (Array.isArray(data)) {
            products = data;
          }
        }
      }
      return products
        .filter((p: any) => p && p.id)
        .map((p: any) => normalizeProduct(p)); // FIXED: Added explicit types
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
      return [];
    }
  }, [getUserId]);

  // Get related products
  const getRelatedProducts = useCallback(
    (productId: string, limit: number = 4): Product[] => {
      const product = getProductById(productId);
      if (!product) return [];

      return products
        .filter(
          (
            p: Product, // FIXED: Added explicit type
          ) =>
            p.id.toString() !== productId.toString() &&
            (p.product_category === product.product_category ||
              p.size === product.size),
        )
        .slice(0, limit);
    },
    [products, getProductById],
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (
      category ||
      searchQuery ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      sizeFilter
    ) {
      fetchProducts(true);
    }
  }, [category, searchQuery, minPrice, maxPrice, sizeFilter]);

  // Load more when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(false);
    }
  }, [currentPage]);

  return {
    // Data
    products,
    filteredProducts,
    searchResults,
    loading,
    refreshing,
    isSearching,
    error,
    totalProducts,
    currentPage,
    totalPages,
    hasMore,
    categories,
    sizes,

    // Actions
    fetchProducts,
    loadMore,
    refreshProducts,
    getProductById,
    getProductsByCategory,
    filterProducts,
    sortProducts,
    searchProducts,
    clearSearch,
    getFeaturedProducts,
    getTrendingProducts,
    getNewArrivals,
    addToRecentlyViewed,
    getRecentlyViewed,
    getRelatedProducts,

    // Setters
    setRefreshing,
    setError,
  };
};

export default useProducts;
