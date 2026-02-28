// Local model data for development and faster UI
export const modelsByBrand = {
  // Smartphones
  "Apple": [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone SE (3rd gen)"
  ],
  "Samsung": [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+",
    "Galaxy S23",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy A54",
    "Galaxy A34"
  ],
  "Google": [
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 7a",
    "Pixel Fold"
  ],
  "OnePlus": [
    "12",
    "Open",
    "11",
    "10 Pro",
    "Nord N30",
    "Nord N20"
  ],
  "Xiaomi": [
    "13 Pro",
    "13",
    "12 Pro",
    "12",
    "Redmi Note 12 Pro",
    "Redmi Note 12"
  ],
  
  // Laptops
  "Dell": [
    "XPS 15",
    "XPS 13",
    "Inspiron 15",
    "Inspiron 14",
    "Latitude 9440",
    "Latitude 7430",
    "Precision 5680",
    "G16 Gaming"
  ],
  "HP": [
    "Spectre x360 14",
    "Spectre x360 16",
    "Envy 15",
    "Envy 13",
    "Pavilion 15",
    "Pavilion 14",
    "Omen 16",
    "Victus 15"
  ],
  "Lenovo": [
    "ThinkPad X1 Carbon",
    "ThinkPad X1 Nano",
    "ThinkPad T14s",
    "Legion Pro 7",
    "Legion 5 Pro",
    "Yoga 9i",
    "IdeaPad 5",
    "IdeaPad 3"
  ],
  "Apple (Laptops)": [
    "MacBook Pro 16 M3",
    "MacBook Pro 14 M3",
    "MacBook Air 15 M2",
    "MacBook Air 13 M2",
    "MacBook Pro 16 M2",
    "MacBook Pro 14 M2"
  ],
  "Microsoft": [
    "Surface Laptop Studio 2",
    "Surface Laptop 5",
    "Surface Pro 9",
    "Surface Go 3"
  ],
  "ASUS": [
    "ROG Zephyrus G14",
    "ROG Strix G16",
    "Zenbook 14",
    "Vivobook 15",
    "TUF Gaming F15"
  ],
  "Acer": [
    "Swift 3",
    "Swift 5",
    "Aspire 5",
    "Nitro 5",
    "Predator Helios 300"
  ],
  
  // Headphones
  "Sony": [
    "WH-1000XM5",
    "WH-1000XM4",
    "WF-1000XM5",
    "WF-1000XM4",
    "WH-CH720N",
    "LinkBuds S"
  ],
  "Bose": [
    "QuietComfort Ultra",
    "QuietComfort 45",
    "QuietComfort Earbuds II",
    "Sport Earbuds"
  ],
  "Apple (Audio)": [
    "AirPods Max",
    "AirPods Pro 2",
    "AirPods 3",
    "AirPods 2"
  ],
  "Sennheiser": [
    "Momentum 4 Wireless",
    "Momentum True Wireless 3",
    "HD 660S2",
    "HD 599"
  ],
  "Beats": [
    "Studio Pro",
    "Fit Pro",
    "Solo 3",
    "Studio Buds+"
  ],
  
  // TVs
  "LG": [
    "OLED C3 Series",
    "OLED G3 Series",
    "OLED B3 Series",
    "QNED85 Series",
    "NanoCell 75 Series"
  ],
  "Samsung (TVs)": [
    "S90C OLED",
    "S95C OLED",
    "QN90C Neo QLED",
    "QN85C Neo QLED",
    "CU7000 Crystal UHD"
  ],
  "Sony (TVs)": [
    "XR A95L OLED",
    "XR X90L",
    "XR A80L OLED",
    "X80K"
  ],
  "TCL": [
    "QM8 QLED",
    "Q7 QLED",
    "S5 Series",
    "Class 4-Series"
  ],
  "Hisense": [
    "U8K ULED",
    "U7K ULED",
    "A6K Series"
  ]
};

// Helper function to get models for a brand
export const getModelsForBrand = (brand) => {
  if (!brand) return [];
  
  // Try exact match
  if (modelsByBrand[brand]) {
    return modelsByBrand[brand];
  }
  
  // Try case-insensitive match
  const brandLower = brand.toLowerCase();
  const foundBrand = Object.keys(modelsByBrand).find(
    key => key.toLowerCase() === brandLower
  );
  
  if (foundBrand) {
    return modelsByBrand[foundBrand];
  }
  
  // Try partial match (e.g., "Apple" matches "Apple (Laptops)")
  const partialMatch = Object.keys(modelsByBrand).find(
    key => key.toLowerCase().includes(brandLower)
  );
  
  return partialMatch ? modelsByBrand[partialMatch] : [];
};

// Get all unique categories
export const getAllCategories = () => {
  const categories = new Set();
  Object.keys(modelsByBrand).forEach(key => {
    if (key.includes('(')) {
      const category = key.match(/\(([^)]+)\)/)?.[1] || 'General';
      categories.add(category);
    } else {
      categories.add('General');
    }
  });
  return Array.from(categories);
};

// Get brands by category
export const getBrandsByCategory = (category) => {
  if (!category || category === 'General') {
    return Object.keys(modelsByBrand).filter(key => !key.includes('('));
  }
  
  const categoryLower = category.toLowerCase();
  return Object.keys(modelsByBrand).filter(key => {
    const match = key.match(/\(([^)]+)\)/);
    return match && match[1].toLowerCase() === categoryLower;
  });
};