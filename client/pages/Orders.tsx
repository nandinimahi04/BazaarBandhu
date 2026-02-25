import { useState } from "react";
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

export default function Orders() {
  const [activeTab, setActiveTab] = useState("active");
  
  const activeOrders = [
    {
      id: "SRT-001",
      date: "आज",
      time: "सुबह 10:30",
      status: "पैकिंग में",
      progress: 60,
      supplier: "रवि ट्रेडर्स",
      supplierRating: 4.8,
      estimatedDelivery: "दोपहर 2:30",
      items: [
        { name: "प्याज", quantity: "5 किग्रा", price: 450 },
        { name: "टमाटर", quantity: "3 किग्रा", price: 255 },
        { name: "आलू", quantity: "8 किग्रा", price: 480 }
      ],
      totalAmount: 1185,
      savings: 178,
      groupMembers: 4,
      deliveryLocation: "सोलापुर सेंट्रल मार्केट",
      trackingUpdates: [
        { time: "10:30", status: "ऑर्डर कन्फर्म", completed: true },
        { time: "11:00", status: "पैकिंग शुरू", completed: true },
        { time: "12:00", status: "डिस्पैच", completed: false },
        { time: "14:30", status: "डिलीवरी", completed: false }
      ]
    },
    {
      id: "SRT-002",
      date: "आज",
      time: "दोपहर 1:15",
      status: "ऑर्डर कन्फर्म",
      progress: 25,
      supplier: "गुप्त��� ऑयल मिल्स",
      supplierRating: 4.9,
      estimatedDelivery: "शाम 5:00",
      items: [
        { name: "सरसों का तेल", quantity: "2 लीटर", price: 240 },
        { name: "सूरजमुखी तेल", quantity: "1 लीटर", price: 120 }
      ],
      totalAmount: 360,
      savings: 54,
      groupMembers: 3,
      deliveryLocation: "सोलापुर सेंट्रल मार्केट",
      trackingUpdates: [
        { time: "13:15", status: "ऑर्डर कन्फर्म", completed: true },
        { time: "14:00", status: "पैकिंग शुरू", completed: false },
        { time: "15:30", status: "डिस्पैच", completed: false },
        { time: "17:00", status: "डिलीवरी", completed: false }
      ]
    }
  ];

  const pastOrders = [
    {
      id: "SRT-098",
      date: "कल",
      time: "सुबह 9:00",
      status: "डिलीवर हो गया",
      supplier: "महाराज होलसेल",
      supplierRating: 4.6,
      deliveredAt: "दोपहर 1:30",
      items: [
        { name: "लाल मिर्च पाउडर", quantity: "1 किग्रा", price: 200 },
        { name: "हल्दी पाउडर", quantity: "500 ग्राम", price: 150 },
        { name: "धनिया पाउडर", quantity: "500 ग्राम", price: 80 }
      ],
      totalAmount: 430,
      savings: 65,
      groupMembers: 5,
      rating: 5
    },
    {
      id: "SRT-097",
      date: "2 दिन पहले",
      time: "सुबह 8:30",
      status: "डिलीवर हो गया",
      supplier: "रवि ट्रेडर्स",
      supplierRating: 4.8,
      deliveredAt: "दोपहर 12:00",
      items: [
        { name: "प्याज", quantity: "10 किग्रा", price: 900 },
        { name: "अदरक", quantity: "1 किग्रा", price: 180 }
      ],
      totalAmount: 1080,
      savings: 162,
      groupMembers: 6,
      rating: 4
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ऑर्डर कन्फर्म": return "bg-blue-100 text-blue-800";
      case "पैकिंग में": return "bg-yellow-100 text-yellow-800";
      case "डिस्पैच": return "bg-orange-100 text-orange-800";
      case "डिलीवरी": return "bg-green-100 text-green-800";
      case "डिलीवर ���ो गया": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
                <p className="text-sm text-orange-700">ऑर्डर ट्रैकिंग</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Package className="h-3 w-3 mr-1" />
                {activeOrders.length} सक्रिय ऑर्डर
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
            {activeOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">ऑर्डर #{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.date} • {order.time}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalAmount}</p>
                      <p className="text-sm text-green-600">₹{order.savings} की बचत</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress Tracking */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>प्रगति</span>
                      <span>{order.progress}% पूर्ण</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                    
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {order.trackingUpdates.map((update, index) => (
                        <div key={index} className="text-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center",
                            update.completed 
                              ? "bg-green-500 text-white" 
                              : "bg-gray-200 text-gray-500"
                          )}>
                            {update.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <p className="text-xs font-medium">{update.time}</p>
                          <p className="text-xs text-gray-600">{update.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Details */}
                    <div>
                      <h4 className="font-medium mb-3">ऑर्डर विवरण</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} ({item.quantity})</span>
                            <span>₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{order.groupMembers} सदस्यों के साथ समूह ऑर्डर</span>
                        </div>
                      </div>
                    </div>

                    {/* Supplier & Delivery Info */}
                    <div>
                      <h4 className="font-medium mb-3">सप्लायर और डिलीवरी</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-orange-100 text-orange-800">
                              {order.supplier.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{order.supplier}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{order.supplierRating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{order.deliveryLocation}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>अनुमानित डिलीवरी: {order.estimatedDelivery}</span>
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
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">ऑर्डर #{order.id}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.date} • {order.supplier} • {order.deliveredAt} पर डिलीवर
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3",
                                i < order.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                              )} 
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">({order.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">₹{order.totalAmount}</p>
                      <p className="text-sm text-green-600">₹{order.savings} बचत</p>
                      <p className="text-xs text-gray-500">{order.groupMembers} सदस्य</p>
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
