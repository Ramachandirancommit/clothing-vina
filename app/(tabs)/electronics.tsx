import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ElectronicsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const scrollX = useRef(new Animated.Value(0)).current;

  // 🔷 CATEGORIES FOR TOP FILTER TABS
  const categories = [
    { id: "All", name: "All", icon: "grid" },
    { id: "TV", name: "TV", icon: "tv" },
    { id: "Washing Machine", name: "Washing", icon: "cube" },
    { id: "Refrigerator", name: "Fridge", icon: "snow" },
    { id: "AC", name: "AC", icon: "snow" },
    { id: "Mixer Grinder", name: "Mixer", icon: "restaurant" },
    { id: "Mobile", name: "Phones", icon: "phone-portrait" },
    { id: "Tablet", name: "Tablets", icon: "tablet-portrait" },
    { id: "Laptop", name: "Laptops", icon: "laptop" },
  ];

  // 🔷 ALL ELECTRONICS PRODUCTS (10 products per category)
  const allProducts = useMemo(
    () => ({
      TV: generateTVProducts(),
      "Washing Machine": generateWashingMachineProducts(),
      Refrigerator: generateRefrigeratorProducts(),
      AC: generateACProducts(),
      "Mixer Grinder": generateMixerGrinderProducts(),
      Mobile: generateMobileProducts(),
      Tablet: generateTabletProducts(),
      Laptop: generateLaptopProducts(),
    }),
    [],
  );

  // Flatten all products
  const flatProducts = useMemo(() => {
    const products: any[] = [];
    Object.entries(allProducts).forEach(([category, items]) => {
      items.forEach((item: any) => {
        products.push({ ...item, mainCategory: category });
      });
    });
    return products;
  }, [allProducts]);

  // 🔷 ADVANCED SEARCH FILTER
  const filteredProducts = useMemo(() => {
    let filtered = flatProducts;

    // Filter by category tab
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.mainCategory === selectedCategory,
      );
    }

    // Filter by search query (name, brand, price, specs)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.price.toString().includes(query) ||
          product.specs?.some((spec: string) =>
            spec.toLowerCase().includes(query),
          ) ||
          product.rating.toString().includes(query)
        );
      });
    }

    return filtered;
  }, [flatProducts, selectedCategory, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 🔷 HEADER - REDUCED HEIGHT (50px) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="flash" size={22} color="#1976d2" />
          <ThemedText style={styles.headerTitle}>Electronics Store</ThemedText>
        </View>
      </View>

      {/* 🔷 FILTER TABS (70%) + SEARCH BOX (30%) - SAME ROW */}
      <View style={styles.filterRow}>
        {/* FILTER TABS - 70% WIDTH */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                selectedCategory === category.id && styles.activeTab,
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                // DO NOT clear search when clicking any tab
              }}
            >
              <Ionicons
                name={category.icon as any}
                size={14}
                color={selectedCategory === category.id ? "#fff" : "#666"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  selectedCategory === category.id && styles.activeTabText,
                ]}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SEARCH BOX - 30% WIDTH */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={16}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery !== "" && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search Stats */}
      {searchQuery !== "" && (
        <View style={styles.searchStats}>
          <ThemedText style={styles.searchStatsText}>
            Found {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>
      )}

      {/* 🔷 PRODUCT GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.imageBox}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  {item.discount && (
                    <View style={styles.discountBadge}>
                      <ThemedText style={styles.discountText}>
                        -{item.discount}%
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.brandSection}>
                  <View style={styles.brandIcon}>
                    <Ionicons
                      name={item.brandIcon as any}
                      size={10}
                      color="#1976d2"
                    />
                  </View>
                  <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
                  {item.trusted && (
                    <View style={styles.trustedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={10}
                        color="#4caf50"
                      />
                    </View>
                  )}
                </View>

                <ThemedText style={styles.productName} numberOfLines={2}>
                  {item.name}
                </ThemedText>

                <View style={styles.specsContainer}>
                  {item.specs?.slice(0, 2).map((spec: string, idx: number) => (
                    <View key={idx} style={styles.specBadge}>
                      <ThemedText style={styles.specText}>{spec}</ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.priceSection}>
                  <ThemedText style={styles.currentPrice}>
                    ₹{item.price.toLocaleString()}
                  </ThemedText>
                  {item.originalPrice && (
                    <ThemedText style={styles.originalPrice}>
                      ₹{item.originalPrice.toLocaleString()}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.ratingSection}>
                  <View style={styles.stars}>
                    <Ionicons name="star" size={10} color="#ffc107" />
                    <ThemedText style={styles.ratingText}>
                      {item.rating}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.reviewsCount}>
                    ({item.reviews}+)
                  </ThemedText>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="cart-outline" size={14} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Buy</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.wishlistBtn]}
                  >
                    <Ionicons name="heart-outline" size={14} color="#1976d2" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <ThemedText style={styles.noResultsTitle}>
              No products found
            </ThemedText>
            <ThemedText style={styles.noResultsSubtitle}>
              {selectedCategory !== "All"
                ? `No products found in ${selectedCategory} category. Try another category.`
                : "Try adjusting your search or filter"}
            </ThemedText>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
            >
              <ThemedText style={styles.resetButtonText}>
                Reset All Filters
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// 🔷 TV PRODUCTS (10 products)
function generateTVProducts() {
  return [
    {
      name: "Samsung 55-inch 4K Neo QLED TV",
      brand: "Samsung",
      brandIcon: "tv",
      price: 134990,
      originalPrice: 164990,
      rating: "4.8",
      reviews: 2340,
      discount: 18,
      specs: ["4K", "QLED", "120Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: true,
    },
    {
      name: "LG 65-inch OLED evo C3",
      brand: "LG",
      brandIcon: "tv",
      price: 189990,
      originalPrice: 249990,
      rating: "4.9",
      reviews: 1870,
      discount: 24,
      specs: ["OLED", "4K", "120Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300",
      trusted: true,
    },
    {
      name: "Sony Bravia 55-inch 4K UHD",
      brand: "Sony",
      brandIcon: "tv",
      price: 119990,
      originalPrice: 139990,
      rating: "4.7",
      reviews: 3420,
      discount: 14,
      specs: ["4K", "HDR", "Google TV"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: true,
    },
    {
      name: "OnePlus 55-inch Q2 Pro",
      brand: "OnePlus",
      brandIcon: "tv",
      price: 69990,
      originalPrice: 89990,
      rating: "4.6",
      reviews: 1890,
      discount: 22,
      specs: ["4K", "QLED", "120Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: false,
    },
    {
      name: "Mi TV 5X 55-inch",
      brand: "Xiaomi",
      brandIcon: "tv",
      price: 54990,
      originalPrice: 69990,
      rating: "4.5",
      reviews: 4560,
      discount: 21,
      specs: ["4K", "Dolby Vision"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: false,
    },
    {
      name: "TCL 65-inch C745 Mini LED",
      brand: "TCL",
      brandIcon: "tv",
      price: 99990,
      originalPrice: 129990,
      rating: "4.6",
      reviews: 980,
      discount: 23,
      specs: ["Mini LED", "4K", "144Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: false,
    },
    {
      name: "Hisense 55-inch U7K",
      brand: "Hisense",
      brandIcon: "tv",
      price: 64990,
      originalPrice: 84990,
      rating: "4.5",
      reviews: 1200,
      discount: 23,
      specs: ["4K", "Mini LED", "144Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: false,
    },
    {
      name: "Samsung 75-inch Neo QLED 8K",
      brand: "Samsung",
      brandIcon: "tv",
      price: 499990,
      originalPrice: 649990,
      rating: "4.9",
      reviews: 560,
      discount: 23,
      specs: ["8K", "Neo QLED"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: true,
    },
    {
      name: "LG 43-inch UHD 4K TV",
      brand: "LG",
      brandIcon: "tv",
      price: 35990,
      originalPrice: 45990,
      rating: "4.4",
      reviews: 5670,
      discount: 21,
      specs: ["4K", "WebOS"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: true,
    },
    {
      name: "Sony Bravia 65-inch X90L",
      brand: "Sony",
      brandIcon: "tv",
      price: 159990,
      originalPrice: 199990,
      rating: "4.8",
      reviews: 1450,
      discount: 20,
      specs: ["4K", "XR Processor", "120Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300",
      trusted: true,
    },
  ];
}

// 🔷 WASHING MACHINE PRODUCTS (10 products)
function generateWashingMachineProducts() {
  return [
    {
      name: "LG 8kg Fully Automatic Front Load",
      brand: "LG",
      brandIcon: "cube",
      price: 34990,
      originalPrice: 42990,
      rating: "4.7",
      reviews: 2340,
      discount: 18,
      specs: ["8kg", "Front Load", "WiFi"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
    {
      name: "Samsung 7kg Eco Bubble",
      brand: "Samsung",
      brandIcon: "cube",
      price: 28990,
      originalPrice: 35990,
      rating: "4.6",
      reviews: 1870,
      discount: 19,
      specs: ["7kg", "Eco Bubble", "Digital Inverter"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
    {
      name: "Whirlpool 8kg Stainwash",
      brand: "Whirlpool",
      brandIcon: "cube",
      price: 27990,
      originalPrice: 34990,
      rating: "4.5",
      reviews: 3420,
      discount: 20,
      specs: ["8kg", "Stainwash", "Top Load"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
    {
      name: "Bosch 9kg EcoSilence",
      brand: "Bosch",
      brandIcon: "cube",
      price: 54990,
      originalPrice: 69990,
      rating: "4.8",
      reviews: 890,
      discount: 21,
      specs: ["9kg", "EcoSilence", "Front Load"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
    {
      name: "IFB 7kg Aqua Energy",
      brand: "IFB",
      brandIcon: "cube",
      price: 31990,
      originalPrice: 39990,
      rating: "4.5",
      reviews: 1560,
      discount: 20,
      specs: ["7kg", "Front Load", "Aqua Energy"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: false,
    },
    {
      name: "Haier 8kg HWM80",
      brand: "Haier",
      brandIcon: "cube",
      price: 22990,
      originalPrice: 28990,
      rating: "4.4",
      reviews: 2340,
      discount: 20,
      specs: ["8kg", "Top Load", "Turbo Dry"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: false,
    },
    {
      name: "Panasonic 8kg NA-F50",
      brand: "Panasonic",
      brandIcon: "cube",
      price: 29990,
      originalPrice: 36990,
      rating: "4.5",
      reviews: 1120,
      discount: 18,
      specs: ["8kg", "Active Foam", "Top Load"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: false,
    },
    {
      name: "Godrej 6.5kg Ace Eon",
      brand: "Godrej",
      brandIcon: "cube",
      price: 17990,
      originalPrice: 22990,
      rating: "4.3",
      reviews: 3450,
      discount: 21,
      specs: ["6.5kg", "Semi Automatic"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: false,
    },
    {
      name: "Samsung 9kg AI Control",
      brand: "Samsung",
      brandIcon: "cube",
      price: 49990,
      originalPrice: 62990,
      rating: "4.8",
      reviews: 670,
      discount: 20,
      specs: ["9kg", "AI Control", "Front Load"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
    {
      name: "LG 6.5kg Top Load",
      brand: "LG",
      brandIcon: "cube",
      price: 19990,
      originalPrice: 24990,
      rating: "4.4",
      reviews: 7890,
      discount: 20,
      specs: ["6.5kg", "Turbo Drum", "Top Load"],
      imageUrl:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300",
      trusted: true,
    },
  ];
}

// 🔷 REFRIGERATOR PRODUCTS (10 products)
function generateRefrigeratorProducts() {
  return [
    {
      name: "Samsung 324L 3-Star Frost Free",
      brand: "Samsung",
      brandIcon: "snow",
      price: 38990,
      originalPrice: 45990,
      rating: "4.6",
      reviews: 2340,
      discount: 15,
      specs: ["324L", "Frost Free", "Digital Inverter"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "LG 260L 2-Star Door Cooling",
      brand: "LG",
      brandIcon: "snow",
      price: 27990,
      originalPrice: 33990,
      rating: "4.5",
      reviews: 1870,
      discount: 17,
      specs: ["260L", "Door Cooling", "Smart"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "Whirlpool 235L 5-Star",
      brand: "Whirlpool",
      brandIcon: "snow",
      price: 31990,
      originalPrice: 39990,
      rating: "4.7",
      reviews: 3420,
      discount: 20,
      specs: ["235L", "5-Star", "IntelliSense"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "Haier 520L Side-by-Side",
      brand: "Haier",
      brandIcon: "snow",
      price: 69990,
      originalPrice: 89990,
      rating: "4.6",
      reviews: 890,
      discount: 22,
      specs: ["520L", "Side-by-Side", "Convertible"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: false,
    },
    {
      name: "Bosch 290L 4-Star",
      brand: "Bosch",
      brandIcon: "snow",
      price: 45990,
      originalPrice: 55990,
      rating: "4.8",
      reviews: 560,
      discount: 17,
      specs: ["290L", "4-Star", "Home Connect"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "Godrej 190L Direct Cool",
      brand: "Godrej",
      brandIcon: "snow",
      price: 16990,
      originalPrice: 21990,
      rating: "4.3",
      reviews: 4560,
      discount: 22,
      specs: ["190L", "Direct Cool"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: false,
    },
    {
      name: "Samsung 550L French Door",
      brand: "Samsung",
      brandIcon: "snow",
      price: 89990,
      originalPrice: 114990,
      rating: "4.8",
      reviews: 450,
      discount: 21,
      specs: ["550L", "French Door", "Family Hub"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "LG 300L Smart Inverter",
      brand: "LG",
      brandIcon: "snow",
      price: 42990,
      originalPrice: 52990,
      rating: "4.7",
      reviews: 1230,
      discount: 18,
      specs: ["300L", "Smart Inverter", "WiFi"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
    {
      name: "Panasonic 240L 4-Star",
      brand: "Panasonic",
      brandIcon: "snow",
      price: 29990,
      originalPrice: 36990,
      rating: "4.5",
      reviews: 980,
      discount: 18,
      specs: ["240L", "4-Star", "Eco"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: false,
    },
    {
      name: "Whirlpool 310L 5-Star",
      brand: "Whirlpool",
      brandIcon: "snow",
      price: 39990,
      originalPrice: 48990,
      rating: "4.6",
      reviews: 2150,
      discount: 18,
      specs: ["310L", "5-Star", "Pro"],
      imageUrl:
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300",
      trusted: true,
    },
  ];
}

// 🔷 AC PRODUCTS (10 products)
function generateACProducts() {
  return [
    {
      name: "Daikin 1.5 Ton 5-Star Inverter",
      brand: "Daikin",
      brandIcon: "snow",
      price: 42990,
      originalPrice: 53990,
      rating: "4.7",
      reviews: 2340,
      discount: 20,
      specs: ["1.5 Ton", "5-Star", "Inverter"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
    {
      name: "LG 1.5 Ton 5-Star Dual Inverter",
      brand: "LG",
      brandIcon: "snow",
      price: 44990,
      originalPrice: 55990,
      rating: "4.8",
      reviews: 1870,
      discount: 19,
      specs: ["1.5 Ton", "Dual Inverter", "WiFi"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
    {
      name: "Blue Star 1 Ton 3-Star",
      brand: "Blue Star",
      brandIcon: "snow",
      price: 32990,
      originalPrice: 39990,
      rating: "4.5",
      reviews: 3420,
      discount: 17,
      specs: ["1 Ton", "3-Star", "Fixed Speed"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: false,
    },
    {
      name: "Samsung 1.5 Ton 4-Star WindFree",
      brand: "Samsung",
      brandIcon: "snow",
      price: 49990,
      originalPrice: 62990,
      rating: "4.6",
      reviews: 890,
      discount: 20,
      specs: ["1.5 Ton", "WindFree", "4-Star"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
    {
      name: "Carrier 1.5 Ton 5-Star",
      brand: "Carrier",
      brandIcon: "snow",
      price: 45990,
      originalPrice: 56990,
      rating: "4.7",
      reviews: 1560,
      discount: 19,
      specs: ["1.5 Ton", "5-Star", "Inverter"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
    {
      name: "Voltas 1 Ton 3-Star",
      brand: "Voltas",
      brandIcon: "snow",
      price: 29990,
      originalPrice: 36990,
      rating: "4.4",
      reviews: 4560,
      discount: 18,
      specs: ["1 Ton", "3-Star", "Inverter"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: false,
    },
    {
      name: "Mitsubishi 2 Ton 5-Star",
      brand: "Mitsubishi",
      brandIcon: "snow",
      price: 69990,
      originalPrice: 87990,
      rating: "4.9",
      reviews: 450,
      discount: 20,
      specs: ["2 Ton", "5-Star", "Heavy Duty"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
    {
      name: "Panasonic 1.5 Ton 5-Star",
      brand: "Panasonic",
      brandIcon: "snow",
      price: 43990,
      originalPrice: 54990,
      rating: "4.6",
      reviews: 1230,
      discount: 20,
      specs: ["1.5 Ton", "5-Star", "Nanoe"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: false,
    },
    {
      name: "Godrej 1.5 Ton 3-Star",
      brand: "Godrej",
      brandIcon: "snow",
      price: 31990,
      originalPrice: 39990,
      rating: "4.3",
      reviews: 2670,
      discount: 20,
      specs: ["1.5 Ton", "3-Star", "Eco"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: false,
    },
    {
      name: "O General 1.5 Ton 5-Star",
      brand: "O General",
      brandIcon: "snow",
      price: 54990,
      originalPrice: 68990,
      rating: "4.8",
      reviews: 780,
      discount: 20,
      specs: ["1.5 Ton", "5-Star", "Premium"],
      imageUrl:
        "https://images.unsplash.com/photo-1631559963625-f43b2d4b93c1?w=300",
      trusted: true,
    },
  ];
}

// 🔷 MIXER GRINDER PRODUCTS (10 products)
function generateMixerGrinderProducts() {
  return [
    {
      name: "Prestige 750W Mixer Grinder",
      brand: "Prestige",
      brandIcon: "restaurant",
      price: 3499,
      originalPrice: 4499,
      rating: "4.5",
      reviews: 5670,
      discount: 22,
      specs: ["750W", "3 Jars", "Copper Motor"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: true,
    },
    {
      name: "Philips 500W Juicer Mixer",
      brand: "Philips",
      brandIcon: "restaurant",
      price: 4299,
      originalPrice: 5999,
      rating: "4.6",
      reviews: 2340,
      discount: 28,
      specs: ["500W", "2 Jars", "Juicer"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: true,
    },
    {
      name: "Bajaj 750W Rex Mixer",
      brand: "Bajaj",
      brandIcon: "restaurant",
      price: 3999,
      originalPrice: 5299,
      rating: "4.4",
      reviews: 3420,
      discount: 24,
      specs: ["750W", "3 Jars", "Dry Grinding"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Suprme 500W Mixer",
      brand: "Suprme",
      brandIcon: "restaurant",
      price: 2999,
      originalPrice: 3999,
      rating: "4.3",
      reviews: 4560,
      discount: 25,
      specs: ["500W", "2 Jars"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Butterfly 750W Jet",
      brand: "Butterfly",
      brandIcon: "restaurant",
      price: 3799,
      originalPrice: 4999,
      rating: "4.5",
      reviews: 2890,
      discount: 24,
      specs: ["750W", "3 Jars", "Copper"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Havells 500W Mixer",
      brand: "Havells",
      brandIcon: "restaurant",
      price: 3999,
      originalPrice: 5299,
      rating: "4.4",
      reviews: 1780,
      discount: 24,
      specs: ["500W", "3 Jars", "Liquidizing"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Inalsa 1000W Maxie",
      brand: "Inalsa",
      brandIcon: "restaurant",
      price: 6499,
      originalPrice: 8499,
      rating: "4.6",
      reviews: 890,
      discount: 23,
      specs: ["1000W", "4 Jars", "Professional"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: true,
    },
    {
      name: "Borosil 750W Mixer",
      brand: "Borosil",
      brandIcon: "restaurant",
      price: 4499,
      originalPrice: 5799,
      rating: "4.5",
      reviews: 1450,
      discount: 22,
      specs: ["750W", "3 Jars", "Sleek"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Pigeon 500W Mixer",
      brand: "Pigeon",
      brandIcon: "restaurant",
      price: 2799,
      originalPrice: 3699,
      rating: "4.2",
      reviews: 6780,
      discount: 24,
      specs: ["500W", "3 Jars", "Economy"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: false,
    },
    {
      name: "Wonderchef 750W Mixer",
      brand: "Wonderchef",
      brandIcon: "restaurant",
      price: 4999,
      originalPrice: 6499,
      rating: "4.6",
      reviews: 1120,
      discount: 23,
      specs: ["750W", "3 Jars", "Nutri-Blend"],
      imageUrl:
        "https://images.unsplash.com/photo-1613879948296-6ff4757d77da?w=300",
      trusted: true,
    },
  ];
}

// 🔷 MOBILE PRODUCTS (10 products)
function generateMobileProducts() {
  return [
    {
      name: "iPhone 15 Pro Max",
      brand: "Apple",
      brandIcon: "phone-portrait",
      price: 159900,
      originalPrice: 179900,
      rating: "4.9",
      reviews: 12500,
      discount: 11,
      specs: ["A17 Pro", "256GB", "48MP"],
      imageUrl:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300",
      trusted: true,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      brandIcon: "phone-portrait",
      price: 129999,
      originalPrice: 149999,
      rating: "4.8",
      reviews: 8900,
      discount: 13,
      specs: ["Snapdragon 8 Gen 3", "256GB", "200MP"],
      imageUrl:
        "https://images.unsplash.com/photo-1678911820864-e1c4c6a5fa08?w=300",
      trusted: true,
    },
    {
      name: "OnePlus 12R",
      brand: "OnePlus",
      brandIcon: "phone-portrait",
      price: 39999,
      originalPrice: 49999,
      rating: "4.6",
      reviews: 5600,
      discount: 20,
      specs: ["16GB RAM", "128GB", "120Hz"],
      imageUrl:
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300",
      trusted: true,
    },
    {
      name: "Xiaomi 14 Ultra",
      brand: "Xiaomi",
      brandIcon: "phone-portrait",
      price: 89999,
      originalPrice: 109999,
      rating: "4.7",
      reviews: 3400,
      discount: 18,
      specs: ["Leica Camera", "1TB", "Snapdragon 8 Gen 3"],
      imageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300",
      trusted: false,
    },
    {
      name: "Google Pixel 8 Pro",
      brand: "Google",
      brandIcon: "phone-portrait",
      price: 109999,
      originalPrice: 129999,
      rating: "4.8",
      reviews: 2800,
      discount: 15,
      specs: ["Tensor G3", "128GB", "AI Camera"],
      imageUrl:
        "https://images.unsplash.com/photo-1678911820864-e1c4c6a5fa08?w=300",
      trusted: true,
    },
    {
      name: "Nothing Phone 2",
      brand: "Nothing",
      brandIcon: "phone-portrait",
      price: 44999,
      originalPrice: 54999,
      rating: "4.5",
      reviews: 4200,
      discount: 18,
      specs: ["Glyph Interface", "12GB RAM", "128GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300",
      trusted: false,
    },
    {
      name: "iQOO 12",
      brand: "iQOO",
      brandIcon: "phone-portrait",
      price: 52999,
      originalPrice: 64999,
      rating: "4.6",
      reviews: 2100,
      discount: 18,
      specs: ["Snapdragon 8 Gen 3", "144Hz", "120W Charging"],
      imageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300",
      trusted: false,
    },
    {
      name: "Vivo X100 Pro",
      brand: "Vivo",
      brandIcon: "phone-portrait",
      price: 89999,
      originalPrice: 109999,
      rating: "4.7",
      reviews: 1800,
      discount: 18,
      specs: ["Zeiss Camera", "Dimensity 9300", "120W"],
      imageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300",
      trusted: false,
    },
    {
      name: "Motorola Edge 50 Ultra",
      brand: "Motorola",
      brandIcon: "phone-portrait",
      price: 59999,
      originalPrice: 72999,
      rating: "4.5",
      reviews: 1500,
      discount: 17,
      specs: ["144Hz", "125W Charging", "125MP"],
      imageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300",
      trusted: false,
    },
    {
      name: "Realme GT 5 Pro",
      brand: "Realme",
      brandIcon: "phone-portrait",
      price: 45999,
      originalPrice: 55999,
      rating: "4.5",
      reviews: 3200,
      discount: 17,
      specs: ["Snapdragon 8 Gen 3", "100W Charging"],
      imageUrl:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300",
      trusted: false,
    },
  ];
}

// 🔷 TABLET PRODUCTS (10 products)
function generateTabletProducts() {
  return [
    {
      name: "iPad Pro 12.9-inch M2",
      brand: "Apple",
      brandIcon: "tablet-portrait",
      price: 119900,
      originalPrice: 139900,
      rating: "4.9",
      reviews: 5600,
      discount: 14,
      specs: ["M2 Chip", "256GB", "Liquid Retina"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: true,
    },
    {
      name: "Samsung Galaxy Tab S9 Ultra",
      brand: "Samsung",
      brandIcon: "tablet-portrait",
      price: 109999,
      originalPrice: 129999,
      rating: "4.8",
      reviews: 3400,
      discount: 15,
      specs: ["14.6-inch", "S Pen", "256GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: true,
    },
    {
      name: "iPad Air 5th Gen",
      brand: "Apple",
      brandIcon: "tablet-portrait",
      price: 59900,
      originalPrice: 69900,
      rating: "4.7",
      reviews: 8900,
      discount: 14,
      specs: ["M1 Chip", "64GB", "10.9-inch"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: true,
    },
    {
      name: "Xiaomi Pad 6",
      brand: "Xiaomi",
      brandIcon: "tablet-portrait",
      price: 26999,
      originalPrice: 32999,
      rating: "4.5",
      reviews: 5670,
      discount: 18,
      specs: ["144Hz", "11-inch", "Snapdragon 870"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: false,
    },
    {
      name: "OnePlus Pad Go",
      brand: "OnePlus",
      brandIcon: "tablet-portrait",
      price: 19999,
      originalPrice: 24999,
      rating: "4.4",
      reviews: 2340,
      discount: 20,
      specs: ["11.35-inch", "2.4K Display"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: false,
    },
    {
      name: "iPad Mini 6th Gen",
      brand: "Apple",
      brandIcon: "tablet-portrait",
      price: 49900,
      originalPrice: 59900,
      rating: "4.7",
      reviews: 4560,
      discount: 16,
      specs: ["8.3-inch", "A15 Bionic", "64GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: true,
    },
    {
      name: "Lenovo Tab P12 Pro",
      brand: "Lenovo",
      brandIcon: "tablet-portrait",
      price: 59999,
      originalPrice: 72999,
      rating: "4.6",
      reviews: 1230,
      discount: 17,
      specs: ["12.6-inch", "120Hz", "8GB RAM"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: false,
    },
    {
      name: "Samsung Tab A9+",
      brand: "Samsung",
      brandIcon: "tablet-portrait",
      price: 20999,
      originalPrice: 25999,
      rating: "4.4",
      reviews: 7890,
      discount: 19,
      specs: ["11-inch", "90Hz", "4GB RAM"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: true,
    },
    {
      name: "Realme Pad 2",
      brand: "Realme",
      brandIcon: "tablet-portrait",
      price: 17999,
      originalPrice: 22999,
      rating: "4.3",
      reviews: 3450,
      discount: 21,
      specs: ["11.5-inch", "120Hz", "8GB RAM"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: false,
    },
    {
      name: "Honor Pad 9",
      brand: "Honor",
      brandIcon: "tablet-portrait",
      price: 24999,
      originalPrice: 30999,
      rating: "4.4",
      reviews: 1670,
      discount: 19,
      specs: ["12.1-inch", "8 Speakers", "Snapdragon 6 Gen 1"],
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
      trusted: false,
    },
  ];
}

// 🔷 LAPTOP PRODUCTS (10 products)
function generateLaptopProducts() {
  return [
    {
      name: "MacBook Pro 16-inch M3 Max",
      brand: "Apple",
      brandIcon: "laptop",
      price: 299900,
      originalPrice: 349900,
      rating: "4.9",
      reviews: 3450,
      discount: 14,
      specs: ["M3 Max", "1TB", "36GB RAM"],
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
      trusted: true,
    },
    {
      name: "Dell XPS 15 Plus",
      brand: "Dell",
      brandIcon: "laptop",
      price: 164990,
      originalPrice: 199990,
      rating: "4.8",
      reviews: 2340,
      discount: 17,
      specs: ["Intel i9", "32GB", "1TB SSD"],
      imageUrl:
        "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300",
      trusted: true,
    },
    {
      name: "HP Spectre x360 16",
      brand: "HP",
      brandIcon: "laptop",
      price: 149990,
      originalPrice: 179990,
      rating: "4.7",
      reviews: 1870,
      discount: 16,
      specs: ["Intel i7", "16GB", "512GB SSD"],
      imageUrl:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300",
      trusted: true,
    },
    {
      name: "Lenovo Legion 5 Pro",
      brand: "Lenovo",
      brandIcon: "laptop",
      price: 139990,
      originalPrice: 169990,
      rating: "4.7",
      reviews: 3420,
      discount: 17,
      specs: ["RTX 4060", "Ryzen 7", "16GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      trusted: true,
    },
    {
      name: "Asus ROG Zephyrus G14",
      brand: "Asus",
      brandIcon: "laptop",
      price: 149990,
      originalPrice: 179990,
      rating: "4.7",
      reviews: 2340,
      discount: 16,
      specs: ["Ryzen 9", "RTX 4060", "16GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      trusted: false,
    },
    {
      name: "Acer Swift 5",
      brand: "Acer",
      brandIcon: "laptop",
      price: 89990,
      originalPrice: 109990,
      rating: "4.5",
      reviews: 1780,
      discount: 18,
      specs: ["Intel i7", "16GB", "512GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300",
      trusted: false,
    },
    {
      name: "MSI Katana 15",
      brand: "MSI",
      brandIcon: "laptop",
      price: 94990,
      originalPrice: 119990,
      rating: "4.5",
      reviews: 1230,
      discount: 20,
      specs: ["RTX 4050", "Intel i7", "1TB"],
      imageUrl:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      trusted: false,
    },
    {
      name: "Razer Blade 16",
      brand: "Razer",
      brandIcon: "laptop",
      price: 249990,
      originalPrice: 299990,
      rating: "4.8",
      reviews: 890,
      discount: 16,
      specs: ["RTX 4080", "i9", "32GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      trusted: true,
    },
    {
      name: "Microsoft Surface Laptop 5",
      brand: "Microsoft",
      brandIcon: "laptop",
      price: 129990,
      originalPrice: 159990,
      rating: "4.6",
      reviews: 1450,
      discount: 18,
      specs: ["Touch Screen", "Intel i7", "16GB"],
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
      trusted: true,
    },
    {
      name: "Google Pixelbook Go",
      brand: "Google",
      brandIcon: "laptop",
      price: 84990,
      originalPrice: 104990,
      rating: "4.4",
      reviews: 2340,
      discount: 19,
      specs: ["Chrome OS", "i5", "8GB RAM"],
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
      trusted: false,
    },
  ];
}

// 🔷 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  header: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 26,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 12,
  },

  tabsContainer: {
    flex: 1,
    marginRight: 8,
  },

  tabsContent: {
    paddingHorizontal: 0,
    gap: 6,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 1,
  },

  activeTab: {
    backgroundColor: "#1976d2",
  },

  tabText: {
    fontSize: 11,
    color: "#666",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  searchWrapper: {
    width: "30%",
  },

  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
  },

  searchIcon: {
    marginRight: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 11,
    color: "#333",
    paddingVertical: 0,
  },

  clearButton: {
    padding: 2,
  },

  searchStats: {
    marginTop: 4,
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  searchStatsText: {
    fontSize: 10,
    color: "#666",
  },

  gridContainer: {
    padding: 12,
    paddingBottom: 30,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    elevation: 2,
  },

  imageBox: {
    height: 100,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  discountBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#ff4757",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  discountText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },

  brandIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
  },

  brandName: {
    fontSize: 9,
    color: "#1976d2",
    fontWeight: "500",
  },

  trustedBadge: {
    marginLeft: 2,
  },

  productName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
    lineHeight: 14,
  },

  specsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },

  specBadge: {
    backgroundColor: "#eef2f6",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },

  specText: {
    fontSize: 7,
    color: "#666",
  },

  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  currentPrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  originalPrice: {
    fontSize: 9,
    color: "#999",
    textDecorationLine: "line-through",
  },

  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#fff3e0",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },

  ratingText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#ff8c00",
  },

  reviewsCount: {
    fontSize: 8,
    color: "#888",
  },

  actions: {
    flexDirection: "row",
    gap: 6,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: "#1976d2",
    paddingVertical: 5,
    borderRadius: 6,
  },

  actionBtnText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },

  wishlistBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1976d2",
    flex: 0.3,
  },

  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },

  noResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },

  noResultsSubtitle: {
    fontSize: 12,
    color: "#999",
  },

  resetButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#1976d2",
    borderRadius: 20,
  },

  resetButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
