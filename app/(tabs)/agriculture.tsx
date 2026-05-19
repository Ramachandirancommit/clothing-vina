import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function GoatMarketScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("All");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // 🔷 GOAT BREEDS FOR FILTER TABS
  const breeds = [
    { id: "All", name: "All", icon: "grid" },
    { id: "Osmanabadi", name: "Osmanabadi", icon: "paw" },
    { id: "Black Bengal", name: "Black Bengal", icon: "paw" },
    { id: "White Bengal", name: "White Bengal", icon: "paw" },
    { id: "Boer", name: "Boer", icon: "paw" },
    { id: "Jamunapari", name: "Jamunapari", icon: "paw" },
    { id: "Beetal", name: "Beetal", icon: "paw" },
    { id: "Sirohi", name: "Sirohi", icon: "paw" },
    { id: "Barbari", name: "Barbari", icon: "paw" },
    { id: "Kodi Aadu", name: "Kodi Aadu", icon: "paw" },
    { id: "Sangamneri", name: "Sangamneri", icon: "paw" },
  ];

  // 🔷 ALL GOATS DATA (10 breeds × 10 goats each = 100 goats)
  const allGoats = useMemo(
    () => ({
      Osmanabadi: generateOsmanabadiGoats(),
      "Black Bengal": generateBlackBengalGoats(),
      "White Bengal": generateWhiteBengalGoats(),
      Boer: generateBoerGoats(),
      Jamunapari: generateJamunapariGoats(),
      Beetal: generateBeetalGoats(),
      Sirohi: generateSirohiGoats(),
      Barbari: generateBarbariGoats(),
      "Kodi Aadu": generateKodiAaduGoats(),
      Sangamneri: generateSangamneriGoats(),
    }),
    [],
  );

  // Flatten all goats
  const flatGoats = useMemo(() => {
    const goats: any[] = [];
    Object.entries(allGoats).forEach(([breed, items]) => {
      items.forEach((item: any) => {
        goats.push({ ...item, mainBreed: breed });
      });
    });
    return goats;
  }, [allGoats]);

  // Update quantity for a specific goat
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= 10) {
      setQuantities((prev) => ({ ...prev, [index]: newQuantity }));
    }
  };

  // Add to cart
  const addToCart = (goat: any, index: number) => {
    const qty = quantities[index] || 1;
    if (qty === 0) {
      Alert.alert("Error", "Please select quantity first");
      return;
    }
    Alert.alert(
      "Added to Cart",
      `${qty}x ${goat.name} added to your cart!\nTotal: ₹${(goat.price * qty).toLocaleString()}`,
    );
  };

  // Buy now
  const buyNow = (goat: any, index: number) => {
    const qty = quantities[index] || 1;
    if (qty === 0) {
      Alert.alert("Error", "Please select quantity first");
      return;
    }
    Alert.alert(
      "Order Confirmed",
      `You have ordered ${qty}x ${goat.name}\nTotal: ₹${(goat.price * qty).toLocaleString()}\n\nOur team will contact you shortly!`,
    );
  };

  // 🔷 FILTER GOATS
  const filteredGoats = useMemo(() => {
    let filtered = flatGoats;

    // Filter by breed tab
    if (selectedBreed !== "All") {
      filtered = filtered.filter((goat) => goat.mainBreed === selectedBreed);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((goat) => {
        return (
          goat.name.toLowerCase().includes(query) ||
          goat.breed.toLowerCase().includes(query) ||
          goat.weight.includes(query) ||
          goat.price.toString().includes(query) ||
          goat.location.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [flatGoats, selectedBreed, searchQuery]);

  return (
    <View style={styles.container}>
      {/* 🔷 HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="paw" size={22} color="#1976d2" />
          <ThemedText style={styles.headerTitle}>Goat Market</ThemedText>
          <View style={styles.headerBadge}>
            <ThemedText style={styles.headerBadgeText}>
              {flatGoats.length}+ Goats
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.headerSubtitle}>
          Premium quality goats for sale | Best prices
        </ThemedText>
      </View>

      {/* 🔷 BREED FILTER (70%) + SEARCH (30%) - SAME ROW */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {breeds.map((breed) => (
            <TouchableOpacity
              key={breed.id}
              style={[
                styles.tab,
                selectedBreed === breed.id && styles.activeTab,
              ]}
              onPress={() => setSelectedBreed(breed.id)}
            >
              <Ionicons
                name={breed.icon as any}
                size={12}
                color={selectedBreed === breed.id ? "#fff" : "#666"}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  selectedBreed === breed.id && styles.activeTabText,
                ]}
                numberOfLines={1}
              >
                {breed.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SEARCH BOX */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={14} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search goat, breed, location..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
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
            Found {filteredGoats.length} goat
            {filteredGoats.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>
      )}

      {/* 🔷 GOAT GRID */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {filteredGoats.length > 0 ? (
          <View style={styles.grid}>
            {filteredGoats.map((goat, index) => (
              <View key={index} style={styles.card}>
                {/* GOAT IMAGE */}
                <View style={styles.imageBox}>
                  <Image
                    source={{ uri: goat.imageUrl }}
                    style={styles.goatImage}
                    resizeMode="cover"
                  />
                  {goat.isVaccinated && (
                    <View style={styles.vaccinatedBadge}>
                      <Ionicons name="medkit" size={10} color="#fff" />
                      <ThemedText style={styles.vaccinatedText}>
                        Vaccinated
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* GOAT NAME & BREED */}
                <ThemedText style={styles.goatName} numberOfLines={1}>
                  {goat.name}
                </ThemedText>
                <View style={styles.breedRow}>
                  <Ionicons name="paw" size={10} color="#1976d2" />
                  <ThemedText style={styles.breedText}>{goat.breed}</ThemedText>
                </View>

                {/* WEIGHT SECTION */}
                <View style={styles.weightSection}>
                  <Ionicons name="fitness" size={12} color="#ff8c00" />
                  <ThemedText style={styles.weightText}>
                    Weight: {goat.weight}
                  </ThemedText>
                </View>

                {/* LOCATION */}
                <View style={styles.locationSection}>
                  <Ionicons name="location" size={10} color="#666" />
                  <ThemedText style={styles.locationText}>
                    {goat.location}
                  </ThemedText>
                </View>

                {/* AGE & GENDER */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailBadge}>
                    <Ionicons name="calendar" size={8} color="#666" />
                    <ThemedText style={styles.detailText}>
                      {goat.age}
                    </ThemedText>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons
                      name={goat.gender === "Male" ? "male" : "female"}
                      size={8}
                      color="#666"
                    />
                    <ThemedText style={styles.detailText}>
                      {goat.gender}
                    </ThemedText>
                  </View>
                </View>

                {/* PRICE SECTION */}
                <View style={styles.priceSection}>
                  <ThemedText style={styles.currentPrice}>
                    ₹{goat.price.toLocaleString()}
                  </ThemedText>
                  {goat.originalPrice && (
                    <ThemedText style={styles.originalPrice}>
                      ₹{goat.originalPrice.toLocaleString()}
                    </ThemedText>
                  )}
                </View>

                {/* QUANTITY SELECTOR */}
                <View style={styles.quantitySection}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() =>
                      updateQuantity(index, (quantities[index] || 1) - 1)
                    }
                  >
                    <Ionicons name="remove" size={14} color="#1976d2" />
                  </TouchableOpacity>
                  <ThemedText style={styles.qtyText}>
                    {quantities[index] || 1}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() =>
                      updateQuantity(index, (quantities[index] || 1) + 1)
                    }
                  >
                    <Ionicons name="add" size={14} color="#1976d2" />
                  </TouchableOpacity>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => addToCart(goat, index)}
                  >
                    <Ionicons name="cart-outline" size={14} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Cart</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() => buyNow(goat, index)}
                  >
                    <Ionicons name="call-outline" size={14} color="#fff" />
                    <ThemedText style={styles.actionBtnText}>Buy</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <ThemedText style={styles.noResultsTitle}>
              No goats found
            </ThemedText>
            <ThemedText style={styles.noResultsSubtitle}>
              {selectedBreed !== "All"
                ? `No goats available in ${selectedBreed} breed. Try another breed.`
                : "Try adjusting your search"}
            </ThemedText>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedBreed("All");
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

// 🔷 OSMANABADI GOATS (10 goats)
function generateOsmanabadiGoats() {
  return [
    {
      name: "Premium Osmanabadi Buck",
      breed: "Osmanabadi",
      weight: "45 kg",
      age: "18 months",
      gender: "Male",
      price: 18500,
      originalPrice: 22000,
      location: "Solapur, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Osmanabadi Doe",
      breed: "Osmanabadi",
      weight: "38 kg",
      age: "14 months",
      gender: "Female",
      price: 15900,
      originalPrice: 18900,
      location: "Pune, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Pure Osmanabadi Male",
      breed: "Osmanabadi",
      weight: "52 kg",
      age: "24 months",
      gender: "Male",
      price: 22500,
      originalPrice: 27000,
      location: "Nanded, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Osmanabadi Female",
      breed: "Osmanabadi",
      weight: "35 kg",
      age: "12 months",
      gender: "Female",
      price: 14200,
      originalPrice: 16900,
      location: "Latur, MH",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Heavy Osmanabadi Buck",
      breed: "Osmanabadi",
      weight: "58 kg",
      age: "30 months",
      gender: "Male",
      price: 28900,
      originalPrice: 34900,
      location: "Aurangabad, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Osmanabadi Young Doe",
      breed: "Osmanabadi",
      weight: "28 kg",
      age: "8 months",
      gender: "Female",
      price: 11900,
      originalPrice: 14500,
      location: "Jalna, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Osmanabadi",
      breed: "Osmanabadi",
      weight: "50 kg",
      age: "20 months",
      gender: "Male",
      price: 20900,
      originalPrice: 25000,
      location: "Beed, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Osmanabadi Breeding Buck",
      breed: "Osmanabadi",
      weight: "55 kg",
      age: "28 months",
      gender: "Male",
      price: 25900,
      originalPrice: 31000,
      location: "Osmanabad, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Osmanabadi Female",
      breed: "Osmanabadi",
      weight: "32 kg",
      age: "10 months",
      gender: "Female",
      price: 13200,
      originalPrice: 15900,
      location: "Parbhani, MH",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Super Osmanabadi",
      breed: "Osmanabadi",
      weight: "48 kg",
      age: "16 months",
      gender: "Male",
      price: 19500,
      originalPrice: 23500,
      location: "Hingoli, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
  ];
}

// 🔷 BLACK BENGAL GOATS (10 goats)
function generateBlackBengalGoats() {
  return [
    {
      name: "Pure Black Bengal",
      breed: "Black Bengal",
      weight: "25 kg",
      age: "14 months",
      gender: "Male",
      price: 12500,
      originalPrice: 15000,
      location: "Kolkata, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Black Bengal Doe",
      breed: "Black Bengal",
      weight: "20 kg",
      age: "12 months",
      gender: "Female",
      price: 10900,
      originalPrice: 12900,
      location: "Nadia, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Black Male",
      breed: "Black Bengal",
      weight: "28 kg",
      age: "18 months",
      gender: "Male",
      price: 14900,
      originalPrice: 17900,
      location: "Birbhum, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Black Bengal Female",
      breed: "Black Bengal",
      weight: "18 kg",
      age: "10 months",
      gender: "Female",
      price: 9900,
      originalPrice: 11900,
      location: "Murshidabad, WB",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Heavy Black Bengal",
      breed: "Black Bengal",
      weight: "32 kg",
      age: "22 months",
      gender: "Male",
      price: 16900,
      originalPrice: 20500,
      location: "Bankura, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Black Bengal Young",
      breed: "Black Bengal",
      weight: "15 kg",
      age: "6 months",
      gender: "Male",
      price: 8900,
      originalPrice: 10900,
      location: "Hooghly, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Black Doe",
      breed: "Black Bengal",
      weight: "22 kg",
      age: "15 months",
      gender: "Female",
      price: 11900,
      originalPrice: 14500,
      location: "Howrah, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Black Bengal Buck",
      breed: "Black Bengal",
      weight: "30 kg",
      age: "20 months",
      gender: "Male",
      price: 15900,
      originalPrice: 19200,
      location: "24 Parganas, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Black Bengal Female",
      breed: "Black Bengal",
      weight: "19 kg",
      age: "11 months",
      gender: "Female",
      price: 10500,
      originalPrice: 12500,
      location: "Midnapore, WB",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Super Black Bengal",
      breed: "Black Bengal",
      weight: "26 kg",
      age: "16 months",
      gender: "Male",
      price: 13900,
      originalPrice: 16800,
      location: "Malda, WB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
  ];
}

// 🔷 WHITE BENGAL GOATS (10 goats)
function generateWhiteBengalGoats() {
  return [
    {
      name: "Pure White Bengal",
      breed: "White Bengal",
      weight: "27 kg",
      age: "15 months",
      gender: "Male",
      price: 13500,
      originalPrice: 16200,
      location: "Dhaka, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "White Bengal Doe",
      breed: "White Bengal",
      weight: "22 kg",
      age: "13 months",
      gender: "Female",
      price: 11500,
      originalPrice: 13900,
      location: "Barisal, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium White Male",
      breed: "White Bengal",
      weight: "30 kg",
      age: "19 months",
      gender: "Male",
      price: 15900,
      originalPrice: 19200,
      location: "Chittagong, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "White Bengal Female",
      breed: "White Bengal",
      weight: "20 kg",
      age: "11 months",
      gender: "Female",
      price: 10500,
      originalPrice: 12800,
      location: "Sylhet, BD",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Heavy White Bengal",
      breed: "White Bengal",
      weight: "34 kg",
      age: "24 months",
      gender: "Male",
      price: 17900,
      originalPrice: 21500,
      location: "Khulna, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "White Bengal Young",
      breed: "White Bengal",
      weight: "17 kg",
      age: "7 months",
      gender: "Male",
      price: 9500,
      originalPrice: 11500,
      location: "Rajshahi, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium White Doe",
      breed: "White Bengal",
      weight: "24 kg",
      age: "16 months",
      gender: "Female",
      price: 12900,
      originalPrice: 15500,
      location: "Rangpur, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "White Bengal Buck",
      breed: "White Bengal",
      weight: "32 kg",
      age: "21 months",
      gender: "Male",
      price: 16900,
      originalPrice: 20300,
      location: "Comilla, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "White Bengal Female",
      breed: "White Bengal",
      weight: "21 kg",
      age: "12 months",
      gender: "Female",
      price: 11200,
      originalPrice: 13400,
      location: "Jessore, BD",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Super White Bengal",
      breed: "White Bengal",
      weight: "28 kg",
      age: "17 months",
      gender: "Male",
      price: 14900,
      originalPrice: 17900,
      location: "Bogra, BD",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
  ];
}

// 🔷 BOER GOATS (10 goats)
function generateBoerGoats() {
  return [
    {
      name: "Pure Boer Buck",
      breed: "Boer",
      weight: "85 kg",
      age: "24 months",
      gender: "Male",
      price: 45000,
      originalPrice: 54000,
      location: "Chennai, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Boer Doe",
      breed: "Boer",
      weight: "65 kg",
      age: "20 months",
      gender: "Female",
      price: 38000,
      originalPrice: 45600,
      location: "Coimbatore, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Boer Male",
      breed: "Boer",
      weight: "95 kg",
      age: "30 months",
      gender: "Male",
      price: 55000,
      originalPrice: 66000,
      location: "Madurai, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Boer Female",
      breed: "Boer",
      weight: "58 kg",
      age: "16 months",
      gender: "Female",
      price: 35000,
      originalPrice: 42000,
      location: "Salem, TN",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Heavy Boer",
      breed: "Boer",
      weight: "105 kg",
      age: "36 months",
      gender: "Male",
      price: 65000,
      originalPrice: 78000,
      location: "Tirupur, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Boer Young",
      breed: "Boer",
      weight: "45 kg",
      age: "12 months",
      gender: "Male",
      price: 32000,
      originalPrice: 38500,
      location: "Erode, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Boer Doe",
      breed: "Boer",
      weight: "68 kg",
      age: "22 months",
      gender: "Female",
      price: 42000,
      originalPrice: 50500,
      location: "Trichy, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Boer Breeding Buck",
      breed: "Boer",
      weight: "90 kg",
      age: "28 months",
      gender: "Male",
      price: 52000,
      originalPrice: 62500,
      location: "Hosur, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Boer Female",
      breed: "Boer",
      weight: "62 kg",
      age: "18 months",
      gender: "Female",
      price: 36500,
      originalPrice: 43800,
      location: "Dindigul, TN",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Super Boer",
      breed: "Boer",
      weight: "88 kg",
      age: "26 months",
      gender: "Male",
      price: 49000,
      originalPrice: 58800,
      location: "Kanyakumari, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
  ];
}

// 🔷 JAMUNAPARI GOATS (10 goats)
function generateJamunapariGoats() {
  return [
    {
      name: "Pure Jamunapari",
      breed: "Jamunapari",
      weight: "65 kg",
      age: "22 months",
      gender: "Male",
      price: 35000,
      originalPrice: 42000,
      location: "Etawah, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Jamunapari Doe",
      breed: "Jamunapari",
      weight: "50 kg",
      age: "18 months",
      gender: "Female",
      price: 28000,
      originalPrice: 33600,
      location: "Agra, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Jamunapari",
      breed: "Jamunapari",
      weight: "75 kg",
      age: "28 months",
      gender: "Male",
      price: 45000,
      originalPrice: 54000,
      location: "Mathura, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Jamunapari Female",
      breed: "Jamunapari",
      weight: "45 kg",
      age: "14 months",
      gender: "Female",
      price: 25000,
      originalPrice: 30000,
      location: "Aligarh, UP",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Heavy Jamunapari",
      breed: "Jamunapari",
      weight: "85 kg",
      age: "32 months",
      gender: "Male",
      price: 55000,
      originalPrice: 66000,
      location: "Lucknow, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Jamunapari Young",
      breed: "Jamunapari",
      weight: "35 kg",
      age: "10 months",
      gender: "Male",
      price: 22000,
      originalPrice: 26500,
      location: "Kanpur, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Jamunapari Doe",
      breed: "Jamunapari",
      weight: "55 kg",
      age: "20 months",
      gender: "Female",
      price: 32000,
      originalPrice: 38500,
      location: "Varanasi, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Jamunapari Buck",
      breed: "Jamunapari",
      weight: "70 kg",
      age: "24 months",
      gender: "Male",
      price: 40000,
      originalPrice: 48000,
      location: "Prayagraj, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Jamunapari Female",
      breed: "Jamunapari",
      weight: "48 kg",
      age: "16 months",
      gender: "Female",
      price: 26500,
      originalPrice: 31800,
      location: "Gorakhpur, UP",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Super Jamunapari",
      breed: "Jamunapari",
      weight: "72 kg",
      age: "26 months",
      gender: "Male",
      price: 42000,
      originalPrice: 50500,
      location: "Bareilly, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
  ];
}

// 🔷 BEETAL GOATS (10 goats)
function generateBeetalGoats() {
  return [
    {
      name: "Pure Beetal",
      breed: "Beetal",
      weight: "70 kg",
      age: "24 months",
      gender: "Male",
      price: 38000,
      originalPrice: 45600,
      location: "Amritsar, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Beetal Doe",
      breed: "Beetal",
      weight: "55 kg",
      age: "20 months",
      gender: "Female",
      price: 30000,
      originalPrice: 36000,
      location: "Ludhiana, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Beetal",
      breed: "Beetal",
      weight: "80 kg",
      age: "30 months",
      gender: "Male",
      price: 48000,
      originalPrice: 57600,
      location: "Jalandhar, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Beetal Female",
      breed: "Beetal",
      weight: "50 kg",
      age: "16 months",
      gender: "Female",
      price: 27000,
      originalPrice: 32400,
      location: "Patiala, PB",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Heavy Beetal",
      breed: "Beetal",
      weight: "90 kg",
      age: "34 months",
      gender: "Male",
      price: 58000,
      originalPrice: 69600,
      location: "Bathinda, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Beetal Young",
      breed: "Beetal",
      weight: "40 kg",
      age: "12 months",
      gender: "Male",
      price: 24000,
      originalPrice: 28800,
      location: "Mohali, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Beetal Doe",
      breed: "Beetal",
      weight: "60 kg",
      age: "22 months",
      gender: "Female",
      price: 35000,
      originalPrice: 42000,
      location: "Pathankot, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Beetal Buck",
      breed: "Beetal",
      weight: "75 kg",
      age: "26 months",
      gender: "Male",
      price: 43000,
      originalPrice: 51600,
      location: "Firozpur, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Beetal Female",
      breed: "Beetal",
      weight: "52 kg",
      age: "18 months",
      gender: "Female",
      price: 28500,
      originalPrice: 34200,
      location: "Moga, PB",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Super Beetal",
      breed: "Beetal",
      weight: "78 kg",
      age: "28 months",
      gender: "Male",
      price: 46000,
      originalPrice: 55200,
      location: "Hoshiarpur, PB",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
  ];
}

// 🔷 SIROHI GOATS (10 goats)
function generateSirohiGoats() {
  return [
    {
      name: "Pure Sirohi",
      breed: "Sirohi",
      weight: "40 kg",
      age: "20 months",
      gender: "Male",
      price: 18000,
      originalPrice: 21600,
      location: "Sirohi, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sirohi Doe",
      breed: "Sirohi",
      weight: "32 kg",
      age: "16 months",
      gender: "Female",
      price: 14500,
      originalPrice: 17400,
      location: "Udaipur, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Sirohi",
      breed: "Sirohi",
      weight: "48 kg",
      age: "26 months",
      gender: "Male",
      price: 22000,
      originalPrice: 26400,
      location: "Jodhpur, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sirohi Female",
      breed: "Sirohi",
      weight: "28 kg",
      age: "12 months",
      gender: "Female",
      price: 12500,
      originalPrice: 15000,
      location: "Ajmer, RJ",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Heavy Sirohi",
      breed: "Sirohi",
      weight: "55 kg",
      age: "30 months",
      gender: "Male",
      price: 26000,
      originalPrice: 31200,
      location: "Kota, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sirohi Young",
      breed: "Sirohi",
      weight: "22 kg",
      age: "8 months",
      gender: "Male",
      price: 10500,
      originalPrice: 12600,
      location: "Bikaner, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Sirohi Doe",
      breed: "Sirohi",
      weight: "35 kg",
      age: "18 months",
      gender: "Female",
      price: 16500,
      originalPrice: 19800,
      location: "Jaipur, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sirohi Buck",
      breed: "Sirohi",
      weight: "45 kg",
      age: "22 months",
      gender: "Male",
      price: 20000,
      originalPrice: 24000,
      location: "Alwar, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sirohi Female",
      breed: "Sirohi",
      weight: "30 kg",
      age: "14 months",
      gender: "Female",
      price: 13500,
      originalPrice: 16200,
      location: "Bharatpur, RJ",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Super Sirohi",
      breed: "Sirohi",
      weight: "42 kg",
      age: "24 months",
      gender: "Male",
      price: 19500,
      originalPrice: 23400,
      location: "Sikar, RJ",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
  ];
}

// 🔷 BARBARI GOATS (10 goats)
function generateBarbariGoats() {
  return [
    {
      name: "Pure Barbari",
      breed: "Barbari",
      weight: "30 kg",
      age: "18 months",
      gender: "Male",
      price: 14000,
      originalPrice: 16800,
      location: "Delhi, NCR",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Barbari Doe",
      breed: "Barbari",
      weight: "25 kg",
      age: "14 months",
      gender: "Female",
      price: 11500,
      originalPrice: 13800,
      location: "Gurgaon, HR",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Barbari",
      breed: "Barbari",
      weight: "35 kg",
      age: "22 months",
      gender: "Male",
      price: 16500,
      originalPrice: 19800,
      location: "Faridabad, HR",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Barbari Female",
      breed: "Barbari",
      weight: "22 kg",
      age: "10 months",
      gender: "Female",
      price: 9800,
      originalPrice: 11800,
      location: "Noida, UP",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Heavy Barbari",
      breed: "Barbari",
      weight: "38 kg",
      age: "26 months",
      gender: "Male",
      price: 19000,
      originalPrice: 22800,
      location: "Ghaziabad, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Barbari Young",
      breed: "Barbari",
      weight: "18 kg",
      age: "6 months",
      gender: "Male",
      price: 8800,
      originalPrice: 10600,
      location: "Meerut, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Premium Barbari Doe",
      breed: "Barbari",
      weight: "27 kg",
      age: "16 months",
      gender: "Female",
      price: 12800,
      originalPrice: 15400,
      location: "Rohtak, HR",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Barbari Buck",
      breed: "Barbari",
      weight: "32 kg",
      age: "20 months",
      gender: "Male",
      price: 15200,
      originalPrice: 18200,
      location: "Hisar, HR",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Barbari Female",
      breed: "Barbari",
      weight: "23 kg",
      age: "12 months",
      gender: "Female",
      price: 10500,
      originalPrice: 12600,
      location: "Panipat, HR",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
    {
      name: "Super Barbari",
      breed: "Barbari",
      weight: "34 kg",
      age: "21 months",
      gender: "Male",
      price: 17500,
      originalPrice: 21000,
      location: "Mathura, UP",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544335476-9c5cdb2d4f2c?w=300",
    },
  ];
}

// 🔷 KODI AADU GOATS (10 goats)
function generateKodiAaduGoats() {
  return [
    {
      name: "Pure Kodi Aadu",
      breed: "Kodi Aadu",
      weight: "35 kg",
      age: "20 months",
      gender: "Male",
      price: 22000,
      originalPrice: 26400,
      location: "Tirunelveli, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Kodi Aadu Doe",
      breed: "Kodi Aadu",
      weight: "28 kg",
      age: "16 months",
      gender: "Female",
      price: 18000,
      originalPrice: 21600,
      location: "Kanyakumari, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Kodi Aadu",
      breed: "Kodi Aadu",
      weight: "42 kg",
      age: "26 months",
      gender: "Male",
      price: 28000,
      originalPrice: 33600,
      location: "Thoothukudi, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Kodi Aadu Female",
      breed: "Kodi Aadu",
      weight: "25 kg",
      age: "12 months",
      gender: "Female",
      price: 16000,
      originalPrice: 19200,
      location: "Virudhunagar, TN",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Heavy Kodi Aadu",
      breed: "Kodi Aadu",
      weight: "48 kg",
      age: "32 months",
      gender: "Male",
      price: 34000,
      originalPrice: 40800,
      location: "Madurai, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Kodi Aadu Young",
      breed: "Kodi Aadu",
      weight: "20 kg",
      age: "8 months",
      gender: "Male",
      price: 14000,
      originalPrice: 16800,
      location: "Dindigul, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Kodi Aadu Doe",
      breed: "Kodi Aadu",
      weight: "30 kg",
      age: "18 months",
      gender: "Female",
      price: 19500,
      originalPrice: 23400,
      location: "Theni, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Kodi Aadu Buck",
      breed: "Kodi Aadu",
      weight: "38 kg",
      age: "24 months",
      gender: "Male",
      price: 25000,
      originalPrice: 30000,
      location: "Ramanathapuram, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Kodi Aadu Female",
      breed: "Kodi Aadu",
      weight: "26 kg",
      age: "14 months",
      gender: "Female",
      price: 17000,
      originalPrice: 20400,
      location: "Sivagangai, TN",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Super Kodi Aadu",
      breed: "Kodi Aadu",
      weight: "40 kg",
      age: "22 months",
      gender: "Male",
      price: 26000,
      originalPrice: 31200,
      location: "Pudukottai, TN",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
  ];
}

// 🔷 SANGAMNERI GOATS (10 goats)
function generateSangamneriGoats() {
  return [
    {
      name: "Pure Sangamneri",
      breed: "Sangamneri",
      weight: "38 kg",
      age: "20 months",
      gender: "Male",
      price: 16500,
      originalPrice: 19800,
      location: "Sangamner, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sangamneri Doe",
      breed: "Sangamneri",
      weight: "30 kg",
      age: "16 months",
      gender: "Female",
      price: 13500,
      originalPrice: 16200,
      location: "Nashik, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Sangamneri",
      breed: "Sangamneri",
      weight: "45 kg",
      age: "26 months",
      gender: "Male",
      price: 21000,
      originalPrice: 25200,
      location: "Ahmednagar, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sangamneri Female",
      breed: "Sangamneri",
      weight: "26 kg",
      age: "12 months",
      gender: "Female",
      price: 11800,
      originalPrice: 14200,
      location: "Pune, MH",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Heavy Sangamneri",
      breed: "Sangamneri",
      weight: "52 kg",
      age: "32 months",
      gender: "Male",
      price: 26000,
      originalPrice: 31200,
      location: "Shirdi, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sangamneri Young",
      breed: "Sangamneri",
      weight: "22 kg",
      age: "8 months",
      gender: "Male",
      price: 10200,
      originalPrice: 12200,
      location: "Shrirampur, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Premium Sangamneri Doe",
      breed: "Sangamneri",
      weight: "32 kg",
      age: "18 months",
      gender: "Female",
      price: 15200,
      originalPrice: 18200,
      location: "Kopargaon, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sangamneri Buck",
      breed: "Sangamneri",
      weight: "42 kg",
      age: "24 months",
      gender: "Male",
      price: 19000,
      originalPrice: 22800,
      location: "Malegaon, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Sangamneri Female",
      breed: "Sangamneri",
      weight: "28 kg",
      age: "14 months",
      gender: "Female",
      price: 12500,
      originalPrice: 15000,
      location: "Manmad, MH",
      isVaccinated: false,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
    },
    {
      name: "Super Sangamneri",
      breed: "Sangamneri",
      weight: "44 kg",
      age: "25 months",
      gender: "Male",
      price: 20500,
      originalPrice: 24600,
      location: "Igatpuri, MH",
      isVaccinated: true,
      imageUrl:
        "https://images.unsplash.com/photo-1524024973431-2ad916374881?w=300",
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
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },

  headerBadge: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  headerBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },

  tabsContainer: {
    flex: 1,
    marginRight: 6,
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
    fontSize: 10,
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
    paddingVertical: 6,
    gap: 4,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 10,
    color: "#333",
    paddingVertical: 0,
  },

  searchStats: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  searchStatsText: {
    fontSize: 11,
    color: "#666",
  },

  gridContainer: {
    padding: 10,
    paddingBottom: 30,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },

  imageBox: {
    height: 120,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },

  goatImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  vaccinatedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#4caf50",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },

  vaccinatedText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "bold",
  },

  goatName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a2e",
  },

  breedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: 4,
  },

  breedText: {
    fontSize: 10,
    color: "#1976d2",
    fontWeight: "500",
  },

  weightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },

  weightText: {
    fontSize: 10,
    color: "#ff8c00",
    fontWeight: "500",
  },

  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },

  locationText: {
    fontSize: 9,
    color: "#888",
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#eef2f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  detailText: {
    fontSize: 8,
    color: "#666",
  },

  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  currentPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  originalPrice: {
    fontSize: 10,
    color: "#999",
    textDecorationLine: "line-through",
  },

  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#f0f4f8",
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },

  qtyBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    elevation: 1,
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  cartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#1976d2",
    paddingVertical: 8,
    borderRadius: 8,
  },

  buyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#ff8c00",
    paddingVertical: 8,
    borderRadius: 8,
  },

  actionBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
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
    textAlign: "center",
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
