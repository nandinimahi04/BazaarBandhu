import React, { useState, useEffect } from "react";
import { User } from "@/server/models/User";
import { Order } from "@/entities/Order";
import { Inventory } from "@/entities/Inventory";
import { Product } from "@/entities/Product";
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
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlySpent: 0,
    lowStockItems: 0,
    activeSuppliers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load orders
      const orders = await Order.filter({ vendor_id: user.id }, '-created_date', 50);
      setRecentOrders(orders.slice(0, 5));

      // Load inventory alerts
      const inventory = await Inventory.filter({ vendor_id: user.id });
      const alerts = inventory.filter(item => item.current_stock <= item.minimum_threshold);
      setLowStockAlerts(alerts);

      // Calculate stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyOrders = orders.filter(order => 
        new Date(order.created_date) >= thisMonth && order.payment_status === 'paid'
      );
      
      const monthlySpent = monthlyOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const suppliers = [...new Set(orders.map(order => order.supplier_id))];

      setStats({
        totalOrders: orders.length,
        monthlySpent: monthlySpent,
        lowStockItems: alerts.length,
        activeSuppliers: suppliers.length
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const lang = currentUser?.preferred_language || 'hindi';
    
    const greetings = {
      hindi: hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : 'शुभ संध्या',
      english: hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening',
      gujarati: hour < 12 ? 'સુપ્રભાત' : hour < 17 ? 'નમસ્તે' : 'શુભ સાંજ',
      tamil: hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'வணக்கம்' : 'மாலை வணக்கம்'
    };

    return greetings[lang] || greetings.hindi;
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
              {getGreeting()}, {currentUser?.full_name?.split(' ')[0]}! 🍛
            </h1>
            <p className="text-gray-600 text-lg">
              {currentUser?.preferred_language === 'english' 
                ? "Here's what's happening with your street food business today"
                : "आज आपके स्ट्रीट फूड बिजनेस में क्या हो रहा है"
              }
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {currentUser?.address?.city}, {currentUser?.address?.state}
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
                  {currentUser?.preferred_language === 'english' ? 'Total Orders' : 'कुल ऑर्डर'}
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
                  {currentUser?.preferred_language === 'english' ? 'Monthly Spent' : 'मासिक खर्च'}
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
                  {currentUser?.preferred_language === 'english' ? 'Low Stock Items' : 'कम स्टॉक'}
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
                  {currentUser?.preferred_language === 'english' ? 'Active Suppliers' : 'सक्रिय सप्लायर'}
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
        <Link to={createPageUrl('AIAssistant')}>
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <MessageCircle className="w-8 h-8" />
            <span className="text-sm font-medium">
              {currentUser?.preferred_language === 'english' ? 'AI Assistant' : 'AI सहायक'}
            </span>
          </Button>
        </Link>
        
        <Link to={createPageUrl('Markets')}>
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <Store className="w-8 h-8" />
            <span className="text-sm font-medium">
              {currentUser?.preferred_language === 'english' ? 'Browse Markets' : 'मार्केट देखें'}
            </span>
          </Button>
        </Link>
        
        <Link to={createPageUrl('Storage')}>
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <Package className="w-8 h-8" />
            <span className="text-sm font-medium">
              {currentUser?.preferred_language === 'english' ? 'Check Storage' : 'स्टोरेज देखें'}
            </span>
          </Button>
        </Link>
        
        <Link to={createPageUrl('Orders')}>
          <Button className="w-full h-24 clay-button flex flex-col items-center justify-center space-y-2">
            <Clock className="w-8 h-8" />
            <span className="text-sm font-medium">
              {currentUser?.preferred_language === 'english' ? 'My Orders' : 'मेरे ऑर्डर'}
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
              {currentUser?.preferred_language === 'english' ? 'Recent Orders' : 'हाल के ऑर्डर'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.created_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.total_amount}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
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
                <p>{currentUser?.preferred_language === 'english' ? 'No orders yet. Start shopping!' : 'अभी तक कोई ऑर्डर नहीं। खरीदारी शुरू करें!'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="clay-element">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {currentUser?.preferred_language === 'english' ? 'Low Stock Alerts' : 'स्टॉक अलर्ट'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length > 0 ? (
              <div className="space-y-4">
                {lowStockAlerts.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {item.current_stock} {item.unit}
                      </p>
                    </div>
                    <Button size="sm" className="clay-button">
                      {currentUser?.preferred_language === 'english' ? 'Reorder' : 'री-ऑर्डर'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{currentUser?.preferred_language === 'english' ? 'All items are well stocked!' : 'सभी चीजों का स्टॉक भरपूर है!'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}