import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Star,
  IndianRupee,
  Users,
  Calendar,
  Filter,
  Search,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "dispatched": return "bg-orange-100 text-orange-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "प्रतीक्षित";
      case "confirmed": return "पुष्टि की गई";
      case "processing": return "पैकिंग में";
      case "dispatched": return "भेज दिया गया";
      case "delivered": return "डिलीवर हो गया";
      case "cancelled": return "रद्ध";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">BazaarBandhu</h1>
                <p className="text-sm text-orange-700">ऑर्डर ट्रैकिंग</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Package className="h-3 w-3 mr-1" />
                {activeOrders.length} सक्रिय ऑर्डर
              </Badge>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  डैशबोर्ड
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>सक्रिय ऑर्डर ({activeOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>पुराने ऑर्डर ({pastOrders.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length > 0 ? activeOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">ऑर्डर #{order._id.slice(-6)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(order.placedAt).toLocaleDateString()} • {new Date(order.placedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalAmount}</p>
                      <p className="text-sm text-green-600">₹{order.savings} की बचत</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">ऑर्डर विवरण</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} ({item.quantity} {item.unit})</span>
                            <span>₹{item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">सप्लायर और डिलीवरी</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-orange-100 text-orange-800">
                              {order.supplier?.businessName?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{order.supplier?.businessName}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{order.supplier?.rating || "4.5"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{order.delivery?.address?.city}, {order.delivery?.address?.state}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-3 w-3 mr-1" />
                      सप्लायर को कॉल करें
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Truck className="h-3 w-3 mr-1" />
                      लाइव ट्रैकिंग
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-gray-500">कोई सक्रिय ऑर्डर नहीं है</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.map((order) => (
              <Card key={order._id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">ऑर्डर #{order._id.slice(-6)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(order.placedAt).toLocaleDateString()} • {order.supplier?.businessName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">₹{order.totalAmount}</p>
                      <p className="text-sm text-green-600">₹{order.savings} बचत</p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      बिल डाउनलोड करें
                    </Button>
                    <Button variant="outline" size="sm">
                      दोबारा ऑर्डर करें
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
