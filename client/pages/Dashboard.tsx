import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Store,
  IndianRupee,
  Clock,
  Utensils,
  Users,
  MapPin,
  Search,
  Plus,
  Minus,
  Edit2,
  Trash2,
  CheckCircle2,
  Shield,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlySpent: 0,
    lowStockItems: 0,
    activeSuppliers: 0
  });
  const [vendorData, setVendorData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [newItem, setNewItem] = useState({ productName: "", quantity: 0, unit: "kg", category: "Vegetables", threshold: 5 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await api.get("/vendors/profile");
      setVendorData(data);
      setInventoryItems(data.currentInventory || []);

      try {
        const ordersData = await api.get("/orders");
        setRecentOrders(ordersData.orders?.slice(0, 5) || []);

        const statsData = await api.get("/vendors/analytics");
        setStats({
          totalOrders: statsData.analytics?.totalOrders || ordersData.pagination?.total || 0,
          monthlySpent: statsData.analytics?.totalSpent || 0,
          lowStockItems: (data.currentInventory || []).filter((item: any) => item.quantity <= (item.threshold || 5)).length,
          activeSuppliers: data.preferredSuppliers?.length || 0
        });
      } catch (innerError) {
        console.warn("Could not load stats/orders:", innerError);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("डैशबोर्ड डेटा लोड करने में विफल");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.productName) {
      toast.error("कृपया उत्पाद का नाम दर्ज करें");
      return;
    }
    try {
      const data = await api.patch("/vendors/inventory", { product: newItem });
      setInventoryItems(data.inventory);
      setIsAddInventoryOpen(false);
      setNewItem({ productName: "", quantity: 0, unit: "kg", category: "Vegetables", threshold: 5 });
      toast.success(`${newItem.productName} जोड़ा गया`);

      // Update low stock count in stats
      setStats(prev => ({
        ...prev,
        lowStockItems: data.inventory.filter((item: any) => item.quantity <= (item.threshold || 5)).length
      }));
    } catch (error: any) {
      toast.error(error.message || "आइटम जोड़ने में विफल");
    }
  };

  const updateStock = async (productName: string, delta: number) => {
    const item = inventoryItems.find(i => i.productName === productName);
    if (!item) return;

    try {
      const newQty = Math.max(0, item.quantity + delta);
      const data = await api.patch("/vendors/inventory", {
        product: { ...item, quantity: newQty }
      });
      setInventoryItems(data.inventory);

      // Update low stock count in stats
      setStats(prev => ({
        ...prev,
        lowStockItems: data.inventory.filter((item: any) => item.quantity <= (item.threshold || 5)).length
      }));
    } catch (error: any) {
      toast.error("स्टॉक अपडेट करने में विफल");
    }
  };

  const deleteItem = async (productName: string) => {
    try {
      const data = await api.delete(`/vendors/inventory/${productName}`);
      setInventoryItems(data.inventory);
      toast.success("आइटम हटा दिया गया");

      setStats(prev => ({
        ...prev,
        lowStockItems: data.inventory.filter((item: any) => item.quantity <= (item.threshold || 5)).length
      }));
    } catch (error: any) {
      toast.error("हटाने में विफल");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const lang = vendorData?.aiAssistant?.preferredLanguage || 'hi';

    const greetings: Record<string, any> = {
      hi: hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : 'शुभ संध्या',
      en: hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening',
    };

    return greetings[lang] || greetings.hi;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="clay-element animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const lowStockAlerts = inventoryItems.filter(item => item.quantity <= (item.threshold || 5));
  const isEnglish = vendorData?.aiAssistant?.preferredLanguage === 'en';

  return (
    <div className="p-6 space-y-6">
      <style>{`
        .clay-element {
          background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8));
          box-shadow: 0 8px 32px rgba(255, 140, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .clay-button {
          background: linear-gradient(145deg, #FFE4B5, #FFA500);
          box-shadow: 0 6px 20px rgba(255, 140, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.3);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .clay-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 140, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        
        .gradient-text {
          background: linear-gradient(145deg, #FF8C00, #FF6347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .street-food-theme {
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%);
        }
      `}</style>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full clay-element street-food-theme flex items-center justify-center">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              {getGreeting()}, {vendorData?.fullName?.split(' ')[0]}! 🍛
            </h1>
            <p className="text-gray-600 text-lg">
              {isEnglish
                ? "Here's what's happening with your street food business today"
                : "आज आपके स्ट्रीट फूड बिजनेस में क्या हो रहा है"
              }
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {vendorData?.address?.city}, {vendorData?.address?.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="clay-element">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isEnglish ? 'Total Orders' : 'कुल ऑर्डर'}
                </p>
                <p className="text-3xl font-bold gradient-text">{stats.totalOrders}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-400 rounded-full clay-element flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-element">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isEnglish ? 'Monthly Spent' : 'मासिक खर्च'}
                </p>
                <p className="text-3xl font-bold gradient-text">₹{stats.monthlySpent.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full clay-element flex items-center justify-center">
                <IndianRupee className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-element">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isEnglish ? 'Low Stock Items' : 'कम स्टॉक'}
                </p>
                <p className="text-3xl font-bold text-orange-600">{stats.lowStockItems}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full clay-element flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-element">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isEnglish ? 'Active Suppliers' : 'सक्रिय सप्लायर'}
                </p>
                <p className="text-3xl font-bold gradient-text">{stats.activeSuppliers}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full clay-element flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/ai-assistant">
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <MessageCircle className="w-8 h-8" />
            <span className="text-sm font-medium">
              {isEnglish ? 'AI Assistant' : 'AI सहायक'}
            </span>
          </Button>
        </Link>

        <Link to="/suppliers">
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <Store className="w-8 h-8" />
            <span className="text-sm font-medium">
              {isEnglish ? 'Browse Markets' : 'मार्केट देखें'}
            </span>
          </Button>
        </Link>

        <Button
          className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2 text-white"
          onClick={() => setIsAddInventoryOpen(true)}
        >
          <Package className="w-8 h-8" />
          <span className="text-sm font-medium">
            {isEnglish ? 'Check Storage' : 'स्टोरेज देखें'}
          </span>
        </Button>

        <Link to="/orders">
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <Clock className="w-8 h-8" />
            <span className="text-sm font-medium">
              {isEnglish ? 'My Orders' : 'मेरे ऑर्डर'}
            </span>
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="clay-element">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {isEnglish ? 'Recent Orders' : 'हाल के ऑर्डर'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.placedAt || order.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalAmount}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isEnglish ? 'No orders yet. Start shopping!' : 'अभी तक कोई ऑर्डर नहीं। खरीदारी शुरू करें!'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="clay-element">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="gradient-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {isEnglish ? 'Low Stock Alerts' : 'स्टॉक अलर्ट'}
            </CardTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {lowStockAlerts.length} Issues
            </Badge>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length > 0 ? (
              <div className="space-y-4">
                {lowStockAlerts.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200 group hover:border-orange-400 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Current: <span className="text-orange-600 font-bold">{item.quantity} {item.unit}</span>
                      </p>
                      <p className="text-[10px] text-gray-400">Threshold: {item.threshold || 5} {item.unit}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => updateStock(item.productName, 5)}>
                        <Plus className="w-4 h-4 text-orange-600" />
                      </Button>
                      <Link to="/suppliers">
                        <Button size="sm" className="clay-button h-8">
                          {isEnglish ? 'Order' : 'ऑर्डर'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p>{isEnglish ? 'All items are well stocked!' : 'सभी चीजों का स्टॉक भरपूर है!'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management Section */}
      <Card className="clay-element mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold gradient-text">Inventory Tracker</CardTitle>
            <p className="text-sm text-slate-500">Manage your shop's stock levels and usage.</p>
          </div>
          <Dialog open={isAddInventoryOpen} onOpenChange={setIsAddInventoryOpen}>
            <DialogTrigger asChild>
              <Button className="clay-button text-white">
                <Plus className="w-5 h-5 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Stock Item</DialogTitle>
                <DialogDescription>Add items you use daily in your business.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Item Name (e.g. Onion, Oil)</label>
                  <Input
                    placeholder="Onion"
                    value={newItem.productName}
                    onChange={e => setNewItem({ ...newItem, productName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Initial Qty</label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      value={newItem.unit}
                      onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Minimum Threshold (Alert below this)</label>
                  <Input
                    type="number"
                    value={newItem.threshold}
                    onChange={e => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddInventoryOpen(false)}>Cancel</Button>
                <Button className="clay-button text-white" onClick={handleAddItem}>Save Inventory</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-white/60 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  <p className={`text-xl font-black ${item.quantity <= (item.threshold || 5) ? 'text-red-500' : 'text-slate-900'}`}>
                    {item.quantity} {item.unit}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">{item.category}</Badge>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateStock(item.productName, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateStock(item.productName, 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] text-red-400 hover:text-red-600"
                    onClick={() => deleteItem(item.productName)}
                  >
                    Delete Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}