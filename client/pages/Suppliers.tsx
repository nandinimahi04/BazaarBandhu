import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
  Shield,
  Filter,
  Heart,
  MessageCircle,
  Truck,
  IndianRupee,
  Users,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  Info,
  Zap,
  Tag,
  ArrowRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const { addToCart, itemCount, totalAmount } = useCart();

  // Mock products for each supplier with images and descriptions
  const supplierProducts: Record<number, any[]> = {
    1: [
      { id: "s1-p1", name: "Premium Onions (लाल प्याज)", price: 90, unit: "kg", category: "vegetables", image: "🧅", description: "Maharashtra special red onions, hand-picked for street food vendors." },
      { id: "s1-p2", name: "Tomato (देसी टमाटर)", price: 85, unit: "kg", category: "vegetables", image: "🍅", description: "Fresh farm-to-table tomatoes, firm and juicy." },
      { id: "s1-p3", name: "Potatoes (आलू - ज्योति)", price: 60, unit: "kg", category: "vegetables", image: "🥔", description: "Best quality potatoes for Vada Pav and French Fries." },
    ],
    2: [
      { id: "s2-p1", name: "Turmeric Powder (हल्दी)", price: 180, unit: "kg", category: "spices", image: "🧪", description: "High curcumin content, pure and unadulterated." },
      { id: "s2-p2", name: "Red Chilli (लाल मिर्च)", price: 240, unit: "kg", category: "spices", image: "🌶️", description: "Stemless hot red chillies, perfect for spicy chutneys." },
    ],
    4: [
      { id: "s4-p1", name: "Mustard Oil (सरसों तेल)", price: 120, unit: "L", category: "oil", image: "🛢️", description: "Cold-pressed pure mustard oil for authentic taste." },
      { id: "s4-p2", name: "Sunflower Oil", price: 150, unit: "L", category: "oil", image: "🌻", description: "Refined sunflower oil, low absorption." },
    ]
  };

  const categories = [
    { id: "all", name: "सभी", count: 24, icon: <Package className="w-4 h-4 mr-1" /> },
    { id: "vegetables", name: "सब्जियां", count: 8, icon: <Tag className="w-4 h-4 mr-1" /> },
    { id: "spices", name: "मसाले", count: 6, icon: <Zap className="w-4 h-4 mr-1" /> },
    { id: "oil", name: "तेल", count: 4, icon: <Droplets className="w-4 h-4 mr-1" /> },
    { id: "grains", name: "अनाज", count: 6, icon: <Wheat className="w-4 h-4 mr-1" /> }
  ];

  const suppliers = [
    {
      id: 1,
      name: "रवि ट्रेडर्स (Ravi Traders)",
      owner: "रवि भाई शर्मा",
      rating: 4.8,
      reviews: 156,
      distance: "1.2 km",
      verified: true,
      location: "सोलापुर मुख्य मंडी",
      phone: "+91 98765 43210",
      category: "vegetables",
      speciality: ["प्याज", "टमाटर", "आलू"],
      pricing: "wholesale",
      deliveryTime: "2-3 घंटे",
      minOrder: 500,
      currentOffers: ["बल्क डिस्काउंट 10%", "मुफ्त डिलीवरी"],
      totalOrders: 89,
      groupOrders: 45,
      lastDelivery: "आज सुबह 9:30",
      trustScore: 92
    },
    {
      id: 2,
      name: "महाराज होलसेल",
      owner: "सुनील महाराज",
      rating: 4.6,
      reviews: 203,
      distance: "2.1 km",
      verified: true,
      location: "न्यू मार्केट एरिया",
      phone: "+91 87654 32109",
      category: "spices",
      speciality: ["हल्दी", "लाल मिर्च", "धनिया"],
      pricing: "competitive",
      deliveryTime: "3-4 घंटे",
      minOrder: 300,
      currentOffers: ["नए ग्राहक को 15% छूट"],
      totalOrders: 67,
      groupOrders: 28,
      lastDelivery: "कल शाम 5:00",
      trustScore: 88
    },
    {
      id: 3,
      name: "फ्रेश मंडी",
      owner: "अजय कुमार",
      rating: 4.4,
      reviews: 98,
      distance: "3.5 km",
      verified: false,
      location: "किसान मार्केट",
      phone: "+91 76543 21098",
      category: "vegetables",
      speciality: ["हरी सब्जी", "फल"],
      pricing: "budget",
      deliveryTime: "4-5 घंटे",
      minOrder: 200,
      currentOffers: ["सीजनल सब्जी स्पेशल"],
      totalOrders: 34,
      groupOrders: 12,
      lastDelivery: "2 दिन पहले",
      trustScore: 75
    },
    {
      id: 4,
      name: "गुप्ता ऑयल मिल्स",
      owner: "राजेश गुप्ता",
      rating: 4.9,
      reviews: 234,
      distance: "1.8 km",
      verified: true,
      location: "इंडस्ट्रियल एरिया",
      phone: "+91 65432 10987",
      category: "oil",
      speciality: ["सरसों का तेल", "सूरजमुखी तेल"],
      pricing: "premium",
      deliveryTime: "1-2 घंटे",
      minOrder: 1000,
      currentOffers: ["कैश पेमेंट पर 5% छूट"],
      totalOrders: 123,
      groupOrders: 78,
      lastDelivery: "आज दोपहर 2:00",
      trustScore: 95
    }
  ];

  const handleQuantityChange = (id: string, delta: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const onAddToCart = (product: any, supplier: any) => {
    const qty = itemQuantities[product.id] || 1;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      unit: product.unit,
      supplierId: supplier.id.toString(),
      supplierName: supplier.name
    });
    toast.success(`${qty} ${product.unit} of ${product.name} added to cart`);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.speciality.some(item => item.includes(searchQuery));
    const matchesCategory = selectedCategory === "all" || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      case "price":
        return a.minOrder - b.minOrder;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Premium Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-orange-600 to-amber-500 p-2.5 rounded-2xl shadow-lg shadow-orange-200/50 group-hover:scale-105 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saarthi+ Market</h1>
                <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Trusted Suppliers Only</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-700">Solapur Area</span>
              </div>
              <Link to="/">
                <Button variant="ghost" size="sm" className="font-bold text-slate-600 hover:text-orange-600">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Amazon-style Search Bar */}
        <div className="max-w-4xl mx-auto mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
              <Input
                placeholder="Search for suppliers, spices, vegetables or bulk deals..."
                className="pl-12 h-14 bg-white border-2 border-slate-100 focus:border-orange-500 rounded-2xl shadow-xl shadow-slate-200/20 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-56 h-14 rounded-2xl border-2 border-slate-100 bg-white font-bold text-slate-700 shadow-xl shadow-slate-200/20">
                <SelectValue placeholder="Sort Results" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="rating" className="py-3 font-medium">Top Rated Suppliers</SelectItem>
                <SelectItem value="distance" className="py-3 font-medium">Closest to My Stall</SelectItem>
                <SelectItem value="price" className="py-3 font-medium">Lowest Minimum Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Bubbles */}
          <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center px-6 py-2.5 rounded-full text-sm font-black transition-all whitespace-nowrap border-2",
                  selectedCategory === category.id
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                    : "bg-white border-slate-100 text-slate-600 hover:border-orange-200 hover:text-orange-600"
                )}
              >
                {category.icon} {category.name} <span className="ml-2 opacity-50 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-900">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Supplier Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedSuppliers.map((supplier) => (
                <Card key={supplier.id} className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-orange-100 p-0.5">
                            <AvatarFallback className="bg-orange-50 text-orange-600 font-black text-xl">
                              {supplier.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {supplier.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                              <Shield className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-black text-xl text-slate-900">{supplier.name}</h3>
                          </div>
                          <p className="text-sm font-bold text-slate-500">{supplier.owner}</p>
                        </div>
                      </div>
                      <button className="p-2.5 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                        <div className="flex items-center justify-center text-amber-500 mt-1">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          <span className="text-sm font-black text-slate-900">{supplier.rating}</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust</p>
                        <div className="flex items-center justify-center text-emerald-600 mt-1">
                          <Zap className="h-3 w-3 fill-current mr-1" />
                          <span className="text-sm font-black text-slate-900">{supplier.trustScore}%</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ETA</p>
                        <div className="flex items-center justify-center text-blue-600 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="text-xs font-black text-slate-900">{supplier.deliveryTime.split(' ')[0]}h</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-sm font-medium truncate">{supplier.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {supplier.speciality.map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded-full tracking-wider">
                            {item}
                          </span>
                        ))}
                      </div>

                      {supplier.currentOffers.length > 0 && (
                        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                          <div className="flex items-center text-orange-700 text-xs font-black uppercase tracking-widest mb-1">
                            <Zap className="h-3 w-3 mr-1" /> Today's Offer
                          </div>
                          {supplier.currentOffers.map((offer, index) => (
                            <p key={index} className="text-xs font-bold text-orange-900/70">{offer}</p>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-3 pt-4 border-t border-slate-50">
                        <Button variant="outline" className="flex-1 rounded-2xl font-bold border-slate-200">
                          Chat
                        </Button>
                        <Button
                          className="flex-1 rounded-2xl font-black bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                          onClick={() => {
                            setSelectedSupplierForProducts(supplier);
                            setIsProductModalOpen(true);
                          }}
                        >
                          View Catalog <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
              <div className="p-8">
                <h4 className="text-xl font-black mb-6">Market Insights</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-sm font-bold">Onion Rates</span>
                    </div>
                    <span className="text-sm font-black text-green-400">Stable</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      </div>
                      <span className="text-sm font-bold">Oil Prices</span>
                    </div>
                    <span className="text-sm font-black text-red-400">-5%</span>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Recommendation</p>
                  <p className="text-xs font-bold leading-relaxed opacity-80">Bulk purchase suggested for Spices this week. Prices expected to rise by 12% next month.</p>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black italic">Bazaar Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.sort((a, b) => b.rating - a.rating).slice(0, 3).map((supplier, index) => (
                    <div key={supplier.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                        index === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{supplier.name.split(' ')[0]}</p>
                        <div className="flex items-center space-x-1 opacity-60">
                          <Star className="h-2 w-2 fill-current" />
                          <span className="text-[10px] font-black">{supplier.rating}</span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Amazon-style Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
          <Link to="/checkout">
            <button className="h-20 px-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-400 flex items-center space-x-6 hover:scale-105 transition-all group overflow-hidden">
              <div className="relative">
                <ShoppingCart className="w-8 h-8 text-white relative z-10" />
                <div className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-orange-600 text-white flex items-center justify-center border-4 border-slate-900 font-black text-xs">
                  {itemCount}
                </div>
              </div>
              <div className="text-left py-1 pr-6 border-r border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Items in Cart</p>
                <p className="text-2xl font-black italic">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex items-center font-black uppercase text-[10px] tracking-[0.2em]">
                Checkout <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </Link>
        </div>
      )}

      {/* Amazon-style Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-[#F8FAFC]">
          <DialogHeader className="p-8 pb-4 bg-white">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900">{selectedSupplierForProducts?.name}</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">Verified Supplier • {selectedSupplierForProducts?.deliveryTime} Delivery</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 no-scrollbar">
            {(supplierProducts[selectedSupplierForProducts?.id] || [
              { id: "misc-1", name: "Fresh Item 1", price: 100, unit: "kg", image: "📦", description: "Standard quality item for daily business needs." },
              { id: "misc-2", name: "Budget Pack 2", price: 150, unit: "pack", image: "📦", description: "Value for money pack with wholesale pricing." }
            ]).map((product) => (
              <div key={product.id} className="group p-5 bg-white rounded-[2rem] border-2 border-slate-50 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-200/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {product.image}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{product.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.description}</p>
                      <p className="text-lg font-black text-orange-600 mt-2">₹{product.price} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ {product.unit}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 shadow-inner">
                      <button
                        onClick={() => handleQuantityChange(product.id, -1)}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:text-orange-600 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-black text-slate-900">
                        {itemQuantities[product.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:text-orange-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-xl font-black bg-slate-900 text-white shadow-lg shadow-slate-200 py-6"
                      onClick={() => onAddToCart(product, selectedSupplierForProducts)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-8 bg-white border-t border-slate-50">
            <div className="flex flex-col w-full gap-4">
              {itemCount > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-orange-50 rounded-2xl border border-orange-100 mb-2">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-orange-900">{itemCount} items in cart</span>
                  </div>
                  <span className="font-black text-orange-600 text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold border-slate-100">
                  Keep Shopping
                </Button>
                {itemCount > 0 && (
                  <Link to="/checkout" className="flex-1">
                    <Button className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 font-black shadow-xl shadow-orange-100 flex items-center justify-center">
                      Secure Checkout <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing icons for the categories list above
function Droplets(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 16.3c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z" />
      <path d="M17 10.3c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z" />
      <path d="M14 20.3c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z" />
    </svg>
  )
}

function Wheat(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 22s5-3 5-10" />
      <path d="M7 12c1.4-1.4 3-2 5-2s3.6.6 5 2" />
      <path d="M7 12c-1.4 1.4-2 3-2 5s.6 3.6 2 5" />
      <path d="M12 10c1.4-1.4 3-2 5-2s3.6.6 5 2" />
      <path d="M12 10c-1.4 1.4-2 3-2 5s.6 3.6 2 5" />
      <path d="M17 8c1.4-1.4 3-2 5-2s3.6.6 5 2" />
      <path d="M17 8c-1.4 1.4-2 3-2 5s.6 3.6 2 5" />
    </svg>
  )
}
