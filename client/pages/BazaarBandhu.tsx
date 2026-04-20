import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  Mic,
  Send,
  ShoppingCart,
  Store,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
  Eye,
  Plus,
  Truck,
  IndianRupee,
  Users,
  Bell,
  Home,
  MessageCircle,
  BarChart3,
  Settings,
  Phone,
  Shield,
  Globe,
  MicOff,
  Volume2,
  Languages,
  Navigation,
  Timer,
  Leaf,
  Heart,
  Award,
  Target,
  Handshake,
  Activity,
  FileText,
  ShoppingBag,
  DollarSign,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  CreditCard,
  Wallet,
  QrCode,
  X,
  ThumbsUp,
  ThumbsDown,
  StarIcon,
  UserPlus,
  LogIn,
  Building2,
  Clipboard,
  Check,
  Building,
  Mail,
  User,
  Banknote,
  LogOut,
  Utensils,
  ChevronRight,
  Search,
  ShoppingBag as ShoppingBagIcon,
  MapPin as Location,
  Calendar as Cal,
  LineChart as LucideLineChart,
  FolderOpen,
  Snowflake,
  ShieldCheck,
  Edit2,
  Trash2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { VoiceButton } from "@/components/VoiceButton";
import { AdvancedFeatures } from "@/components/AdvancedFeatures";
import { InstallPWA } from "@/components/InstallPWA";
import InventoryManager from "@/components/InventoryManager";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { supportedLanguages as allAvailableLanguages, getTranslation, voiceCommands } from "@/lib/languages";

interface AIMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  voiceInput?: string;
  action?: {
    type: 'buy' | 'search' | 'check' | 'track' | 'subscribe';
    product?: string;
    quantity?: string;
    supplier?: string;
    price?: number;
    savings?: number;
  };
}

interface DeliveryTracking {
  id: string;
  orderId: string;
  status: 'confirmed' | 'packed' | 'dispatched' | 'in_transit' | 'delivered';
  vendor: string;
  items: string[];
  estimatedTime: string;
  currentLocation: string;
  driver: {
    name: string;
    phone: string;
    rating: number;
  };
  timeline: {
    time: string;
    status: string;
    completed: boolean;
    description: string;
  }[];
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'delivery';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
  actionHandler?: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  type: 'card' | 'wallet' | 'upi';
}

export default function BazaarBandhu() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && ['dashboard', 'ai-bandhu', 'bazaar', 'delivery', 'inventory', 'insights'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<any>(null);
  const [currentRating, setCurrentRating] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({
    productName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    costPrice: ''
  });
  const { addToCart, itemCount } = useCart();
  const [bazaarSearchQuery, setBazaarSearchQuery] = useState("");
  const [bazaarSelectedCategory, setBazaarSelectedCategory] = useState("all");

  const [headerStatusKey, setHeaderStatusKey] = useState<string>('');

  const [vendorData, setVendorData] = useState<any>(null);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [analytics, setAnalytics] = useState<any>({ stats: {}, dailyData: [] });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'insights') {
      const fetchAnalytics = async () => {
        try {
          setIsAnalyticsLoading(true);
          const data = await api.get('/vendors/analytics?period=month');
          setAnalytics(data);
        } catch (error) {
          console.error('Analytics fetch error:', error);
        } finally {
          setIsAnalyticsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && user.userType === 'vendor') {
      // Fetch full vendor profile if user is a vendor
      const fetchVendorProfile = async () => {
        try {
          const data = await api.get('/vendors/profile');
          setVendorData(data);
          if (data.appLanguage) {
            setSelectedLanguage(data.appLanguage === 'english' ? 'en' : data.appLanguage === 'hindi' ? 'hi' : data.appLanguage === 'marathi' ? 'mr' : data.appLanguage);
          }
        } catch (error) {
          console.error('Error fetching vendor profile:', error);
        }
      };
      fetchVendorProfile();

      // Fetch Recent Orders
      const fetchOrders = async () => {
        try {
          const data = await api.get('/orders?limit=5');
          setRecentOrders(data.orders || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
      fetchOrders();
    }

    // Fetch Suppliers
    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        const data = await api.get('/suppliers');
        setSuppliers(data.suppliers || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    fetchSuppliers();

    // Fetch dynamic status line
    api.get('/config/status-line')
      .then(data => {
        setHeaderStatusKey(data.statusKey);
      })
      .catch(err => console.error('Status fetch error:', err));
  }, [user]);

  // Fetch products when a supplier is selected
  useEffect(() => {
    if (selectedSupplier && selectedSupplier._id) {
      const fetchSupplierProducts = async () => {
        try {
          const data = await api.get(`/suppliers/${selectedSupplier._id}`);
          const productsArray = data.products || (data.supplier && data.supplier.products);
          
          if (productsArray) {
            const mappedProds = productsArray.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              price: p.pricePerUnit || p.price,
              marketPrice: p.marketPrice || (p.pricePerUnit || p.price) * 1.2,
              unit: p.unit,
              supplier: selectedSupplier.name,
              supplierId: selectedSupplier._id,
              image: p.image || '📦',
              category: p.category
            }));
            setProducts(mappedProds);
          }
        } catch (error) {
          console.error('Error fetching supplier products:', error);
        }
      };
      fetchSupplierProducts();
    }
  }, [selectedSupplier]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Supplier and Auth states
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');

  // Supplier registration form state
  const [supplierForm, setSupplierForm] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    pincode: '',
    productCategories: [] as string[],
    deliveryRadius: 10,
    minOrderAmount: 500,
    paymentMethods: [] as string[],
    workingHoursFrom: '06:00',
    workingHoursTo: '20:00',
    gstNumber: '',
    fssaiLicense: ''
  });

  // Login/Signup form state
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
    phone: ''
  });

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: '1',
      text: `👋 Welcome to BazaarBandhu! I'm your AI Business Assistant.\n\n🎤 I support voice commands — click the mic and speak!\n\nYou can ask me:\n🛒 "Buy 10kg onions" or "Order tomatoes"\n📊 "Show today's market rates"\n🚚 "Track my deliveries"\n📦 "Check my inventory"\n💰 "Show my savings"`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Enhanced products with real-time state
  const [products, setProducts] = useState([
    {
      id: '67be11111111111111111111',
      name: "Onions",
      price: 35,
      marketPrice: 45,
      unit: 'kg',
      trending: 'stable',
      savings: 10,
      supplier: 'Ravi Traders',
      stock: 500,
      quality: 'Premium',
      image: '🧅'
    },
    {
      id: '67be11111111111111111112',
      name: "Potatoes",
      price: 25,
      marketPrice: 30,
      unit: 'kg',
      trending: 'up',
      savings: 5,
      supplier: 'Ravi Traders',
      stock: 300,
      quality: 'A+',
      image: '🥔'
    },
    {
      id: '67be11111111111111111113',
      name: getTranslation('tamarindChutney', selectedLanguage),
      price: 85,
      marketPrice: 100,
      unit: 'kg',
      trending: 'stable',
      savings: 15,
      supplier: 'Maharaj Wholesale',
      stock: 50,
      quality: 'Sweet',
      image: '🍯'
    },
    {
      id: '67be11111111111111111114',
      name: getTranslation('sprouts', selectedLanguage),
      price: 60,
      marketPrice: 75,
      unit: 'kg',
      trending: 'down',
      savings: 15,
      supplier: 'Krishna Grains',
      stock: 80,
      quality: 'Fresh',
      image: '🥗'
    },
    {
      id: '67be11111111111111111115',
      name: "Fresh Tomatoes",
      price: 40,
      marketPrice: 50,
      unit: 'kg',
      trending: 'stable',
      savings: 10,
      supplier: 'Ravi Traders',
      stock: 200,
      quality: 'A+',
      image: '🍅'
    },
    {
      id: '67be11111111111111111116',
      name: "Puris",
      price: 0.5,
      marketPrice: 0.8,
      unit: 'pcs',
      trending: 'stable',
      savings: 0.3,
      supplier: 'Maharaj Wholesale',
      stock: 5000,
      quality: 'Crispy',
      image: '🥙'
    },
    {
      id: '67be11111111111111111117',
      name: "Mint Water",
      price: 20,
      marketPrice: 25,
      unit: 'Litre',
      trending: 'stable',
      savings: 5,
      supplier: 'Dairy Pure',
      stock: 100,
      quality: 'Spicy',
      image: '🥤'
    }
  ]);

  // Enhanced delivery tracking state
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryTracking[]>([
    {
      id: '1',
      orderId: 'BB-2025-001',
      status: 'in_transit',
      vendor: 'Ravi Traders',
      items: ['5kg Onions', '3kg Tomatoes'],
      estimatedTime: '12 mins',
      currentLocation: 'Sector 4, Market Road',
      driver: {
        name: 'Suresh Kumar',
        phone: '+91 98765 43210',
        rating: 4.8
      },
      timeline: [
        { time: '10:30', status: 'Order Confirmed', completed: true, description: 'Order received and confirmed' },
        { time: '11:00', status: 'Packed', completed: true, description: 'Items packed and ready' },
        { time: '11:15', status: 'Dispatched', completed: true, description: 'Out for delivery' },
        { time: '11:35', status: 'Arrived at Hub', completed: true, description: 'Sorted at local distribution center' },
        { time: '11:50', status: 'In Transit', completed: true, description: 'Out for final delivery' }
      ]
    },
    {
      id: '2',
      orderId: 'BB-2025-004',
      status: 'packed',
      vendor: 'Gupta Oil',
      items: ['10L Mustard Oil'],
      estimatedTime: '45 mins',
      currentLocation: 'Warehouse A',
      driver: {
        name: 'Amit Singh',
        phone: '+91 88776 65544',
        rating: 4.5
      },
      timeline: [
        { time: '12:05', status: 'Order Confirmed', completed: true, description: 'Order received' },
        { time: '12:20', status: 'Packed', completed: true, description: 'Ready for pickup' },
        { time: '12:45', status: 'Dispatching', completed: false, description: 'Awaiting driver' }
      ]
    }
  ]);

  // Enhanced stats state
  const [quickStats, setQuickStats] = useState({
    todaysSavings: 3250,
    totalOrders: 24,
    activeDeliveries: 2,
    groupMembers: 15,
    monthlySubscriptions: 5,
    trustScore: 92,
    deliverySuccess: 98,
    avgDeliveryTime: 28
  });

  const categories = [
    { id: "all", name: getTranslation('all' as any, selectedLanguage) || "All", count: 24, icon: Store },
    { id: "vegetables", name: getTranslation('vegetables' as any, selectedLanguage) || "Vegetables", count: 8, icon: Leaf },
    { id: "fruits", name: getTranslation('fruits', selectedLanguage), count: 7, icon: Heart },
    { id: "spices", name: getTranslation('spices', selectedLanguage), count: 6, icon: Utensils },
    { id: "dairy", name: getTranslation('dairy', selectedLanguage), count: 5, icon: ShoppingBag },
    { id: "oil", name: getTranslation('oil', selectedLanguage), count: 4, icon: Target },
    { id: "grains", name: getTranslation('rice', selectedLanguage), count: 6, icon: Package },
    { id: "bakery", name: getTranslation('bakery', selectedLanguage), count: 4, icon: ShoppingBagIcon },
    { id: "dry-goods", name: getTranslation('dryGoods', selectedLanguage), count: 5, icon: Clipboard },
    { id: "packaging", name: "Packaging", count: 3, icon: FolderOpen },
    { id: "flour", name: "Flour", count: 4, icon: Package },
    { id: "frozen", name: "Frozen Foods", count: 3, icon: Snowflake }
  ];

  const suppliersList = [
    {
      id: "69a0e6891822b72108f2b813",
      name: "Ravi Traders",
      owner: "Ravi Bhai Sharma",
      rating: 4.8,
      reviews: 156,
      distance: "1.2 km",
      verified: true,
      location: "Solapur Main Mandi",
      phone: "+91 98765 43210",
      category: "vegetables",
      speciality: ["Potatoes (आलू)", "Onions (प्याज)"],
      pricing: "wholesale",
      deliveryTime: "2-3 hours",
      minOrder: 500,
      trustScore: 92
    },
    {
      id: "67be00000000000000000002",
      name: "Maharaj Wholesale",
      owner: "Sunil Maharaj",
      rating: 4.6,
      reviews: 203,
      distance: "2.1 km",
      verified: true,
      location: "New Market Area",
      phone: "+91 87654 32109",
      category: "spices",
      speciality: ["Turmeric", "Red Chilli", "Coriander"],
      pricing: "competitive",
      deliveryTime: "3-4 hours",
      minOrder: 300,
      trustScore: 88
    },
    {
      id: "67be00000000000000000003",
      name: "Fresh Mandi",
      owner: "Ajay Kumar",
      rating: 4.4,
      reviews: 98,
      distance: "3.5 km",
      verified: false,
      location: "Kisan Market",
      phone: "+91 76543 21098",
      category: "vegetables",
      speciality: ["Green Veg", "Fruits"],
      pricing: "budget",
      deliveryTime: "4-5 hours",
      minOrder: 200,
      trustScore: 75
    },
    {
      id: "67be00000000000000000004",
      name: "Gupta Oil Depot",
      owner: "Ram Gupta",
      rating: 4.7,
      reviews: 112,
      distance: "1.8 km",
      verified: true,
      location: "Industrial Estate",
      phone: "+91 99887 76655",
      category: "oil",
      speciality: ["Mustard Oil", "Sunflower Oil"],
      pricing: "wholesale",
      deliveryTime: "1-2 hours",
      minOrder: 1000,
      trustScore: 94
    },
    {
      id: "67be00000000000000000005",
      name: "Krishna Grains",
      owner: "Krishna Dev",
      rating: 4.5,
      reviews: 84,
      distance: "4.2 km",
      verified: true,
      location: "Grain Market",
      phone: "+91 88776 65544",
      category: "grains",
      speciality: ["Wheat", "Rice", "Bajra"],
      pricing: "bulk",
      deliveryTime: "5-6 hours",
      minOrder: 2000,
      trustScore: 90
    },
    {
      id: "67be00000000000000000006",
      name: "Organic Orchard",
      owner: "Vikram Singh",
      rating: 4.9,
      reviews: 128,
      distance: "2.5 km",
      verified: true,
      location: "East Mandi",
      phone: "+91 91234 56789",
      category: "fruits",
      speciality: ["Apple", "Mango", "Banana"],
      pricing: "premium",
      deliveryTime: "1-2 hours",
      minOrder: 800,
      trustScore: 96
    },
    {
      id: "67be00000000000000000007",
      name: "Dairy Pure",
      owner: "Manish Dairywala",
      rating: 4.7,
      reviews: 215,
      distance: "0.8 km",
      verified: true,
      location: "Milk Colony",
      phone: "+91 92345 67890",
      category: "dairy",
      speciality: ["Milk", "Paneer", "Butter"],
      pricing: "wholesale",
      deliveryTime: "30 mins",
      minOrder: 100,
      trustScore: 95
    },
    {
      id: "67be00000000000000000008",
      name: "Golden Bakes",
      owner: "Anjali Bakery",
      rating: 4.5,
      reviews: 89,
      distance: "1.5 km",
      verified: false,
      location: "City Center",
      phone: "+91 93456 78901",
      category: "bakery",
      speciality: ["Bread", "Buns", "Cakes"],
      pricing: "standard",
      deliveryTime: "1 hour",
      minOrder: 150,
      trustScore: 82
    },
    {
      id: "67be00000000000000000009",
      name: "Saffron Valley",
      owner: "Zafar Iqbal",
      rating: 4.9,
      reviews: 67,
      distance: "5.2 km",
      verified: true,
      location: "Spice Market",
      phone: "+91 94567 89012",
      category: "spices",
      speciality: ["Saffron", "Cardamom", "Cloves"],
      pricing: "premium",
      deliveryTime: "1-2 days",
      minOrder: 1500,
      trustScore: 98
    },
    {
      id: 10,
      name: "NutriBite Dry Fruits",
      owner: "Karan Johar",
      rating: 4.6,
      reviews: 142,
      distance: "3.1 km",
      verified: true,
      location: "Wholesale Hub",
      phone: "+91 95678 90123",
      category: "dry-goods",
      speciality: ["Almonds", "Walnuts", "Cashews"],
      pricing: "bulk",
      deliveryTime: "4-5 hours",
      minOrder: 1000,
      trustScore: 89
    },
    {
      id: 11,
      name: "Himalayan Salts",
      owner: "Meera Devi",
      rating: 4.4,
      reviews: 53,
      distance: "6.5 km",
      verified: false,
      location: "Purity Lane",
      phone: "+91 96789 01234",
      category: "dry-goods",
      speciality: ["Pink Salt", "Rock Salt", "Black Salt"],
      pricing: "wholesale",
      deliveryTime: "24 hours",
      minOrder: 500,
      trustScore: 78
    }
  ];
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'delivery',
      title: 'Order Delivered!',
      message: 'Your onions order has been delivered successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: 'Rate Delivery',
      actionHandler: () => openRatingModal({
        orderId: 'BB-2025-001',
        supplier: 'Ravi Traders',
        items: ['5kg Onions', '3kg Tomatoes']
      })
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Tomatoes running low - only 3kg remaining',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      action: 'Reorder Now',
      actionHandler: () => handleBuyClick({
        name: 'Tomatoes',
        price: 92,
        unit: 'kg',
        supplier: 'Fresh Farms'
      }, 5)
    },
    {
      id: '3',
      type: 'success',
      title: 'Great Savings!',
      message: 'You saved ₹245 on today\'s purchases',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: 'upi', name: 'UPI Payment', icon: QrCode, type: 'upi' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, type: 'card' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, type: 'wallet' },
  ];



  // Update stateful translations when language changes
  useEffect(() => {
    setProducts(prev => prev.map(p => ({
      ...p,
      name: p.id === 'p1' ? getTranslation('puris', selectedLanguage) :
        p.id === 'p2' ? getTranslation('mintWater', selectedLanguage) :
          p.id === 'p3' ? getTranslation('tamarindChutney', selectedLanguage) :
            p.id === 'p4' ? getTranslation('sprouts', selectedLanguage) :
              p.id === 'p5' ? getTranslation('potatoes', selectedLanguage) :
                p.name
    })));
  }, [selectedLanguage]);

  // -------------------------------------------------------
  // PROFESSIONAL SPEECH RECOGNITION SETUP
  // -------------------------------------------------------
  const finalTranscriptRef = useRef<string>('');
  // Safe init with noop — useEffect below keeps it updated to latest sendChatMessage
  // (avoids JS Temporal Dead Zone since sendChatMessage is declared later in the file)
  const sendChatRef = useRef<(text: string, voice?: string) => void>(() => { });
  useEffect(() => { sendChatRef.current = sendChatMessage; }); // no deps = runs after every render


  const buildRecognition = (lang: string) => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return null;

    const rec = new SpeechRecognitionClass();
    rec.continuous = true; // Stay active until user stops (better for professional flow)
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    const langMap: any = { 'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN' };
    rec.lang = langMap[lang] || 'en-IN';

    rec.onstart = () => {
      finalTranscriptRef.current = '';
      setIsListening(true);
      setIsVoiceActive(true);
      setVoiceTranscript('');
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalText) finalTranscriptRef.current += finalText;
      setVoiceTranscript(finalTranscriptRef.current || interim);
    };

    rec.onerror = (event: any) => {
      console.warn('Voice recognition error:', event.error);
      setIsListening(false);
      setIsVoiceActive(false);
      setVoiceTranscript('');
      if (event.error === 'not-allowed') {
        toast.error('🎤 Microphone access denied. Please allow microphone in browser settings.');
      } else if (event.error === 'no-speech') {
        toast.info('No speech detected. Please try again.');
      }
    };

    rec.onend = () => {
      setIsListening(false);
      setIsVoiceActive(false);
      const spoken = finalTranscriptRef.current.trim();
      finalTranscriptRef.current = '';
      setVoiceTranscript('');
      if (spoken) {
        setCurrentMessage(spoken);
        // Use ref so we always call the latest sendChatMessage (no stale closure)
        setTimeout(() => sendChatRef.current(spoken, spoken), 300);
      }
    };

    return rec;
  };

  // Build recognition on mount and whenever language changes
  useEffect(() => {
    const rec = buildRecognition(selectedLanguage);
    if (rec) recognition.current = rec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  const handleVoiceToggle = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      toast.error('🎤 Voice not supported. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop gracefully — onend will fire and send the transcript
      recognition.current?.stop();
      return;
    }

    // Automatically switch to the AI tab so user can see the chatbot's work
    setActiveTab('ai-bandhu');

    // Always build a fresh recognition instance on each mic press
    // This avoids the "already started" / stuck state that Chrome can cause
    const freshRec = buildRecognition(selectedLanguage);
    if (!freshRec) return;
    recognition.current = freshRec;

    try {
      recognition.current.start();
    } catch (e: any) {
      console.warn('Recognition start error:', e);
      toast.error('🎤 Could not start microphone. Please try again.');
    }
  };

  // -------------------------------------------------------
  // TEXT-TO-SPEECH HELPER
  // -------------------------------------------------------
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[#*`✅🏪💰🔢💡⭐🚚🤖📊📦🔴🟡🟢⚠️👋🛒🎤🍅🥔🧅🍯🥗🥙🥤]/g, '').replace(/\n/g, ' ').trim();
    if (!cleaned) return;
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const langMap: any = { 'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN' };
    utterance.lang = langMap[selectedLanguage] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    // Chrome bug: needs a short delay and resume to ensure it speaks
    setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // -------------------------------------------------------
  // CORE CHAT ENGINE (voice-safe: uses refs, not stale closure)
  // -------------------------------------------------------
  const productsRef = useRef(products);
  const deliveriesRef = useRef(activeDeliveries);
  const quickStatsRef = useRef(quickStats);
  const vendorDataRef = useRef(vendorData);
  const selectedLangRef = useRef(selectedLanguage);
  const aiMessagesRef = useRef(aiMessages);

  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { deliveriesRef.current = activeDeliveries; }, [activeDeliveries]);
  useEffect(() => { quickStatsRef.current = quickStats; }, [quickStats]);
  useEffect(() => { vendorDataRef.current = vendorData; }, [vendorData]);
  useEffect(() => { selectedLangRef.current = selectedLanguage; }, [selectedLanguage]);
  useEffect(() => { aiMessagesRef.current = aiMessages; }, [aiMessages]);

  const sendChatMessage = async (text: string, voiceInput?: string) => {
    if (!text.trim()) return;

    const lang = selectedLangRef.current;
    const prods = productsRef.current;
    const deliveries = deliveriesRef.current;
    const stats = quickStatsRef.current;
    const inv = vendorDataRef.current;
    const prevMessages = aiMessagesRef.current;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      voiceInput
    };

    setAiMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    const addAIReply = (replyText: string, action?: any) => {
      const msg: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: 'ai',
        timestamp: new Date(),
        action
      };
      setAiMessages(prev => [...prev, msg]);
      // Speak the response
      speakText(replyText);
    };

    try {
      const lowerText = text.toLowerCase();

      // --- Purchase Confirmation ---
      const lastAiMsg = prevMessages[prevMessages.length - 1];
      if (lastAiMsg?.sender === 'ai' && lastAiMsg.action?.type === 'buy' &&
        (lowerText === 'yes' || lowerText === 'हां' || lowerText === 'हो' || lowerText === 'ho' ||
          lowerText.includes('confirm') || lowerText.includes('pay') || lowerText.includes('place') ||
          lowerText.includes('हाँ') || lowerText.includes('ok'))) {

        const confirmText = lang === 'hi'
          ? `🚀 बढ़िया! ${lastAiMsg.action.quantity} ${lastAiMsg.action.product} का ऑर्डर confirm हो गया। Payment gateway खुल रही है।`
          : `🚀 Confirmed! Opening payment for ${lastAiMsg.action.quantity} ${lastAiMsg.action.product} from ${lastAiMsg.action.supplier}.`;

        const product = prods.find(p => p.name.toLowerCase().includes(lastAiMsg.action?.product?.toLowerCase() || '')) || prods[0];
        const qtyMatch = lastAiMsg.action?.quantity?.match(/\d+/);
        handleBuyClick(product, qtyMatch ? parseInt(qtyMatch[0]) : 1);
        addAIReply(confirmText);
        setIsAiTyping(false);
        return;
      }

      // --- 1. TRY INTELLIGENT BACKEND FIRST (Real Agent) ---
      let res: any = null;
      try {
        res = await api.post('/ai-chat', {
          message: text,
          language: lang,
          context: {
            inventory: inv,
            products: prods.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              marketPrice: p.marketPrice,
              unit: p.unit,
              supplier: p.supplier,
              stock: p.stock
            })),
            activeDeliveries: deliveries.map(d => ({
              orderId: d.orderId,
              status: d.status,
              eta: d.estimatedTime
            })),
            shopStats: stats,
            user: {
              fullName: (user as any)?.fullName,
              businessName: (inv as any)?.businessName,
              category: (inv as any)?.businessCategory
            }
          }
        });
      } catch (err) {
        console.error("AI Backend fallback triggered:", err);
      }

      if (res?.reply) {
        addAIReply(res.reply, res.action || null);
        if (res.action?.type === 'buy') {
          setTimeout(() => {
            const tipText = lang === 'hi'
              ? '💡 आप "Confirm" बोलकर अभी ऑर्डर कर सकते हैं!'
              : '💡 You can say "Confirm" to place the order right now!';
            setAiMessages(prev => [...prev, { id: Date.now().toString(), text: tipText, sender: 'ai', timestamp: new Date() }]);
          }, 1500);
        }
        setIsAiTyping(false);
        return;
      }

      // --- 2. LOCAL FALLBACKS (ONLY IF BACKEND FAILS) ---
      // --- Buy / Order intent (Simple fallback) ---
      const buyKeywords = ['buy', 'order', 'purchase', 'need', 'खरीद', 'ऑर्डर', 'चाहिए'];
      const hasBuyIntent = buyKeywords.some(k => lowerText.includes(k));

      if (hasBuyIntent) {
        const matchedProduct = prods.find(p => 
          lowerText.includes(p.name.toLowerCase()) || 
          p.name.toLowerCase().split(' ').some(word => word.length > 2 && lowerText.includes(word))
        );
        if (matchedProduct) {
          const replyText = lang === 'hi'
            ? `🛒 मैं आपके लिए ${matchedProduct.name} का ऑर्डर तैयार कर सकता हूँ। क्या आप confirm करना चाहते हैं?`
            : `🛒 I can prepare an order for ${matchedProduct.name}. Would you like to confirm?`;

          addAIReply(replyText, {
            type: 'buy',
            product: matchedProduct.name,
            quantity: `10${matchedProduct.unit}`,
            supplier: matchedProduct.supplier,
            price: matchedProduct.price * 10,
            savings: (matchedProduct.marketPrice - matchedProduct.price) * 10
          });
          setIsAiTyping(false);
          return;
        }
      }

      // --- Smart local fallback ---
      let fallbackResponse = '';
      if (lowerText.match(/rate|price|today|भाव|रेट|दाम/)) {
        const topProducts = prods.slice(0, 6).map(p =>
          `• ${p.name}: ₹${p.price}/${p.unit}  (Market: ₹${p.marketPrice}/${p.unit})  → Save ₹${p.marketPrice - p.price}`
        ).join('\n');
        fallbackResponse = lang === 'hi'
          ? `📊 आज के बाज़ार भाव:\n\n${topProducts}\n\n💰 BazaarBandhu पर market से सस्ता मिलता है!`
          : `📊 Today's Market Rates:\n\n${topProducts}\n\n💰 BazaarBandhu prices beat the market every day!`;

      } else if (lowerText.match(/inventory|stock|इन्वेंटरी|स्टॉक|सामान/)) {
        const invItems = (inv as any)?.currentInventory || [];
        if (invItems.length > 0) {
          const stockList = invItems.slice(0, 6).map((item: any) =>
            `• ${item.productName}: ${item.quantity} ${item.unit} ${item.quantity < 5 ? '⚠️ LOW' : '✅'}`
          ).join('\n');
          fallbackResponse = lang === 'hi'
            ? `📦 आपका मौजूदा स्टॉक:\n\n${stockList}`
            : `📦 Current Inventory Status:\n\n${stockList}`;
        } else {
          fallbackResponse = lang === 'hi'
            ? '📦 आपका इन्वेंटरी खाली है। Inventory tab पर जाकर items add करें!'
            : '📦 Your inventory is empty. Go to the Inventory tab to add items!';
        }

      } else if (lowerText.match(/order|delivery|track|डिलीवरी|ऑर्डर|ट्रैक/)) {
        if (deliveries.length > 0) {
          const info = deliveries.map(d =>
            `• Order #${d.orderId}: ${d.status.replace(/_/g, ' ')} — ETA: ${d.estimatedTime}`
          ).join('\n');
          fallbackResponse = lang === 'hi'
            ? `🚚 Active Deliveries:\n\n${info}`
            : `🚚 Active Deliveries:\n\n${info}`;
        } else {
          fallbackResponse = lang === 'hi'
            ? '🚚 अभी कोई active delivery नहीं है। Bazaar tab से order करें!'
            : '🚚 No active deliveries right now. Place an order from the Bazaar tab!';
        }

      } else if (lowerText.match(/saving|save|बचत|पैसे/)) {
        fallbackResponse = lang === 'hi'
          ? `💰 आपकी बचत:\n\n• आज की बचत: ₹${stats.todaysSavings}\n• कुल ऑर्डर: ${stats.totalOrders}\n• Active Deliveries: ${stats.activeDeliveries}\n\nBazaarBandhu से market rate पर हमेशा बचत होती है!`
          : `💰 Your Savings Summary:\n\n• Today's Savings: ₹${stats.todaysSavings}\n• Total Orders: ${stats.totalOrders}\n• Active Deliveries: ${stats.activeDeliveries}\n\nKeep ordering to maximize savings!`;

      } else if (lowerText.match(/\bhello\b|\bhi\b|\bनमस्ते\b|\bनमस्कार\b/i)) {
        const name = (user as any)?.fullName?.split(' ')[0] || 'there';
        fallbackResponse = lang === 'hi'
          ? `👋 नमस्ते ${name} जी! मैं BazaarBandhu AI हूँ।\n\nमैं आपकी इन बातों में मदद कर सकता हूँ:\n📊 \"आज के रेट दिखाओ\"\n📦 \"इन्वेंटरी चेक करो\"\n🚚 \"डिलीवरी ट्रैक करो\"\n🛒 \"10 किलो प्याज खरीदें\"\n💰 \"मेरी बचत दिखाओ\"`
          : `👋 Hello ${name}! I'm your BazaarBandhu AI Assistant.\n\nI can help you with:\n📊 "Show today's rates"\n📦 "Check inventory"\n🚚 "Track deliveries"\n🛒 "Buy 10kg onions"\n💰 "Show my savings"`;
      } else {
        fallbackResponse = lang === 'hi'
          ? `🤖 मैं समझ नहीं पाया। आप यह try करें:\n• "आज के रेट दिखाओ"\n• "10 किलो टमाटर खरीदें"\n• "इन्वेंटरी चेक करो"\n• "डिलीवरी ट्रैक करो"`
          : `🤖 I didn't quite catch that. Try:\n• "Show today's rates"\n• "Buy 10kg tomatoes"\n• "Check my inventory"\n• "Track my delivery"`;
      }

      addAIReply(fallbackResponse);

    } catch (error) {
      console.error('Chat error:', error);
      addAIReply('⚠️ Something went wrong. Please try again.');
    } finally {
      setIsAiTyping(false);
    }
  };

  // Alias for UI button clicks
  const handleAIMessage = sendChatMessage;





  const handleBuyClick = (product: any, quantity: number = 1) => {
    const total = product.price * quantity;
    const savings = product.savings ? product.savings * quantity : 0;

    setCurrentPurchase({
      product: product.name,
      productId: product.id,
      quantity,
      unit: product.unit,
      pricePerUnit: product.price,
      total,
      savings,
      supplier: product.supplier,
      supplierId: product.supplierId,
      image: product.image,
      category: product.category
    });
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === 'cash') {
      // Handle cash on delivery
      setShowPaymentModal(false);
      processOrderSuccess();
      return;
    }

    // Razorpay Integration for Digital Payments
    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // 1. Create Order on Backend
      const token = localStorage.getItem('token');
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: currentPurchase.total,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const rzpOrder = await orderRes.json();

      if (!rzpOrder.id) {
        alert("Failed to create Razorpay order");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SL6qOzy3RPxIKM',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "BazaarBandhu",
        description: `Purchase of ${currentPurchase.product}`,
        image: "/favicon.ico",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            setShowPaymentModal(false);
            processOrderSuccess();
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: user?.fullName || "Vijay Shukla",
          email: user?.email || "vijay@puri.com",
          contact: user?.phone || "9999988888"
        },
        theme: {
          color: "#16a34a"
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment failed:", error);
      alert("Something went wrong during payment initiation.");
    }
  };

  const processOrderSuccess = async () => {
    try {
      // 1. Save specific order to Database
      const orderPayload = {
        supplierId: currentPurchase.supplierId,
        items: [{
          productId: currentPurchase.productId,
          productName: currentPurchase.product,
          quantity: currentPurchase.quantity,
          unit: currentPurchase.unit,
          pricePerUnit: currentPurchase.pricePerUnit,
          category: currentPurchase.category || 'General'
        }],
        totalAmount: currentPurchase.total,
        paymentMethod: selectedPaymentMethod,
        timeSlot: "Immediate",
        deliveryAddress: user?.addressDetails || {
          street: "Default Street",
          city: "Default City",
          state: "Default State",
          pincode: "000000"
        }
      };

      await api.post('/orders', orderPayload);
      console.log("Order saved to database successfully");

    } catch (error) {
      console.error("Failed to save order to database:", error);
      toast.error("Order placed locally but database sync failed.");
    }

    // Update Application State
    setProducts(prev => prev.map(p =>
      p.name === currentPurchase.product
        ? { ...p, stock: Math.max(0, p.stock - currentPurchase.quantity) }
        : p
    ));

    const newDelivery: DeliveryTracking = {
      id: Date.now().toString(),
      orderId: `BB-2025-${Math.floor(100 + Math.random() * 900)}`,
      status: 'confirmed',
      vendor: currentPurchase.supplier,
      items: [`${currentPurchase.quantity}${currentPurchase.unit} ${currentPurchase.product}`],
      estimatedTime: '30 mins',
      currentLocation: 'Vendor Warehouse',
      driver: {
        name: 'Suresh Kumar',
        phone: '+91 98765 43210',
        rating: 4.8
      },
      timeline: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'Order Confirmed', completed: true, description: 'Order received' }
      ]
    };

    setActiveDeliveries(prev => [newDelivery, ...prev]);

    setQuickStats(prev => ({
      ...prev,
      todaysSavings: prev.todaysSavings + currentPurchase.savings,
      totalOrders: prev.totalOrders + 1,
      activeDeliveries: prev.activeDeliveries + 1
    }));

    // Add success notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      title: 'Order Placed Successfully!',
      message: `Your order for ${currentPurchase.quantity}${currentPurchase.unit} ${currentPurchase.product} has been placed`,
      timestamp: new Date(),
      read: false,
      action: 'Track Order'
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show success alert
    alert(`🎉 Order placed successfully!\n\nProduct: ${currentPurchase.quantity}${currentPurchase.unit} ${currentPurchase.product}\nTotal: ₹${currentPurchase.total}\nSavings: ₹${currentPurchase.savings}\n\nYour order will be delivered in 25-30 minutes!`);

    setCurrentPurchase(null);
    setSelectedPaymentMethod('');
  };

  const openRatingModal = (orderData: any) => {
    setCurrentRating(orderData);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    // Simulate rating submission
    setShowRatingModal(false);

    alert(`🌟 Thank you for your feedback!\n\nRating: ${rating}/5 stars\nReview: ${reviewText || 'No review provided'}\n\nYour feedback helps us improve our service!`);

    // Reset rating modal data
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setCurrentRating(null);

    // Mark notification as read
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === '1' ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDownloadReport = () => {
    // Collect data from vendorData and stats
    const reportDate = new Date().toLocaleDateString();
    const headers = ["Business Report - BazaarBandhu", "Date: " + reportDate];
    const section1 = ["", "--- FINANCIAL SUMMARY ---"];
    const financialData = [
      ["Metric", "Value"],
      ["Total Business Spending", "INR " + (vendorData?.totalSpent || 12450).toLocaleString()],
      ["AI-Driven Smart Savings", "INR " + (vendorData?.totalSavings || 1840).toLocaleString()],
      ["Current Marketplace Credit", "INR " + (vendorData?.currentCredit || 4200).toLocaleString()],
      ["Month-on-Month Growth", "12%"]
    ];

    const section2 = ["", "--- RECENT TRANSACTIONS ---"];
    const transactions = [
      ["Date", "Supplier", "Items Purchased", "Amount Paid", "Savings"],
      ["24 Feb", "Fresh Farms", "Tomatoes and Potatoes", "INR 1240", "INR 180"],
      ["22 Feb", "Ravi Traders", "Onions and Dry Fruits", "INR 850", "INR 120"],
      ["Today", currentPurchase?.supplier || "N/A", `${currentPurchase?.quantity || 0}${currentPurchase?.unit || ""} ${currentPurchase?.product || ""}`, "INR " + (currentPurchase?.total || 0), "INR " + (currentPurchase?.savings || 0)]
    ];

    const section3 = ["", "--- INVENTORY HEALTH ---"];
    const inventory = [
      ["Product Name", "Current Stock", "Status"],
      ...(vendorData?.currentInventory || []).map((item: any) => [
        item.productName,
        `${item.quantity} ${item.unit}`,
        item.quantity <= (item.threshold || 5) ? "LOW STOCK" : "Healthy"
      ])
    ];

    const formatRow = (row: string[]) => row.join(",");

    const csvContent = "data:text/csv;charset=utf-8,"
      + [
        headers.join(","),
        ...section1.map(r => r),
        ...financialData.map(formatRow),
        ...section2.map(r => r),
        ...transactions.map(formatRow),
        ...section3.map(r => r),
        ...inventory.map(formatRow),
        "",
        "Footer: Generated by BazaarBandhu AI Assistant"
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Business_Report_${reportDate.replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Business report generated successfully!');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const submitInventoryUpdate = async () => {
    try {
      if (!newInventoryItem.productName || !newInventoryItem.quantity || !newInventoryItem.costPrice || !newInventoryItem.category) {
        toast.error("Please fill all required fields including Category");
        return;
      }

      const payload = {
        product: {
          ...newInventoryItem,
          quantity: Number(newInventoryItem.quantity),
          costPrice: Number(newInventoryItem.costPrice),
        },
      };

      await api.patch('/vendors/inventory', payload);
      toast.success("Inventory updated successfully!");
      setShowInventoryModal(false);

      const data = await api.get('/vendors/profile');
      setVendorData(data);
      setNewInventoryItem({ productName: '', category: '', quantity: '', unit: 'kg', costPrice: '' });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const addSupplierProductToCart = (product: any, qty: number) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      unit: product.unit,
      supplierId: selectedSupplier?.id?.toString() || selectedSupplier?._id?.toString() || '0',
      supplierName: selectedSupplier?.name || 'Supplier',
    });
    toast.success(`Added ${qty}${product.unit} ${product.name} to cart`);
  };

  const addMinimumOrderLot = () => {
    addToCart({
      id: 'gen-1',
      name: 'General Supplies',
      price: selectedSupplier?.minOrder || 500,
      quantity: 1,
      unit: 'lot',
      supplierId: selectedSupplier?.id?.toString() || selectedSupplier?._id?.toString() || '0',
      supplierName: selectedSupplier?.name || 'Supplier',
    });
    toast.success("Added minimum order lot to cart");
  };

  const proceedToCheckout = () => {
    if (itemCount > 0) {
      navigate('/checkout');
      toast.success("Proceeding to cart for payment...");
      return;
    }

    toast.info("Your cart is empty. Please add some items first.");
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header with BazaarBandhu Branding */}
      <header className="glass-card marketplace-shadow sticky top-0 z-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 slide-in">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-2xl marketplace-floating">
                <Handshake className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent bazaar-glow flex items-center gap-2">
                  BazaarBandhu
                  {!isOnline && (
                    <Badge variant="outline" className="text-[8px] bg-red-50 text-red-600 border-red-200 animate-pulse">OFFLINE MODE</Badge>
                  )}
                </h1>
                <p className="text-sm font-medium bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent italic">
                  {headerStatusKey ? getTranslation('headerStatus', selectedLanguage) : '...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select
                value={selectedLanguage}
                onValueChange={async (value) => {
                  setSelectedLanguage(value);
                  if (user) {
                    try {
                      await api.put('/vendors/profile', { appLanguage: value });
                      toast.success(value === 'hi' ? 'भाषा बदल दी गई है' : 'Language changed successfully');
                    } catch (error) {
                      console.error('Failed to update language:', error);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-32 glow-border fade-in">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allAvailableLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Login Button or User Profile */}
              {!user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="glow-border marketplace-floating"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full marketplace-floating">
                      <Avatar className="h-10 w-10 border-2 border-green-500">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                          {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user?.fullName}</p>
                        {vendorData?.businessName && (
                          <p className="text-xs font-medium text-green-600">{vendorData.businessName}</p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground pt-1">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <div className="relative">
                <Button variant="outline" size="sm" className="relative marketplace-floating">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs bounce-in">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative marketplace-floating border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => navigate('/checkout')}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-600 text-white text-[10px] p-0 flex items-center justify-center bounce-in">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <InstallPWA />
        {/* Voice Assistant Alert */}
        {isListening && (
          <Card className="mb-6 gradient-card animated-border border-green-200 fade-in">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">🎤 AI सुन रहा है... बोलिए!</p>
                  <p className="text-sm text-green-700">
                    {voiceTranscript ? `आपने कहा: "${voiceTranscript}"` : 'Example: "5 किलो प्याज खरीदें" या "आज के रेट दिखाओ"'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className="text-red-600 border-red-300"
                >
                  <MicOff className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Quick Stats with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="gradient-card marketplace-shadow marketplace-floating cursor-pointer slide-in">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">{getTranslation('todaysSavings', selectedLanguage)}</p>
                  <p className="text-2xl font-bold text-green-900">₹{quickStats.todaysSavings.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12% {getTranslation('fromYesterday', selectedLanguage)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card marketplace-shadow marketplace-floating cursor-pointer slide-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">{getTranslation('activeDeliveries', selectedLanguage)}</p>
                  <p className="text-2xl font-bold text-blue-900">{quickStats.activeDeliveries}</p>
                  <p className="text-xs text-blue-600">
                    {getTranslation('avgDeliveryTime', selectedLanguage)}: {quickStats.avgDeliveryTime} mins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card marketplace-shadow marketplace-floating cursor-pointer slide-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">{getTranslation('groupMembers', selectedLanguage)}</p>
                  <p className="text-2xl font-bold text-orange-900">{quickStats.groupMembers}</p>
                  <p className="text-xs text-orange-600">{getTranslation('cooperativeNetwork', selectedLanguage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card marketplace-shadow marketplace-floating cursor-pointer slide-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">{getTranslation('successRate', selectedLanguage)}</p>
                  <p className="text-2xl font-bold text-purple-900">{quickStats.deliverySuccess}%</p>
                  <p className="text-xs text-purple-600">{getTranslation('deliverySuccess', selectedLanguage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.userType === 'admin' && (
          <Card className="marketplace-shadow border-none bg-slate-900 overflow-hidden mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-800 p-2 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">System Admin Panel</h3>
                  <p className="text-slate-400 text-xs">Manage vendors, suppliers, and system-wide settings.</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                onClick={() => navigate('/admin')}
              >
                Go to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm marketplace-shadow">
            <TabsTrigger value="dashboard" className="glow-border">
              <Home className="h-4 w-4 mr-2" />
              {getTranslation('dashboard', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="ai-bandhu" className="glow-border">
              <Bot className="h-4 w-4 mr-2" />
              Saarthi Assistant
            </TabsTrigger>
            <TabsTrigger value="bazaar" className="glow-border">
              <Store className="h-4 w-4 mr-2" />
              {getTranslation('markets', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="delivery" className="glow-border">
              <Truck className="h-4 w-4 mr-2" />
              {getTranslation('activeDeliveries', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="glow-border">
              <Package className="h-4 w-4 mr-2" />
              Stock Management
            </TabsTrigger>
            <TabsTrigger value="insights" className="glow-border">
              <LucideLineChart className="h-4 w-4 mr-2" />
              {getTranslation('insights', selectedLanguage)}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 🎯 Hyper-Personalisation: Recommended for You */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="gradient-card marketplace-shadow overflow-hidden border-orange-100">
                  <CardHeader className="bg-orange-50/50 pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span>Hyper-Personalised Picks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <p className="text-[10px] text-orange-800 font-medium bg-orange-100/50 p-1.5 rounded-lg border border-orange-200">
                      Based on your {vendorData?.businessCategory || 'street food'} sales patterns
                    </p>
                    {products.slice(0, 3).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/40 transition-colors border border-transparent hover:border-orange-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{product.image}</span>
                          <div>
                            <p className="text-xs font-bold">{product.name}</p>
                            <p className="text-[10px] text-gray-500">₹{product.price}/{product.unit}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-orange-600" onClick={() => handleBuyClick(product, 1)}>
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 📦 Supply Chain Resilience: Trust Score */}
                <Card className="gradient-card marketplace-shadow border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Supply Chain Resilience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-bold text-gray-600">Vendor Reliability</span>
                        <span className="font-bold text-blue-600">{quickStats.trustScore}%</span>
                      </div>
                      <Progress value={quickStats.trustScore} className="h-1.5 bg-blue-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-gray-500 uppercase font-bold text-[8px]">On-Time Rate</p>
                        <p className="text-blue-700 font-bold">{quickStats.deliverySuccess}%</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <p className="text-gray-500 uppercase font-bold text-[8px]">Alt suppliers</p>
                        <p className="text-green-700 font-bold">4 Linked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Central Area: Unified Commerce & AI Merchandising */}
              <div className="lg:col-span-2 space-y-6">
  
                {/* 🛒 Unified Commerce: Smart Purchase Hub */}
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Handshake className="h-5 w-5 text-green-600" />
                      <span>Unified Commerce Hub</span>
                      <Badge className="bg-green-100 text-green-800">Connected Marketplace</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {products.filter(p => {
                        // Personalize Smart Purchase Hub based on business category
                        if (!vendorData?.businessCategory) return true;
                        const category = vendorData.businessCategory.toLowerCase();
                        if (category.includes('pani puri')) {
                          return ['onions', 'potatoes', 'tamarind chutney', 'mint water', 'puris'].includes(p.name.toLowerCase());
                        }
                        if (category.includes('vada pav')) {
                          return ['potatoes', 'oil', 'flour', 'green chilies'].includes(p.name.toLowerCase());
                        }
                        return true; // Show all if no specific match
                      }).slice(0, 4).map((product, index) => (
                        <div key={index} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border marketplace-floating">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{product.image}</span>
                              <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-xs text-gray-600">{product.supplier}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">₹{product.price}/{product.unit}</p>
                              <p className="text-xs text-gray-500 line-through">₹{product.marketPrice}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <Badge className={cn(
                              "text-xs",
                              product.trending === 'down' ? "bg-green-100 text-green-800" :
                                product.trending === 'up' ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                            )}>
                              {product.trending === 'down' ? '↓' : product.trending === 'up' ? '↑' : '→'}
                              {product.trending === 'down' ? 'Falling' : product.trending === 'up' ? 'Rising' : 'Stable'}
                            </Badge>
                            <span className="text-xs text-green-600 font-medium">Save ₹{product.savings}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                product.stock > 100 ? "bg-green-500" :
                                  product.stock > 50 ? "bg-yellow-500" : "bg-red-500"
                              )} />
                              <span className="text-xs">{product.stock}kg available</span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              onClick={() => handleBuyClick(product, 5)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 marketplace-floating"
                      onClick={() => setActiveTab('ai-bandhu')}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Collaborate with Saarthi Assistant
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Alerts & Automation */}
              <div className="space-y-6 lg:col-span-1">
                {/* Business Alerts */}
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>{getTranslation('businessAlerts', selectedLanguage) || 'Business Alerts'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Dynamic Low Stock Alerts */}
                    {vendorData?.currentInventory?.filter((item: any) => (item.quantity || 0) <= (item.threshold || 5)).length > 0 ? (
                      vendorData.currentInventory
                        .filter((item: any) => (item.quantity || 0) <= (item.threshold || 5))
                        .slice(0, 2)
                        .map((item: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-3 marketplace-floating">
                            <Package className="h-4 w-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-900">Low Stock: {item.productName}</p>
                              <p className="text-xs text-red-700">Only {item.quantity}{item.unit} left. Reorder point: {item.threshold || 5}{item.unit}.</p>
                              <Button
                                size="sm"
                                variant="link"
                                className="p-0 h-auto text-xs text-red-800 font-bold mt-1"
                                onClick={() => setActiveTab('bazaar')}
                              >
                                Reorder Now →
                              </Button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900">All Stocks Healthy</p>
                          <p className="text-xs text-green-700">No critical low stock items today.</p>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Payment/Orders Alert */}
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 flex items-start space-x-3">
                      <IndianRupee className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900">Business Health Good</p>
                        <p className="text-xs text-orange-700">You saved ₹{vendorData?.savings?.totalSaved?.toLocaleString() || '450'} this month!</p>
                        <Button size="sm" variant="link" className="p-0 h-auto text-xs text-orange-800 font-bold mt-1" onClick={() => setActiveTab('insights')}>
                          View Savings Report →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Reports Card moved up or other content */}


                {/* Quick Reports Card */}
                <Card className="gradient-card marketplace-shadow">
                  <CardContent className="p-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between text-sm glow-border"
                      onClick={() => setActiveTab('insights')}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-purple-600" />
                        View Monthly Report
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Bandhu Tab */}
          <TabsContent value="ai-bandhu" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Voice Commands Sidebar */}
              <Card className="gradient-card marketplace-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-green-600" />
                    <span>Voice Commands</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {voiceCommands[selectedLanguage as keyof typeof voiceCommands]?.slice(0, 8).map((command, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 marketplace-floating"
                      onClick={() => handleAIMessage(command)}
                    >
                      <Mic className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-left">{command}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* AI Chat Interface */}
              <div className="lg:col-span-3">
                <Card className="gradient-card marketplace-shadow h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 marketplace-floating">
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
                            <Bot className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">Saarthi Assistant</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">
                              {isListening ? 'Listening...' : 'Ready to Help'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          {allAvailableLanguages.find(l => l.code === selectedLanguage)?.nativeName}
                        </Badge>
                        <Button
                          variant={isListening ? "destructive" : "outline"}
                          size="sm"
                          onClick={handleVoiceToggle}
                          className="marketplace-shadow"
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
                    {aiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start space-x-3 fade-in",
                          message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={cn(
                            "text-white text-sm",
                            message.sender === "ai"
                              ? "bg-gradient-to-br from-green-600 to-blue-600"
                              : "bg-gradient-to-br from-blue-500 to-cyan-500"
                          )}>
                            {message.sender === "ai" ? <Bot className="h-4 w-4" /> : "V"}
                          </AvatarFallback>
                        </Avatar>

                        <div className={cn(
                          "max-w-[80%] rounded-xl px-4 py-3 marketplace-shadow",
                          message.sender === "ai"
                            ? "bg-gradient-to-r from-gray-50 to-white text-gray-900"
                            : "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                        )}>
                          {message.voiceInput && message.sender === "user" && (
                            <div className="mb-2 pb-2 border-b border-white/20">
                              <p className="text-xs opacity-75">🎤 Voice Input:</p>
                              <p className="text-sm italic">"{message.voiceInput}"</p>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line font-medium">{message.text}</p>
                          {message.action && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 w-full"
                                onClick={() => {
                                  const product = products.find(p => p.name.toLowerCase().includes(message.action?.product?.toLowerCase() || '')) || products[0];
                                  const quantity = parseInt(message.action?.quantity?.replace(/\D/g, '') || '5');
                                  handleBuyClick(product, quantity);
                                }}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Open Payment ₹{message.action.price}
                              </Button>
                              {message.action.savings && (
                                <p className="text-xs text-green-600 text-center">
                                  💰 You'll save ₹{message.action.savings} with this order!
                                </p>
                              )}
                            </div>
                          )}
                          <p className={cn(
                            "text-xs mt-2",
                            message.sender === "ai" ? "text-gray-500" : "text-green-100"
                          )}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex items-start space-x-3 fade-in">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 marketplace-shadow">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Enhanced Input Area */}
                  <div className="border-t p-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={isListening ? "destructive" : "outline"}
                        size="sm"
                        onClick={handleVoiceToggle}
                        className="flex-shrink-0 marketplace-shadow"
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>

                      <div className="flex-1 relative">
                        <Input
                          placeholder={isListening ? `Listening... ${voiceTranscript}` : "Type or speak your request..."}
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAIMessage(currentMessage)}
                          className="pr-12 glow-border"
                          disabled={isListening}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAIMessage(currentMessage)}
                          disabled={!currentMessage.trim() || isListening}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-green-600 to-blue-600"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      🎤 Voice support in {allAvailableLanguages.find(l => l.code === selectedLanguage)?.nativeName} | Type or speak naturally
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs remain the same but simplified for brevity */}
          <TabsContent value="delivery" className="space-y-6">
            <h3 className="font-bold text-lg text-gray-900 px-1">Active Shipments</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeDeliveries.map((delivery) => (
                <Card key={delivery.id} className="gradient-card marketplace-shadow overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-xl">
                          <Truck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">Order #{delivery.orderId}</CardTitle>
                          <p className="text-[10px] text-gray-600 font-medium">{delivery.vendor}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize",
                        delivery.status === 'delivered' ? "bg-green-100 text-green-800 border-green-200" :
                          delivery.status === 'dispatched' ? "bg-blue-100 text-blue-800 border-blue-200" :
                            "bg-yellow-100 text-yellow-800 border-yellow-200"
                      )}>
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items List */}
                    <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                         <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Content</p>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {delivery.items?.join(', ') || 'Processing items...'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="relative pt-4 pb-2">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-bold px-1">
                        <span>Ordered</span>
                        <span>Packed</span>
                        <span>Dispatched</span>
                        <span>Arriving</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full relative overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                          style={{
                            width:
                              delivery.status === 'confirmed' ? '15%' :
                                delivery.status === 'packed' ? '45%' :
                                  delivery.status === 'dispatched' ? '75%' :
                                    delivery.status === 'in_transit' ? '90%' : '100%'
                          }}
                        />
                      </div>
                      <div className="flex items-center mt-3 text-[10px] text-gray-600">
                        <Location className="h-3 w-3 mr-1 text-red-500" />
                        <span className="font-medium">Current: {delivery.currentLocation}</span>
                        <span className="ml-auto font-bold text-green-700">ETA: {delivery.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-8 font-bold glow-border"
                        onClick={() => window.location.href = `tel:${delivery.driver.phone}`}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call: {delivery.driver.phone}
                      </Button>
                      <Button
                        size="sm"
                        className="text-[10px] h-8 font-bold bg-gradient-to-r from-green-600 to-emerald-600"
                        onClick={() => openRatingModal(delivery)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delivery History Section */}
            <h3 className="font-bold text-lg text-gray-900 px-1 pt-4">Recent History</h3>
            <Card className="marketplace-shadow border-none bg-white/60">
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((history) => (
                      <div key={history._id} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Clipboard className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{history.supplier?.businessName || history.supplier?.fullName}</p>
                            <p className="text-[10px] text-gray-500">{new Date(history.placedAt).toLocaleDateString()} • {history.items?.[0]?.productName}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-green-700">₹{history.totalAmount}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-[10px] text-blue-600 flex items-center ml-auto"
                            onClick={() => {
                              setSelectedOrder({
                                id: history._id,
                                supplier: history.supplier?.businessName,
                                date: new Date(history.placedAt).toLocaleDateString(),
                                items: history.items.map((i: any) => `${i.productName} (${i.quantity}${i.unit})`).join(', '),
                                amount: `₹${history.totalAmount}`
                              });
                              setShowOrderDetails(true);
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Bill
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 italic text-sm">
                      No recent orders found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder tabs */}
          <TabsContent value="bazaar" className="space-y-6">
            {/* Search and Category Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers or products..."
                    className="pl-10 glow-border bg-white"
                    value={bazaarSearchQuery}
                    onChange={(e) => setBazaarSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Icons */}
              <div className="flex space-x-4 overflow-x-auto pb-2 px-1">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={bazaarSelectedCategory === cat.id ? "default" : "outline"}
                    className={cn(
                      "flex flex-col items-center p-6 h-auto min-w-[100px] glow-border transition-all",
                      bazaarSelectedCategory === cat.id ? "bg-green-600 text-white scale-105" : "bg-white/60"
                    )}
                    onClick={() => setBazaarSelectedCategory(cat.id)}
                  >
                    <cat.icon className="h-6 w-6 mb-2" />
                    <span className="text-xs font-semibold">{cat.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Supplier Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const filtered = suppliers.filter(s => {
                  const query = bazaarSearchQuery?.toLowerCase() || '';
                  const cat = bazaarSelectedCategory?.toLowerCase() || 'all';
                  
                  const matchesSearch = !query || 
                    (s.businessName || s.fullName || '').toLowerCase().includes(query);
                    
                  const matchesCategory = cat === 'all' || 
                    (Array.isArray(s.productCategories) && s.productCategories.some((c: any) => 
                      String(c).toLowerCase() === cat
                    ));
                    
                  return matchesSearch && matchesCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/40 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">No Suppliers Found</h4>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs text-center">
                        We couldn't find any suppliers matching your current filters. Try searching for something else or changing the category.
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-green-600 font-bold"
                        onClick={() => {
                          setBazaarSearchQuery("");
                          setBazaarSelectedCategory("all");
                        }}
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  );
                }

                return filtered.map((supplier) => (
                  <Card key={supplier._id} className="gradient-card marketplace-shadow overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-green-200 ring-4 ring-green-50 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">
                              {(supplier.businessName || supplier.fullName || '?')?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-lg text-gray-900">{supplier.businessName || supplier.fullName}</h3>
                              <Shield className="h-3.5 w-3.5 text-green-600 fill-green-100" />
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">{supplier.fullName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
                                <Star className="h-2.5 w-2.5 text-yellow-500 fill-current mr-1" />
                                <span className="text-[10px] font-black text-yellow-700">{supplier.rating?.average || '4.5'}</span>
                              </div>
                              <span className="text-[9px] text-gray-400 font-bold">({supplier.rating?.count || 12}+)</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                          {supplier.distance || "2.4 km"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(supplier.productCategories) && supplier.productCategories.slice(0, 3).map((item: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50/50 text-slate-600 font-bold border-slate-200 uppercase tracking-tight">
                            {item}
                          </Badge>
                        ))}
                        {Array.isArray(supplier.productCategories) && supplier.productCategories.length > 3 && (
                          <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-200 text-slate-400">
                            +{supplier.productCategories.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 bg-white/60 p-2.5 rounded-2xl border border-white backdrop-blur-sm">
                        <div className="flex items-center px-1">
                          <div className="bg-blue-100 p-1 rounded-md mr-2">
                             <Timer className="h-2.5 w-2.5 text-blue-600" />
                          </div>
                          <span className="font-bold">2-3 hours</span>
                        </div>
                        <div className="flex items-center px-1">
                          <div className="bg-green-100 p-1 rounded-md mr-2">
                             <IndianRupee className="h-2.5 w-2.5 text-green-600" />
                          </div>
                          <span className="font-bold">Min: ₹{supplier.minOrderAmount || 500}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Open Now</span>
                        </div>
                        <div className="text-[9px] font-black text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
                          TRUST SCORE: {supplier.trustScore || 85}%
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-black text-[9px] uppercase tracking-tighter transition-all"
                          onClick={() => window.location.href = `tel:${supplier.phone}`}
                        >
                          <Phone className="h-3 w-3 mr-1.5 text-blue-600" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          className="flex-[1.5] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-black text-xs shadow-lg shadow-green-200 transition-all active:scale-95"
                          onClick={() => {
                            setSelectedSupplier({
                              _id: supplier._id,
                              id: supplier._id,
                              name: supplier.businessName || supplier.fullName,
                              minOrder: supplier.minOrderAmount || 500
                            });
                            setShowOrderDialog(true);
                          }}
                        >
                          <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                          ORDER NOW
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-bold text-2xl text-gray-900">Stock Management</h3>
                <p className="text-sm text-gray-500">Monitor and update your shop's inventory levels in real-time.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowInventoryModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold marketplace-shadow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock Item
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="gradient-card marketplace-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-2xl">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total SKUs</p>
                      <h4 className="text-2xl font-black text-gray-900">{vendorData?.currentInventory?.length || 0}</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card marketplace-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-2xl">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Low Stock</p>
                      <h4 className="text-2xl font-black text-orange-600">
                        {vendorData?.currentInventory?.filter((i: any) => (i.quantity || 0) <= (i.threshold || 5)).length || 0}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card marketplace-shadow">
                <CardContent className="p-6">
                  <Button 
                    variant="outline" 
                    className="w-full h-full py-4 border-dashed border-2 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all group"
                    onClick={async () => {
                      const defaults = [
                        { productName: 'आलू (Potatoes)', category: 'Vegetables', quantity: 20, unit: 'kg', costPrice: 25 },
                        { productName: 'पूरी (Puris)', category: 'Grains', quantity: 1000, unit: 'pcs', costPrice: 0.5 },
                        { productName: 'चना (Chickpeas)', category: 'Grains', quantity: 10, unit: 'kg', costPrice: 80 },
                        { productName: 'इमली (Tamarind)', category: 'Spices', quantity: 5, unit: 'kg', costPrice: 120 },
                        { productName: 'पुदीना (Mint)', category: 'Vegetables', quantity: 2, unit: 'kg', costPrice: 40 },
                        { productName: 'मिर्च (Green Chilies)', category: 'Vegetables', quantity: 1, unit: 'kg', costPrice: 60 },
                        { productName: 'तेल (Oil)', category: 'Oil', quantity: 15, unit: 'Litre', costPrice: 140 },
                        { productName: 'मसाला (Chaat Masala)', category: 'Spices', quantity: 2, unit: 'kg', costPrice: 250 }
                      ];
                      try {
                        await api.patch("/vendors/inventory", { currentInventory: defaults });
                        const fresh = await api.get("/vendors/profile");
                        setVendorData(fresh);
                        toast.success("Panipuri template loaded!");
                      } catch (error) {
                        toast.error("Failed to load template");
                      }
                    }}
                  >
                    <Zap className="h-5 w-5 text-orange-500 group-hover:scale-125 transition-transform" />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-slate-700">Quick Template</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="marketplace-shadow border-none bg-white/60">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 font-bold">Item & Status</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">In Stock</th>
                        <th className="px-6 py-4 font-bold">PPU (₹)</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {vendorData?.currentInventory && vendorData.currentInventory.length > 0 ? (
                        vendorData.currentInventory.map((item: any, idx: number) => {
                          const isLow = (item.quantity || 0) <= (item.threshold || 5);
                          return (
                            <tr key={idx} className="hover:bg-white/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isLow ? "bg-red-500 animate-pulse outline outline-offset-2 outline-red-100" : "bg-green-500"
                                  )} />
                                  <span className="font-bold text-gray-900">{item.productName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="text-[10px] bg-slate-50 font-bold uppercase tracking-tight">{item.category}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn("font-black text-base", isLow ? "text-red-600" : "text-slate-900")}>
                                  {item.quantity}{item.unit}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-gray-500">₹{item.costPrice}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                      setNewInventoryItem({
                                        productName: item.productName,
                                        category: item.category,
                                        quantity: item.quantity.toString(),
                                        unit: item.unit,
                                        costPrice: item.costPrice.toString()
                                      });
                                      setShowInventoryModal(true);
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                      const updated = vendorData.currentInventory.filter((_: any, i: number) => i !== idx);
                                      try {
                                        await api.patch("/vendors/inventory", { currentInventory: updated });
                                        const fresh = await api.get("/vendors/profile");
                                        setVendorData(fresh);
                                        toast.success("Item removed");
                                      } catch (err) {
                                        toast.error("Failed to remove item");
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Your warehouse is currently empty.</p>
                            <p className="text-xs mt-1">Add items or load a business template to begin.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Odoo-like Charting Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card marketplace-shadow overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Spending Trend
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-700 border-none text-[10px]">Monthly Analysis</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-[250px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.dailyData?.length > 0 ? analytics.dailyData.map((d: any) => ({
                      name: new Date(d._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                      value: d.spending
                    })) : [
                      { name: 'No Data', value: 0 }
                    ]}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="gradient-card marketplace-shadow overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center">
                      <Package className="h-4 w-4 mr-2 text-blue-600" />
                      Inventory Composition
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 border-none text-[10px]">Category Split</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-[250px] p-6 flex items-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const categories = vendorData?.currentInventory?.reduce((acc: any, item: any) => {
                            acc[item.category] = (acc[item.category] || 0) + 1;
                            return acc;
                          }, {});
                          return categories ? Object.entries(categories).map(([name, value]) => ({ name, value })) : [{ name: 'Empty', value: 1 }];
                        })()}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 pl-4 overflow-y-auto max-h-[180px]">
                    {(() => {
                      const categories = vendorData?.currentInventory?.reduce((acc: any, item: any) => {
                        acc[item.category] = (acc[item.category] || 0) + 1;
                        return acc;
                      }, {});
                      const total = vendorData?.currentInventory?.length || 1;
                      const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                      return categories && Object.entries(categories).map(([name, value]: any, idx: number) => (
                        <div key={name} className="flex items-center justify-between font-medium">
                          <div className="flex items-center text-[10px]">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[idx % colors.length] }} /> 
                            <span className="truncate max-w-[80px]">{name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{Math.round((value / total) * 100)}%</span>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Financial Summary Card */}
              <Card className="gradient-card marketplace-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <IndianRupee className="h-4 w-4 mr-2 text-blue-600" />
                    Monthly Financials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-[10px] text-blue-600 font-bold uppercase">Total Spent</p>
                      <p className="text-lg font-black text-slate-900">₹{vendorData?.totalSpent?.toLocaleString() || '12,450'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <p className="text-[10px] text-green-600 font-bold uppercase">AI Savings</p>
                      <p className="text-lg font-black text-green-700">₹{vendorData?.totalSavings?.toLocaleString() || '1,840'}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl mb-4">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Credit Limit Status</p>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-lg font-black text-slate-900">₹{vendorData?.currentCredit?.toLocaleString() || '4,200'}</p>
                      <p className="text-[10px] font-bold text-orange-700">84% Used</p>
                    </div>
                    <div className="h-1.5 w-full bg-orange-200/50 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-orange-500 w-[84%]" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold glow-border h-11"
                    onClick={handleDownloadReport}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Download Business Report
                  </Button>
                </CardContent>
              </Card>

              {/* Supplier Trust Analysis */}
              <Card className="gradient-card marketplace-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Supplier Trust Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>Ravi Traders</span>
                      <span className="font-bold">92%</span>
                    </div>
                    <Progress value={92} className="h-1 bg-gray-100" />
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[10px]">
                      <span>Maharaj Wholesale</span>
                      <span className="font-bold">88%</span>
                    </div>
                    <Progress value={88} className="h-1 bg-gray-100" />
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[10px]">
                      <span>Fresh Mandi</span>
                      <span className="font-bold">75%</span>
                    </div>
                    <Progress value={75} className="h-1 bg-gray-100" />
                  </div>
                </CardContent>
              </Card>

              {/* AI Sales Forecast Card */}
              <Card className="gradient-card marketplace-shadow border-dashed border-2 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                      <Bot className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Saarthi Insights</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Based on local festivals and market trends, we predict a <b>25% increase</b> in demand for <span className="text-green-700 font-bold">Onions and Spices</span> next week.
                      </p>
                      <p className="text-[10px] text-green-600 font-medium mt-2 italic">
                        Suggestion: Stock up by Saturday to avoid the 10% price hike.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <span>Complete Your Purchase</span>
            </DialogTitle>
            <DialogDescription>Review your order summary and choose a payment method to finish.</DialogDescription>
          </DialogHeader>

          {currentPurchase && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{currentPurchase.quantity}{currentPurchase.unit} {currentPurchase.product}</span>
                    <span>₹{currentPurchase.total}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span>₹{currentPurchase.savings}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Amount</span>
                    <span>₹{currentPurchase.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <Label className="text-sm font-medium">Select Payment Method</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <method.icon className="h-4 w-4 mr-2" />
                      {method.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              Pay ₹{currentPurchase?.total}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Rate Your Experience</span>
            </DialogTitle>
            <DialogDescription>Your feedback helps our suppliers improve their service.</DialogDescription>
          </DialogHeader>

          {currentRating && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Order #{currentRating.orderId}</p>
                <p className="font-medium">{currentRating.supplier}</p>
                <p className="text-sm text-gray-500">{currentRating.items?.join(', ')}</p>
              </div>

              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Rate your experience</p>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoverRating || rating) >= star
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 0 ? 'Click to rate' :
                    rating === 1 ? 'Poor' :
                      rating === 2 ? 'Fair' :
                        rating === 3 ? 'Good' :
                          rating === 4 ? 'Very Good' : 'Excellent'}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <Label className="text-sm font-medium">Share your feedback (optional)</Label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Skip
            </Button>
            <Button
              onClick={handleRatingSubmit}
              className="bg-gradient-to-r from-yellow-500 to-orange-500"
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Supplier Registration Modal */}
      <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Building2 className="h-6 w-6 inline mr-2" />
              Supplier Registration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name *</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={supplierForm.fullName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, fullName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Password *</Label>
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    value={supplierForm.password}
                    onChange={(e) => setSupplierForm({ ...supplierForm, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Name *</Label>
                  <Input
                    placeholder="e.g., Ravi Traders & Sons"
                    value={supplierForm.businessName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, businessName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    placeholder="+91-9876543210"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="supplier@example.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Full Address *</Label>
                  <Textarea
                    placeholder="Enter complete business address"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Pincode *</Label>
                  <Input
                    placeholder="400001"
                    value={supplierForm.pincode}
                    onChange={(e) => setSupplierForm({ ...supplierForm, pincode: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Business Details
              </h3>

              {/* Product Categories */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Product Categories * (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Meat', 'Dry Goods', 'Beverages', 'Packaging', 'Oils', 'Flour', 'Frozen'].map(category => (
                    <Button
                      key={category}
                      type="button"
                      variant={supplierForm.productCategories.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newCategories = supplierForm.productCategories.includes(category)
                          ? supplierForm.productCategories.filter(c => c !== category)
                          : [...supplierForm.productCategories, category];
                        setSupplierForm({ ...supplierForm, productCategories: newCategories });
                      }}
                      className="text-xs"
                    >
                      {supplierForm.productCategories.includes(category) && <Check className="h-3 w-3 mr-1" />}
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Delivery Radius (km)</Label>
                  <Input
                    type="number"
                    value={supplierForm.deliveryRadius}
                    onChange={(e) => setSupplierForm({ ...supplierForm, deliveryRadius: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Minimum Order Amount (₹)</Label>
                  <Input
                    type="number"
                    value={supplierForm.minOrderAmount}
                    onChange={(e) => setSupplierForm({ ...supplierForm, minOrderAmount: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="my-4">
                <Label className="text-sm font-medium mb-2 block">Payment Methods * (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Credit', 'Bank Transfer', 'Cheque'].map(method => (
                    <Button
                      key={method}
                      type="button"
                      variant={supplierForm.paymentMethods.includes(method) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newMethods = supplierForm.paymentMethods.includes(method)
                          ? supplierForm.paymentMethods.filter(m => m !== method)
                          : [...supplierForm.paymentMethods, method];
                        setSupplierForm({ ...supplierForm, paymentMethods: newMethods });
                      }}
                      className="text-xs"
                    >
                      {supplierForm.paymentMethods.includes(method) && <Check className="h-3 w-3 mr-1" />}
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Working Hours - From</Label>
                  <Input
                    type="time"
                    value={supplierForm.workingHoursFrom}
                    onChange={(e) => setSupplierForm({ ...supplierForm, workingHoursFrom: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Working Hours - To</Label>
                  <Input
                    type="time"
                    value={supplierForm.workingHoursTo}
                    onChange={(e) => setSupplierForm({ ...supplierForm, workingHoursTo: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">GST Number (Optional)</Label>
                  <Input
                    placeholder="27AABCU9603R1ZX"
                    value={supplierForm.gstNumber}
                    onChange={(e) => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">FSSAI License Number (Optional)</Label>
                  <Input
                    placeholder="11016033000513"
                    value={supplierForm.fssaiLicense}
                    onChange={(e) => setSupplierForm({ ...supplierForm, fssaiLicense: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSupplierForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={async () => {
                try {
                  const payload = {
                    ...supplierForm,
                    userType: 'supplier',
                    addressDetails: {
                      street: supplierForm.address || 'Street not specified',
                      city: 'City',
                      state: 'State',
                      pincode: supplierForm.pincode || '000000'
                    }
                  };

                  const data = await api.post('/auth/register', payload);

                  localStorage.setItem('token', data.token);
                  localStorage.setItem('user', JSON.stringify(data.user));

                  setShowSupplierForm(false);
                  toast.success('🎉 Supplier registration successful! Welcome to BazaarBandhu supplier network!');
                  setTimeout(() => window.location.reload(), 1500);
                } catch (error: any) {
                  console.error('Supplier Auth Error:', error);
                  toast.error(`❌ Error: ${error.message}`);
                }
              }}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Register as Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Login/Signup Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {authMode === 'login' ? 'Login to BazaarBandhu' : 'Join BazaarBandhu'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {authMode === 'login'
                ? 'Enter your email and password to access your account.'
                : 'Fill in the details to create your account and join the community.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
                const payload = {
                  ...authForm,
                  userType: authMode === 'signup' ? userType : undefined
                };

                const data = await api.post(endpoint, payload);

                login(data.user, data.token);

                if (data.user.userType === 'vendor') {
                  const vData = await api.get('/vendors/profile');
                  setVendorData(vData);
                }

                toast.success(`🎉 ${authMode === 'login' ? 'Login' : 'Signup'} successful! Welcome to BazaarBandhu, ${data.user.fullName || data.user.name}!`);
                setShowAuthModal(false);

                // If not already on appropriate dashboard, redirect
                if (data.user.userType === 'supplier') {
                  navigate('/supplier-dashboard');
                } else if (window.location.pathname !== '/dashboard') {
                  navigate('/dashboard');
                }

              } catch (error: any) {
                console.error('Auth Error:', error);
                toast.error(`❌ Error: ${error.message}`);
              }
            }}
            className="space-y-4"
          >
            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={userType === 'vendor' ? "default" : "outline"}
                  onClick={() => setUserType('vendor')}
                  className="text-sm"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Vendor
                </Button>
                <Button
                  type="button"
                  variant={userType === 'supplier' ? "default" : "outline"}
                  onClick={() => setUserType('supplier')}
                  className="text-sm"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Supplier
                </Button>
              </div>
            )}

            {authMode === 'signup' && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={authForm.fullName}
                    onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={authForm.businessName}
                    onChange={(e) => setAuthForm({ ...authForm, businessName: e.target.value })}
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    placeholder="+91-9876543210"
                  />
                </div>
              </>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <DialogFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {authMode === 'login' ? (
                  <><LogIn className="h-4 w-4 mr-2" /> Login</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2" /> Sign Up</>
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto"
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setAuthForm({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      fullName: '',
                      businessName: '',
                      phone: ''
                    });
                  }}
                >
                  {authMode === 'login' ? 'Sign up here' : 'Login here'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details (Bill) Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Tax Invoice</span>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 border p-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Supplier</p>
                  <p className="font-black text-slate-900">{selectedOrder.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Order ID</p>
                  <p className="font-black text-blue-600">#{selectedOrder.id?.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Order Lifecycle Flow Visualization */}
              <div className="py-2">
                <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-3 text-center">Order Lifecycle</p>
                <div className="relative">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter mb-2">
                    <span className="text-green-600">Confirmed</span>
                    <span className="text-green-600">Packed</span>
                    <span className="text-green-600">Dispatched</span>
                    <span className="text-green-600">Delivered</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 w-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Item Details</p>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex-1 mr-4">{selectedOrder.items}</span>
                  <span className="text-slate-900 whitespace-nowrap">{selectedOrder.amount}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-slate-200">
                <div className="flex justify-between text-base font-black">
                  <span className="text-slate-900">PAYMENT STATUS</span>
                  <span className="text-green-600">COMPLETED</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-1">
                  <span className="text-slate-500">Total Amount Paid</span>
                  <span className="text-slate-900">{selectedOrder.amount}</span>
                </div>
                <p className="text-[8px] text-gray-300 mt-4 text-center uppercase font-black tracking-widest">Digital Tax Invoice • BazaarBandhu Blockchain Verified</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="w-full bg-blue-600" onClick={() => setShowOrderDetails(false)}>
              Close Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Inventory Modal */}
      <Dialog open={showInventoryModal} onOpenChange={setShowInventoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Add to Inventory</span>
            </DialogTitle>
            <DialogDescription>
              Update your shop's stock levels to get better AI insights.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="e.g. Potatoes"
                value={newInventoryItem.productName}
                onChange={e => setNewInventoryItem({ ...newInventoryItem, productName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newInventoryItem.quantity}
                  onChange={e => setNewInventoryItem({ ...newInventoryItem, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newInventoryItem.unit}
                  onValueChange={v => setNewInventoryItem({ ...newInventoryItem, unit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liter">liter</SelectItem>
                    <SelectItem value="pack">pack</SelectItem>
                    <SelectItem value="unit">unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cost Price (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newInventoryItem.costPrice}
                onChange={e => setNewInventoryItem({ ...newInventoryItem, costPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="e.g. Vegetables"
                value={newInventoryItem.category}
                onChange={e => setNewInventoryItem({ ...newInventoryItem, category: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInventoryModal(false)}>Cancel</Button>
            <Button className="bg-blue-600" onClick={submitInventoryUpdate}>
              Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              <span>Order from {selectedSupplier?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Select items and quantities to add to your cart.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {products.filter(p => p.supplier === selectedSupplier?.name).length > 0 ? (
              products.filter(p => p.supplier === selectedSupplier?.name).map((product, idx) => (
                <Card key={idx} className="border-green-100 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-xs text-green-600 font-bold">₹{product.price}/{product.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue="1"
                        id={`qty-${product.id}`}
                        className="w-20"
                        min="1"
                      />
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const qtyInput = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
                          const qty = parseInt(qtyInput.value) || 1;
                          addSupplierProductToCart(product, qty);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500 italic">
                No specific products listed for this supplier yet.
                <Button variant="link" className="block mx-auto mt-2" onClick={addMinimumOrderLot}>
                  Add Minimum Order Lot
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-500 italic">
              Min Order: ₹{selectedSupplier?.minOrder}
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Close</Button>
              <Button className="bg-green-600 font-bold marketplace-shadow" onClick={() => {
                setShowOrderDialog(false);
                proceedToCheckout();
              }}>
                Done Picking & Pay →
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 🎤 Bolke Business Chalao (Floating Voice Assistant) */}
      <VoiceButton />
    </div >
  );
}
