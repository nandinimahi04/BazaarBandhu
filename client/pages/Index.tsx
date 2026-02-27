import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Users,
  MapPin,
  Clock,
  TrendingDown,
  Mic,
  MessageCircle,
  IndianRupee,
  Package,
  Star,
  Truck,
  Timer,
  Phone,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Index() {
  const [currentOrder, setCurrentOrder] = useState({
    onions: 5,
    tomatoes: 3,
    potatoes: 8,
    oil: 2
  });

  const [groupOrderProgress, setGroupOrderProgress] = useState(75);
  const [timeRemaining, setTimeRemaining] = useState("2:35:18");
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Mock data for group members
  const groupMembers = [
    { name: "Kamlesh Bhai", stall: "Vada Pav Corner", avatar: "KB", contribution: 485 },
    { name: "Rekha Didi", stall: "Chaat Express", avatar: "RD", contribution: 320 },
    { name: "Suresh Ji", stall: "Dosa Point", avatar: "SJ", contribution: 275 },
    { name: "Aarti Ben", stall: "Pav Bhaji Hub", avatar: "AB", contribution: 190 }
  ];

  const todaysSuppliers = [
    { name: "Ravi Traders", rating: 4.8, price: "₹90/kg", distance: "1.2 km", verified: true },
    { name: "Maharaj Wholesale", rating: 4.6, price: "₹95/kg", distance: "2.1 km", verified: true },
    { name: "Fresh Mandi", rating: 4.4, price: "₹88/kg", distance: "3.5 km", verified: false }
  ];

  const savingsData = {
    today: 156,
    thisWeek: 1240,
    thisMonth: 4850
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">Saarthi+</h1>
                <p className="text-sm text-orange-700">Smart Shopping, Together</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <MapPin className="h-3 w-3 mr-1" />
                Solapur Market
              </Badge>
              <Link to="/suppliers">
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Suppliers
                </Button>
              </Link>
              <Link to="/chat">
                <Button
                  variant={isVoiceActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className="relative"
                >
                  <Mic className={cn("h-4 w-4 mr-2", isVoiceActive && "animate-pulse")} />
                  Saarthi AI
                  {isVoiceActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Voice Assistant Alert */}
        {isVoiceActive && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium text-orange-900">Saarthi AI is listening...</p>
                  <p className="text-sm text-orange-700">Try saying "Saarthi, what's the rate of garlic today?" or "Show my order"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">Today's Savings</p>
                  <p className="text-lg font-bold text-green-900">₹{savingsData.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Group Members</p>
                  <p className="text-lg font-bold text-blue-900">{groupMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link to="/orders">
            <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <Timer className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-700">Order Time Left</p>
                    <p className="text-lg font-bold text-orange-900">{timeRemaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/credit">
            <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <IndianRupee className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-700">Credit Limit</p>
                    <p className="text-lg font-bold text-purple-900">₹850</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Group Order */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                    <span>Today's Group Order</span>
                  </CardTitle>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining} left
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>लक्ष्य: ₹1500</span>
                    <span>वर्तमान: ₹{Math.round(1500 * groupOrderProgress / 100)}</span>
                  </div>
                  <Progress value={groupOrderProgress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">Onion</p>
                        <p className="text-sm text-gray-600">₹90/kg</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, onions: Math.max(0, currentOrder.onions - 1) })}>-</Button>
                        <span className="w-8 text-center">{currentOrder.onions}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, onions: currentOrder.onions + 1 })}>+</Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">Tomato</p>
                        <p className="text-sm text-gray-600">₹85/kg</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, tomatoes: Math.max(0, currentOrder.tomatoes - 1) })}>-</Button>
                        <span className="w-8 text-center">{currentOrder.tomatoes}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, tomatoes: currentOrder.tomatoes + 1 })}>+</Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">Potato</p>
                        <p className="text-sm text-gray-600">₹60/kg</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, potatoes: Math.max(0, currentOrder.potatoes - 1) })}>-</Button>
                        <span className="w-8 text-center">{currentOrder.potatoes}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, potatoes: currentOrder.potatoes + 1 })}>+</Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Oil</p>
                        <p className="text-sm text-gray-600">₹120/Ltr</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, oil: Math.max(0, currentOrder.oil - 1) })}>-</Button>
                        <span className="w-8 text-center">{currentOrder.oil}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentOrder({ ...currentOrder, oil: currentOrder.oil + 1 })}>+</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Your Total</p>
                    <p className="text-lg font-bold">₹{currentOrder.onions * 90 + currentOrder.tomatoes * 85 + currentOrder.potatoes * 60 + currentOrder.oil * 120}</p>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    Add to Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Suppliers Today */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Top Suppliers Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysSuppliers.map((supplier, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Package className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{supplier.name}</p>
                            {supplier.verified && (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {supplier.rating}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {supplier.distance}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{supplier.price}</p>
                        <Button variant="outline" size="sm">Select</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>Group Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-orange-100 text-orange-800">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.stall}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{member.contribution}</p>
                        <p className="text-xs text-green-600">+{Math.round(member.contribution * 0.15)} savings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Udhaar Chain */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-800">
                  <IndianRupee className="h-5 w-5" />
                  <span>Credit Chain</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-purple-700">Available Limit</span>
                    <span className="font-bold text-purple-900">₹850</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-purple-600 mt-1">85% Trust Score</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Outstanding Amount</span>
                    <span className="text-red-600">₹320</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next EMI</span>
                    <span className="text-orange-600">₹85 (in 3 days)</span>
                  </div>
                </div>

                <Link to="/credit">
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200">
                    Borrow Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Assistant Quick Actions */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <MessageCircle className="h-5 w-5" />
                  <span>Quick Assist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setIsVoiceActive(true)}>
                  "Today's rates"
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setIsVoiceActive(true)}>
                  "Cheapest supplier"
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setIsVoiceActive(true)}>
                  "Show my savings"
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setIsVoiceActive(true)}>
                  "About PM SVANidhi"
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
