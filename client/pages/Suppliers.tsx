import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Shield,
  Filter,
  Heart,
  MessageCircle,
  Truck,
  IndianRupee,
  Users,
  CheckCircle,
  Plus,
  ShoppingCart,
  ChevronRight
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

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { addToCart, itemCount, totalAmount } = useCart();

  // Mock products for each supplier
  const supplierProducts: Record<number, any[]> = {
    1: [
      { id: "s1-p1", name: "प्याज (Onion)", price: 90, unit: "kg", category: "vegetables" },
      { id: "s1-p2", name: "टमाटर (Tomato)", price: 85, unit: "kg", category: "vegetables" },
      { id: "s1-p3", name: "आलू (Potato)", price: 60, unit: "kg", category: "vegetables" },
    ],
    2: [
      { id: "s2-p1", name: "हल्दी पाउडर", price: 180, unit: "kg", category: "spices" },
      { id: "s2-p2", name: "लाल मिर्च", price: 240, unit: "kg", category: "spices" },
    ],
    4: [
      { id: "s4-p1", name: "सरसों तेल", price: 120, unit: "L", category: "oil" },
      { id: "s4-p2", name: "सूरजमुखी तेल", price: 150, unit: "L", category: "oil" },
    ]
  };

  const categories = [
    { id: "all", name: "सभी", count: 24 },
    { id: "vegetables", name: "सब्जियां", count: 8 },
    { id: "spices", name: "मसाले", count: 6 },
    { id: "oil", name: "तेल", count: 4 },
    { id: "grains", name: "अनाज", count: 6 }
  ];

  const suppliers = [
    {
      id: 1,
      name: "रवि ट्रेडर्स",
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

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case "wholesale":
        return <Badge className="bg-green-100 text-green-800 border-green-300">होलसेल रेट</Badge>;
      case "competitive":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">प्रतिस्पर्धी</Badge>;
      case "budget":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">बजट फ्रेंडली</Badge>;
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">प्रीमियम</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">Saarthi+</h1>
                <p className="text-sm text-orange-700">विश्वसनीय सप्लायर्स</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <MapPin className="h-3 w-3 mr-1" />
                सोलापुर एरिया
              </Badge>
              <Link to="/">
                <Button variant="outline" size="sm">
                  डैशबोर्ड
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="सप्लायर या सामान का नाम खोजें..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="सॉर्ट करें" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">रेटिंग के अनुसार</SelectItem>
                <SelectItem value="distance">दूरी के अनुसार</SelectItem>
                <SelectItem value="price">मिन ऑर्डर के अनुसार</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suppliers List */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-orange-100 text-orange-800 font-semibold">
                            {supplier.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{supplier.name}</h3>
                            {supplier.verified && (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{supplier.owner}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{supplier.rating}</span>
                              <span className="text-xs text-gray-500">({supplier.reviews})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{supplier.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{supplier.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {supplier.speciality.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{supplier.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">मिन ₹{supplier.minOrder}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {getPricingBadge(supplier.pricing)}
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>ट्रस्ट स्कोर: {supplier.trustScore}%</span>
                      </div>
                    </div>

                    {supplier.currentOffers.length > 0 && (
                      <div className="bg-yellow-50 p-2 rounded-lg">
                        <p className="text-xs font-medium text-yellow-800 mb-1">आज के ऑफर:</p>
                        {supplier.currentOffers.map((offer, index) => (
                          <p key={index} className="text-xs text-yellow-700">• {offer}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        संपर्क कर���ं
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedSupplierForProducts(supplier);
                          setIsProductModalOpen(true);
                        }}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        ऑर्डर करें
                      </Button>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>कुल ऑर्डर: {supplier.totalOrders}</span>
                      <span>समूह ऑर्डर: {supplier.groupOrders}</span>
                      <span>अंतिम डिलीवरी: {supplier.lastDelivery}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedSuppliers.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">कोई सप्लायर नहीं मिला</p>
                  <p className="text-sm text-gray-500 mt-1">खोज की शर्तें बदलकर दोबारा कोशिश करें</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">त्वरित जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">24</p>
                  <p className="text-sm text-gray-600">कुल सप्लायर्स</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">18</p>
                  <p className="text-sm text-gray-600">वेरिफाइड सप्लायर्स</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">4.7</p>
                  <p className="text-sm text-gray-600">औसत रेटिंग</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Rated */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>टॉप रेटेड</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliers.sort((a, b) => b.rating - a.rating).slice(0, 3).map((supplier, index) => (
                    <div key={supplier.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{supplier.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>हाल की गतिविधि</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>गुप्ता ऑयल मिल्स से डिलीवरी</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>नया सप्लायर जोड़ा गया</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>रेट अपडेट हुए</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <Link to="/checkout">
          <div className="fixed bottom-6 right-6 z-50">
            <Button className="h-16 px-6 rounded-full bg-orange-600 hover:bg-orange-700 shadow-2xl shadow-orange-500/40 flex items-center space-x-3 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500" />
              <div className="relative flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-white" />
                  <Badge className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white text-orange-600 flex items-center justify-center border-2 border-orange-600 font-bold p-0">
                    {itemCount}
                  </Badge>
                </div>
                <div className="text-left border-l border-white/20 pl-3">
                  <p className="text-[10px] text-orange-100 uppercase font-bold tracking-wider">Your Cart</p>
                  <p className="text-lg font-bold text-white leading-none">₹{totalAmount}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </div>
        </Link>
      )}

      {/* Product Selection Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedSupplierForProducts?.name} - Catalog</DialogTitle>
            <DialogDescription>
              Select items to add to your group order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {(supplierProducts[selectedSupplierForProducts?.id] || [
              { id: "misc-1", name: "Sample Item 1", price: 100, unit: "kg" },
              { id: "misc-2", name: "Sample Item 2", price: 150, unit: "pack" }
            ]).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">₹{product.price}/{product.unit}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 shadow-sm"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      unit: product.unit,
                      supplierId: selectedSupplierForProducts.id.toString(),
                      supplierName: selectedSupplierForProducts.name
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="w-full">
              Continue Shopping
            </Button>
            {itemCount > 0 && (
              <Link to="/checkout" className="w-full">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Go to Checkout
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
