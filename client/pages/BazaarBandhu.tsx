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
  MapPin as Location,
  FileText,
  Check,
  Building,
  Mail,
  User,
  Calendar as Cal,
  Banknote,
  LogOut,
  LineChart,
  Utensils,
  ChevronRight,
  Search,
  ShoppingBag,
  ShoppingBag as ShoppingBagIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supportedLanguages, getTranslation, voiceCommands } from "@/lib/languages";

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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [bazaarSearchQuery, setBazaarSearchQuery] = useState("");
  const [bazaarSelectedCategory, setBazaarSelectedCategory] = useState("all");

  const [headerStatusKey, setHeaderStatusKey] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }

    // Fetch dynamic status line
    fetch('/api/config/status-line')
      .then(res => res.json())
      .then(data => {
        setHeaderStatusKey(data.statusKey);
      })
      .catch(err => console.error('Status fetch error:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
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
      text: `Welcome to BazaarBandhu! I'm your AI Business Assistant. How can I help you grow your business today?\n\nYou can ask me to:\n🛒 "Order more onions"\n📊 "Show today's market rates"\n🚚 "Track my deliveries"\n📦 "Check inventory status"`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Enhanced products with real-time state
  const [products, setProducts] = useState([
    {
      id: 'p1',
      name: getTranslation('puris', selectedLanguage),
      price: 120,
      marketPrice: 140,
      unit: 'pack',
      trending: 'stable',
      savings: 20,
      supplier: 'Golden Bakes',
      stock: 300,
      quality: 'Crispy',
      image: '🫓'
    },
    {
      id: 'p2',
      name: getTranslation('mintWater', selectedLanguage),
      price: 45,
      marketPrice: 50,
      unit: 'L',
      trending: 'up',
      savings: 5,
      supplier: 'Fresh Mandi',
      stock: 12,
      quality: 'Spicy',
      image: '🧪'
    },
    {
      id: 'p3',
      name: getTranslation('tamarindChutney', selectedLanguage),
      price: 85,
      marketPrice: 100,
      unit: 'kg',
      trending: 'stable',
      savings: 15,
      supplier: 'Maharaj Wholesale',
      stock: 5,
      quality: 'Sweet',
      image: '🍯'
    },
    {
      id: 'p4',
      name: getTranslation('sprouts', selectedLanguage),
      price: 60,
      marketPrice: 75,
      unit: 'kg',
      trending: 'down',
      savings: 15,
      supplier: 'Krishna Grains',
      stock: 8,
      quality: 'Fresh',
      image: '🥗'
    },
    {
      id: 'p5',
      name: getTranslation('potatoes', selectedLanguage),
      price: 65,
      marketPrice: 70,
      unit: 'kg',
      trending: 'stable',
      savings: 5,
      supplier: 'Village Direct',
      stock: 45,
      quality: 'A+',
      image: '🥔'
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
    { id: "dry-goods", name: getTranslation('dryGoods', selectedLanguage), count: 5, icon: Clipboard }
  ];

  const suppliersList = [
    {
      id: 1,
      name: "Ravi Traders",
      owner: "Ravi Bhai Sharma",
      rating: 4.8,
      reviews: 156,
      distance: "1.2 km",
      verified: true,
      location: "Solapur Main Mandi",
      phone: "+91 98765 43210",
      category: "vegetables",
      speciality: ["Onion", "Tomato", "Potato"],
      pricing: "wholesale",
      deliveryTime: "2-3 hours",
      minOrder: 500,
      trustScore: 92
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
      id: 9,
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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);

        if (event.results[event.results.length - 1].isFinal) {
          setCurrentMessage(transcript);
          setIsListening(false);
          setIsVoiceActive(false);
          // Auto-send the message after a short delay
          setTimeout(() => handleAIMessage(transcript, transcript), 500);
        }
      };

      recognition.current.onstart = () => {
        setIsListening(true);
        setIsVoiceActive(true);
      };

      recognition.current.onerror = (error: any) => {
        console.log('Speech recognition error:', error);
        setIsListening(false);
        setIsVoiceActive(false);
        setVoiceTranscript('');
      };

      recognition.current.onend = () => {
        setIsListening(false);
        setIsVoiceActive(false);
        setVoiceTranscript('');
      };
    }
  }, [selectedLanguage]);

  const handleVoiceToggle = () => {
    if (!recognition.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
      setIsVoiceActive(false);
      setVoiceTranscript('');
    } else {
      setIsVoiceActive(true);
      setIsListening(true);
      setVoiceTranscript('');
      recognition.current.start();
    }
  };

  const handleAIMessage = (text: string, voiceInput?: string) => {
    if (!text.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      voiceInput: voiceInput
    };

    setAiMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    setTimeout(() => {
      let response = '';
      let action: any;
      const lowerText = text.toLowerCase();

      // Purchase Confirmation Logic
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      if (lastAiMessage?.sender === 'ai' && lastAiMessage.action?.type === 'buy' &&
        (lowerText === 'yes' || lowerText === 'हां' || lowerText === 'हो' || lowerText.includes('pay') || lowerText.includes('place'))) {

        response = `🚀 Great choice! मैं आपके लिए पेमेंट गेटवे खोल रहा हूँ।\n\nOrder for ${lastAiMessage.action.quantity} ${lastAiMessage.action.product} from ${lastAiMessage.action.supplier} is ready for settlement.`;
        const product = products.find(p => p.name.toLowerCase().includes(lastAiMessage.action?.product?.toLowerCase() || '')) || products[0];
        const quantityMatch = lastAiMessage.action?.quantity?.match(/\d+/);
        const quantityNum = quantityMatch ? parseInt(quantityMatch[0]) : 1;

        handleBuyClick(product, quantityNum);

        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
        };
        setAiMessages(prev => [...prev, aiMessage]);
        setIsAiTyping(false);
        return;
      }

      // Main NLP Logic
      if (lowerText.includes('buy') || lowerText.includes('खरीद') || lowerText.includes('order')) {
        const quantityMatch = text.match(/\d+/);
        const quantity = quantityMatch ? quantityMatch[0] : '10';
        const productMatch = products.find(p =>
          lowerText.includes(p.name.toLowerCase()) ||
          p.id.toLowerCase() === lowerText.split(' ').find(word => word.startsWith('p'))
        );

        if (productMatch) {
          const total = parseInt(quantity) * productMatch.price;
          const totalSavings = parseInt(quantity) * (productMatch.marketPrice - productMatch.price);
          response = `✅ Perfect! मैंने ${quantity}${productMatch.unit} ${productMatch.name} का सौदा ढूंढ लिया है:\n\n🏪 Supplier: ${productMatch.supplier}\n💰 Rate: ₹${productMatch.price}/${productMatch.unit}\n🔢 Total: ₹${total}\n💡 Savings: ₹${totalSavings}\n🚚 ETA: 20-30 mins\n\nShall I open payment for this order?`;
          action = { type: 'buy', product: productMatch.name, quantity: `${quantity}${productMatch.unit}`, supplier: productMatch.supplier, price: total, savings: totalSavings };
        } else {
          response = `🤖 I couldn't find that item. I have **Puris, Mint Water, Chutney, and Potatoes** at wholesale rates. Want to see them?`;
        }
      } else if (lowerText.includes('price') || lowerText.includes('कीमत') || lowerText.includes('rate')) {
        const rates = products.map(p => `${p.image} ${p.name}: ₹${p.price}/${p.unit} (Save ₹${p.marketPrice - p.price})`).join('\n');
        response = `📊 **Live Market Rates:**\n\n${rates}\n\nShall I buy anything for you?`;
      } else if (lowerText.includes('delivery') || lowerText.includes('डिलीवरी') || lowerText.includes('track')) {
        const recent = activeDeliveries[0];
        response = `🚚 **Delivery Status:**\n📦 Order #${recent.orderId}\n👤 Driver: ${recent.driver.name}\n📍 Loc: ${recent.currentLocation}\n⏰ ETA: ${recent.estimatedTime}`;
      } else if (lowerText.includes('stock') || lowerText.includes('स्टॉक') || lowerText.includes('inventory')) {
        const low = products.filter(p => p.stock < 15);
        response = `📦 **Inventory Status:**\n${low.map(p => `🔴 Low: ${p.name} (${p.stock}${p.unit})`).join('\n')}\n${products.filter(p => p.stock >= 15).map(p => `🟢 Ok: ${p.name}`).join('\n')}`;
      } else if (lowerText.includes('how to') || lowerText.includes('tips') || lowerText.includes('profit')) {
        response = `📈 **Business Growth Hub:**\n1. Prepare spicy water 6h early.\n2. Bulk potato orders save 15%.\n3. Every 5th customer gets a free puri!`;
      } else {
        response = `🤖 I heard: "${voiceInput || text}"\n\nTry:\n🛒 "Buy 20 packs puris"\n📈 "How to increase profit?"\n🚚 "Track order"`;
      }

      const aiMessage: AIMessage = { id: (Date.now() + 1).toString(), text: response, sender: 'ai', timestamp: new Date(), action };
      setAiMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);

      if (action?.type === 'buy') {
        setTimeout(() => {
          setAiMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: "💡 Pro Tip: Since you're ordering vegetables, Ravi Traders is offering a 5% discount if you pay via UPI today!",
            sender: 'ai',
            timestamp: new Date()
          }]);
        }, 1500);
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = response.replace(/[#*`✅🏪💰🔢💡⭐🚚🤖📊📦🔴🟡🟢⚠️]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const handleBuyClick = (product: any, quantity: number = 1) => {
    const total = product.price * quantity;
    const savings = product.savings ? product.savings * quantity : 0;

    setCurrentPurchase({
      product: product.name,
      quantity,
      unit: product.unit,
      pricePerUnit: product.price,
      total,
      savings,
      supplier: product.supplier,
      image: product.image
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
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        key: 'rzp_test_5yLzXw7fN4LwXj', // Use env in production
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
            headers: { 'Content-Type': 'application/json' },
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

  const processOrderSuccess = () => {
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
    const reportData = [
      ['Date', 'Supplier', 'Items', 'Amount', 'Savings'],
      ['24 Feb', 'Fresh Farms', 'Tomatoes, Potatoes', '₹1,240', '₹180'],
      ['22 Feb', 'Ravi Traders', 'Onions, Dry Fruits', '₹850', '₹120'],
      ['Today', currentPurchase?.supplier || 'N/A', `${currentPurchase?.quantity || 0}${currentPurchase?.unit || ''} ${currentPurchase?.product || ''}`, `₹${currentPurchase?.total || 0}`, `₹${currentPurchase?.savings || 0}`],
      ['', '', 'TOTAL SPENT', `₹${quickStats.todaysSavings + 12450}`, ''],
      ['', '', 'TOTAL SAVED', `₹${quickStats.todaysSavings + 1840}`, '']
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + reportData.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BazaarBandhu_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('📊 Your business report has been generated and downloaded successfully!');
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent bazaar-glow">
                  BazaarBandhu
                </h1>
                <p className="text-sm font-medium bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent italic">
                  {headerStatusKey ? getTranslation('headerStatus', selectedLanguage) : '...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32 glow-border fade-in">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map(lang => (
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
              {!isLoggedIn ? (
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
                          {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm marketplace-shadow">
            <TabsTrigger value="dashboard" className="glow-border">
              <Home className="h-4 w-4 mr-2" />
              {getTranslation('dashboard', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="ai-bandhu" className="glow-border">
              <Bot className="h-4 w-4 mr-2" />
              AI Bandhu
            </TabsTrigger>
            <TabsTrigger value="bazaar" className="glow-border">
              <Store className="h-4 w-4 mr-2" />
              {getTranslation('markets', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="delivery" className="glow-border">
              <Truck className="h-4 w-4 mr-2" />
              {getTranslation('activeDeliveries', selectedLanguage)}
            </TabsTrigger>
            <TabsTrigger value="insights" className="glow-border">
              <LineChart className="h-4 w-4 mr-2" />
              {getTranslation('insights', selectedLanguage)}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Smart Purchase Interface */}
              <div className="lg:col-span-2">
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                      <span>Smart Purchase Hub</span>
                      <Badge className="bg-green-100 text-green-800">AI Powered</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {products.map((product, index) => (
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
                      Ask AI Bandhu to Buy Smart
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Alerts & Inventory */}
              <div className="space-y-6">
                {/* Business Alerts */}
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>{getTranslation('businessAlerts', selectedLanguage) || 'Business Alerts'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Low Stock Alert */}
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-3">
                      <Package className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900">Low Stock: Onions</p>
                        <p className="text-xs text-red-700">Only 5kg left. Usual reorder at 10kg.</p>
                        <Button size="sm" variant="link" className="p-0 h-auto text-xs text-red-800 font-bold mt-1">
                          Reorder Now →
                        </Button>
                      </div>
                    </div>

                    {/* Pending Payment Alert */}
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 flex items-start space-x-3">
                      <IndianRupee className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-900">Payment Due: Ravi Traders</p>
                        <p className="text-xs text-orange-700">₹1,250 overdue by 2 days.</p>
                        <Button size="sm" variant="link" className="p-0 h-auto text-xs text-orange-800 font-bold mt-1">
                          Settle Payment →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory Status Card (Odoo-style) */}
                <Card className="gradient-card marketplace-shadow overflow-hidden">
                  <CardHeader className="pb-2 bg-white/40">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span>Inventory Management</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold">12 Transfers Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y text-xs">
                      {[
                        { name: 'Onions', cat: 'Veg', qty: 5, unit: 'kg', status: 'low', val: '₹440' },
                        { name: 'Potatoes', cat: 'Veg', qty: 150, unit: 'kg', status: 'good', val: '₹9,750' },
                        { name: 'Mustard Oil', cat: 'Oils', qty: 45, unit: 'L', status: 'mid', val: '₹5,175' },
                        { name: 'Turmeric', cat: 'Spices', qty: 12, unit: 'kg', status: 'good', val: '₹3,240' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-1.5 h-8 rounded-full",
                              item.status === 'good' ? "bg-green-500" :
                                item.status === 'mid' ? "bg-yellow-500" : "bg-red-500"
                            )} />
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-[10px] text-gray-500">{item.cat} • {item.val}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{item.qty}{item.unit}</p>
                            <p className={cn(
                              "text-[10px] uppercase font-bold",
                              item.status === 'good' ? "text-green-600" :
                                item.status === 'mid' ? "text-yellow-600" : "text-red-600"
                            )}>{item.status === 'good' ? 'In Stock' : item.status === 'mid' ? 'Low' : 'Critical'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50/50">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 font-bold">
                        View All Operations →
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                          <p className="font-semibold text-lg">BazaarBandhu AI</p>
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
                          {supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName}
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
                      🎤 Voice support in {supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName} | Type or speak naturally
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
                        onClick={() => alert(`Calling ${delivery.driver.name} at ${delivery.driver.phone}`)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Logistics
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
                  {[
                    { id: 'H1', date: '24 Feb', supplier: 'Fresh Farms', items: 'Tomatoes, Pot...', amount: '₹1,240', status: 'delivered' },
                    { id: 'H2', date: '22 Feb', supplier: 'Ravi Traders', items: 'Onions, Dry...', amount: '₹850', status: 'delivered' },
                    { id: 'H3', date: '20 Feb', supplier: 'Gupta Oil', items: 'Mustard Oil...', amount: '₹2,100', status: 'delivered' }
                  ].map((history) => (
                    <div key={history.id} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Clipboard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{history.supplier}</p>
                          <p className="text-[10px] text-gray-500">{history.date} • {history.items}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-green-700">{history.amount}</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[10px] text-blue-600 flex items-center ml-auto"
                          onClick={() => {
                            setSelectedOrder(history);
                            setShowOrderDetails(true);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Bill
                        </Button>
                      </div>
                    </div>
                  ))}
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
              {suppliersList
                .filter(s =>
                  (bazaarSelectedCategory === 'all' || s.category === bazaarSelectedCategory) &&
                  (s.name.toLowerCase().includes(bazaarSearchQuery.toLowerCase()) ||
                    s.speciality.some(spec => spec.toLowerCase().includes(bazaarSearchQuery.toLowerCase())))
                )
                .map((supplier) => (
                  <Card key={supplier.id} className="gradient-card marketplace-shadow overflow-hidden group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-green-200">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">
                              {supplier.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-lg text-gray-900">{supplier.name}</h3>
                              {supplier.verified && <Shield className="h-4 w-4 text-green-600 fill-green-100" />}
                            </div>
                            <p className="text-xs text-gray-600">{supplier.owner}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-bold">{supplier.rating}</span>
                              <span className="text-[10px] text-gray-500">({supplier.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-[10px]">
                          {supplier.distance}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {supplier.speciality.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] bg-white/50">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 bg-white/40 p-2 rounded-lg">
                        <div className="flex items-center">
                          <Timer className="h-3 w-3 mr-1 text-blue-500" />
                          {supplier.deliveryTime}
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1 text-green-500" />
                          Min Order: ₹{supplier.minOrder}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-medium text-green-700">Open Now</span>
                        </div>
                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Trust Score: {supplier.trustScore}%
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bg-white text-green-600 border border-green-200 hover:bg-green-50 font-bold text-xs" onClick={() => alert(`Calling ${supplier.phone}`)}>
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105 transition-transform font-bold text-xs"
                          onClick={() => {
                            const prod = products.find(p => p.supplier === supplier.name) || products[0];
                            handleBuyClick(prod, 5);
                          }}
                        >
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Market Trends Card */}
              <Card className="gradient-card marketplace-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Onions</span>
                      <Badge className="bg-green-100 text-green-800">↓ 12% Price Drop</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Tomatoes</span>
                      <Badge className="bg-red-100 text-red-800">↑ 8% Price Hike</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Potatoes</span>
                      <Badge className="bg-blue-100 text-blue-800">Stable</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary Card */}
              <Card className="gradient-card marketplace-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <IndianRupee className="h-4 w-4 mr-2 text-blue-600" />
                    Monthly Financials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-xs text-gray-500">Total Spent</span>
                    <span className="text-sm font-bold">₹12,450</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-xs text-gray-500">Total Saved (AI)</span>
                    <span className="text-sm font-bold text-green-600">₹1,840</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Credit Balance</span>
                    <span className="text-sm font-bold text-orange-600">₹4,200</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold glow-border"
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
              <Card className="gradient-card marketplace-shadow border-dashed border-2 border-green-200 lg:col-span-3">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                      <Bot className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">AI Sales Prediction</h4>
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
                  {['Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Meat', 'Dry Goods', 'Beverages'].map(category => (
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
                    fullName: supplierForm.fullName, // already in form
                    email: supplierForm.email,
                    password: supplierForm.password,
                    phone: supplierForm.phone,
                    businessName: supplierForm.businessName,
                    addressDetails: {
                      street: supplierForm.address,
                      city: 'City', // placeholder if not in form
                      state: 'State',
                      pincode: '000000'
                    }
                  };

                  const response = await fetch('http://localhost:5004/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || 'Supplier registration failed');
                  }

                  localStorage.setItem('token', data.token);
                  localStorage.setItem('user', JSON.stringify(data.user));

                  setShowSupplierForm(false);
                  alert('🎉 Supplier registration successful!\n\nWelcome to BazaarBandhu supplier network!');
                  window.location.reload();
                } catch (error) {
                  console.error('Supplier Auth Error:', error);
                  alert(`❌ Error: ${error.message}`);
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
                const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
                const payload = {
                  ...authForm,
                  userType: authMode === 'signup' ? userType : undefined
                };

                const response = await fetch(`http://localhost:5004${endpoint}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Authentication failed');
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                alert(`🎉 ${authMode === 'login' ? 'Login' : 'Signup'} successful!\n\nWelcome to BazaarBandhu, ${data.user.fullName}!`);
                setShowAuthModal(false);
                // Update user state if needed (e.g. setLoggedInUser(data.user))
                window.location.reload(); // Simple way to refresh state across components

              } catch (error) {
                console.error('Auth Error:', error);
                alert(`❌ Error: ${error.message}`);
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
            <div className="space-y-4 border p-4 rounded-xl bg-white">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Supplier</p>
                  <p className="font-bold">{selectedOrder.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Date</p>
                  <p className="font-bold">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase text-gray-500 font-bold">Item Details</p>
                <div className="flex justify-between text-sm">
                  <span>{selectedOrder.items}</span>
                  <span className="font-medium">{selectedOrder.amount}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between font-bold">
                  <span>TOTAL PAID</span>
                  <span className="text-green-600">{selectedOrder.amount}</span>
                </div>
                <p className="text-[8px] text-gray-400 mt-2 text-center uppercase tracking-widest">Digital Copy Generated by BazaarBandhu</p>
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
    </div>
  );
}
