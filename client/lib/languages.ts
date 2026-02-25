export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const supportedLanguages: LanguageConfig[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', direction: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', direction: 'ltr' },
];

export interface Translations {
  // Navigation
  dashboard: string;
  markets: string;
  storage: string;
  monthly: string;
  aiAssistant: string;
  suppliers: string;
  orders: string;
  credit: string;
  insights: string;
  businessAlerts: string;
  inventoryStatus: string;
  headerStatus: string;

  // Common actions
  search: string;
  buy: string;
  add: string;
  remove: string;
  save: string;
  cancel: string;

  // AI Commands
  buyCommand: string;
  searchCommand: string;
  priceCommand: string;
  stockCommand: string;

  // Dashboard
  todaysSavings: string;
  groupMembers: string;
  timeRemaining: string;
  creditLimit: string;
  groupOrder: string;
  topSuppliers: string;
  activeDeliveries: string;
  avgDeliveryTime: string;
  successRate: string;
  deliverySuccess: string;
  cooperativeNetwork: string;
  trustScore: string;
  fromYesterday: string;

  // Products & Categories
  all: string;
  vegetables: string;
  grains: string;
  onions: string;
  tomatoes: string;
  potatoes: string;
  oil: string;
  rice: string;
  spices: string;
  fruits: string;
  dairy: string;
  bakery: string;
  dryGoods: string;
  puris: string;
  mintWater: string;
  tamarindChutney: string;
  sprouts: string;

  // Status
  inStock: string;
  lowStock: string;
  outOfStock: string;
  delivered: string;
  pending: string;
  confirmed: string;

  // Voice commands
  voiceHelp: string;
  listening: string;
  speakNow: string;
}

export const translations: Record<string, Translations> = {
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    markets: 'बाज़ार',
    storage: 'भंडारण',
    monthly: 'मासिक',
    aiAssistant: 'AI सहायक',
    suppliers: 'सप्लायर्स',
    orders: 'ऑर्डर',
    credit: 'उधार',
    insights: 'इनसाइट्स',
    businessAlerts: 'व्यापार अलर्ट',
    inventoryStatus: 'स्टॉक की स्थिति',
    headerStatus: 'आपका विश्वसनीय बाज़ार साथी',

    // Common actions
    search: 'खोजें',
    buy: 'खरीदें',
    add: 'जोड़ें',
    remove: 'हटाएं',
    save: 'सेव करें',
    cancel: 'रद्द करें',

    // AI Commands
    buyCommand: '5 किलो आलू खरीदें',
    searchCommand: 'प्याज की कीमत',
    priceCommand: 'आज के रेट',
    stockCommand: 'स्टॉक चेक करें',

    // Dashboard
    todaysSavings: 'आज की बचत',
    groupMembers: 'समूह के सदस्य',
    timeRemaining: 'समय बचा',
    creditLimit: 'उधार लिमिट',
    groupOrder: 'सामूहिक ऑर्डर',
    topSuppliers: 'टॉप सप्लायर्स',
    activeDeliveries: 'सक्रिय डिलीवरी',
    avgDeliveryTime: 'औसत समय',
    successRate: 'सफलता दर',
    deliverySuccess: 'डिलीवरी सफलता',
    cooperativeNetwork: 'सहकारी नेटवर्क',
    trustScore: 'भरोसा',
    fromYesterday: 'कल से',

    // Products & Categories
    all: 'सब',
    vegetables: 'सब्जियां',
    grains: 'अनाज',
    onions: 'प्याज',
    tomatoes: 'टमाटर',
    potatoes: 'आलू',
    oil: 'तेल',
    rice: 'चावल',
    spices: 'मसाले',
    fruits: 'फल',
    dairy: 'डेयरी',
    bakery: 'बेकरी',
    dryGoods: 'सूखा माल',
    puris: 'पूड़ी',
    mintWater: 'पुदीना पानी',
    tamarindChutney: 'इमली चटनी',
    sprouts: 'अंकुरित अनाज',

    // Status
    inStock: 'स्टॉक में',
    lowStock: 'कम स्टॉक',
    outOfStock: 'स्टॉक नहीं',
    delivered: 'डिलीवर',
    pending: 'पेंडिंग',
    confirmed: 'कन्फर्म',

    // Voice commands
    voiceHelp: 'आवाज़ में पूछें',
    listening: 'सुन रहा हूं...',
    speakNow: 'अब बोलिए',
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    markets: 'Markets',
    storage: 'Storage',
    monthly: 'Monthly',
    aiAssistant: 'AI Assistant',
    suppliers: 'Suppliers',
    orders: 'Orders',
    credit: 'Credit',
    insights: 'Insights',
    businessAlerts: 'Business Alerts',
    inventoryStatus: 'Inventory Status',
    headerStatus: 'Your Trusted Market Companion',

    // Common actions
    search: 'Search',
    buy: 'Buy',
    add: 'Add',
    remove: 'Remove',
    save: 'Save',
    cancel: 'Cancel',

    // AI Commands
    buyCommand: 'Buy 5kg potatoes',
    searchCommand: 'Onion prices',
    priceCommand: 'Today\'s rates',
    stockCommand: 'Check stock',

    // Dashboard
    todaysSavings: 'Today\'s Savings',
    groupMembers: 'Group Members',
    timeRemaining: 'Time Remaining',
    creditLimit: 'Credit Limit',
    groupOrder: 'Group Order',
    topSuppliers: 'Top Suppliers',
    activeDeliveries: 'Active Deliveries',
    avgDeliveryTime: 'Avg time',
    successRate: 'Success Rate',
    deliverySuccess: 'Delivery Success',
    cooperativeNetwork: 'Cooperative Network',
    trustScore: 'Trust',
    fromYesterday: 'from yesterday',

    // Products & Categories
    all: 'All',
    vegetables: 'Vegetables',
    grains: 'Grains',
    onions: 'Onions',
    tomatoes: 'Tomatoes',
    potatoes: 'Potatoes',
    oil: 'Oil',
    rice: 'Rice',
    spices: 'Spices',
    fruits: 'Fruits',
    dairy: 'Dairy',
    bakery: 'Bakery',
    dryGoods: 'Dry Goods',
    puris: 'Puris',
    mintWater: 'Mint Water',
    tamarindChutney: 'Tamarind Chutney',
    sprouts: 'Sprouts',

    // Status
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    delivered: 'Delivered',
    pending: 'Pending',
    confirmed: 'Confirmed',

    // Voice commands
    voiceHelp: 'Voice Commands',
    listening: 'Listening...',
    speakNow: 'Speak now',
  },

  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    markets: 'बाजारपेठा',
    storage: 'साठवण',
    monthly: 'मासिक',
    aiAssistant: 'AI सहाय्यक',
    suppliers: 'पुरवठादार',
    orders: 'ऑर्डर',
    credit: 'उधार',
    insights: 'इनसाइट्स',
    businessAlerts: 'व्यवसाय अलर्ट',
    inventoryStatus: 'माल साठा स्थिती',
    headerStatus: 'तुमचा विश्वसनीय बाजार सहकारी',

    // Common actions
    search: 'शोधा',
    buy: 'खरेदी करा',
    add: 'जोडा',
    remove: 'काढा',
    save: 'जतन करा',
    cancel: 'रद्द करा',

    // AI Commands
    buyCommand: '५ किलो बटाटे घ्या',
    searchCommand: 'कांद्याची किंमत',
    priceCommand: 'आजचे दर',
    stockCommand: 'स्टॉक तपासा',

    // Dashboard
    todaysSavings: 'आजची बचत',
    groupMembers: 'गटाचे सदस्य',
    timeRemaining: 'वेळ उरली',
    creditLimit: 'उसने मर्यादा',
    groupOrder: 'सामूहिक ऑर्डर',
    topSuppliers: 'टॉप पुरवठादार',
    activeDeliveries: 'सक्रिय डिलिव्हरी',
    avgDeliveryTime: 'सरासरी वेळ',
    successRate: 'यशाचा दर',
    deliverySuccess: 'डिलिव्हरी यश',
    cooperativeNetwork: 'सहकारी नेटवर्क',
    trustScore: 'विश्वास',
    fromYesterday: 'कालपासून',

    // Products & Categories
    all: 'सर्व',
    vegetables: 'भाज्या',
    grains: 'धान्य',
    onions: 'कांदे',
    tomatoes: 'टोमॅटो',
    potatoes: 'बटाटे',
    oil: 'तेल',
    rice: 'तांदूळ',
    spices: 'मसाले',
    fruits: 'फळे',
    dairy: 'डेअरी',
    bakery: 'बेकरी',
    dryGoods: 'सुका माल',
    puris: 'पुऱ्या',
    mintWater: 'पुदिना पाणी',
    tamarindChutney: 'चिंच चटणी',
    sprouts: 'मोड आलेली कडधान्ये',

    // Status
    inStock: 'स्टॉकमध्ये',
    lowStock: 'कमी स्टॉक',
    outOfStock: 'स्टॉक नाही',
    delivered: 'पोहोचवले',
    pending: 'प्रलंबित',
    confirmed: 'पुष्टी',

    // Voice commands
    voiceHelp: 'आवाजातून विचारा',
    listening: 'ऐकत आहे...',
    speakNow: 'आता बोला',
  },
};

export const getTranslation = (key: keyof Translations, language: string): string => {
  return translations[language]?.[key] || translations['en'][key] || key;
};

export const voiceCommands = {
  hi: [
    '5 किलो आलू खरीदें',
    '10 किलो प्याज खरीदें',
    'टमाटर की कीमत',
    'आज के रेट दिखाओ',
    'स्टॉक चेक करो',
    'बेस्ट सप्लायर खोजो',
    'मेरा ऑर्डर दिखाओ',
    'बचत कितनी हुई',
    'क्रेडिट लिमिट बताओ',
    'डिलीवरी कब होगी',
    'मासिक ऑर्डर सेट करो',
    'स्टोरेज देखो',
    'बाजार की लिस्ट',
    'सप्लायर रेटिंग',
    'पेमेंट करो',
    'ऑर्डर कैंसल करो',
    'नए ऑफर',
    'हेल्प चाहिए'
  ],
  en: [
    'Buy 5kg potatoes',
    'Buy 10kg onions',
    'Tomato prices',
    'Show today\'s rates',
    'Check stock',
    'Find best supplier',
    'Show my orders',
    'How much saved',
    'Credit limit info',
    'Delivery time',
    'Set monthly order',
    'Check storage',
    'Market list',
    'Supplier rating',
    'Make payment',
    'Cancel order',
    'New offers',
    'Need help'
  ]
};
