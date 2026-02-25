import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Award, 
  TrendingUp, 
  Target, 
  Handshake,
  Shield,
  Heart,
  Edit,
  Camera,
  Settings,
  Bell,
  CreditCard,
  Package,
  Truck,
  BarChart3,
  Trophy,
  CheckCircle,
  Clock,
  IndianRupee
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function VendorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  
  const vendorData = {
    name: "Kamlesh Bhai Patel",
    businessName: "Kamlesh Vada Pav Center", 
    phone: "+91 98765 43210",
    email: "kamlesh.vp@gmail.com",
    location: "Solapur Central Market",
    address: "Shop 45, Central Market Road, Solapur, Maharashtra 413001",
    joinedDate: "March 2024",
    stallType: "Vada Pav & Snacks",
    dailyFootfall: 200,
    avgOrderValue: 125,
    businessHours: "6:00 AM - 10:00 PM",
    avatar: "KP"
  };

  const stats = {
    trustScore: 92,
    totalOrders: 1248,
    totalSavings: 215000,
    successfulDeliveries: 1225,
    groupContributions: 156,
    referralCount: 12,
    sustainabilityScore: 88,
    businessGrowth: 23
  };

  const achievements = [
    { id: 1, title: "Top Saver", description: "Saved ₹50,000+ in 6 months", icon: Trophy, color: "text-yellow-600", earned: true },
    { id: 2, title: "Group Leader", description: "Led 50+ group orders", icon: Handshake, color: "text-blue-600", earned: true },
    { id: 3, title: "Eco Warrior", description: "Zero food waste for 30 days", icon: Heart, color: "text-green-600", earned: true },
    { id: 4, title: "Trust Champion", description: "90+ trust score for 3 months", icon: Shield, color: "text-purple-600", earned: true },
    { id: 5, title: "Growth Master", description: "25% business growth", icon: TrendingUp, color: "text-orange-600", earned: false },
    { id: 6, title: "Community Builder", description: "Refer 20+ vendors", icon: Award, color: "text-pink-600", earned: false }
  ];

  const recentActivity = [
    { id: 1, type: "order", message: "Placed group order for 50kg onions", time: "2 hours ago", icon: Package },
    { id: 2, type: "saving", message: "Saved ₹245 on today's purchases", time: "4 hours ago", icon: IndianRupee },
    { id: 3, type: "delivery", message: "Order delivered successfully", time: "1 day ago", icon: Truck },
    { id: 4, type: "achievement", message: "Earned 'Trust Champion' badge", time: "2 days ago", icon: Trophy },
    { id: 5, type: "referral", message: "Referred Suresh Ji to BazaarBandhu", time: "3 days ago", icon: Handshake }
  ];

  const subscriptions = [
    { id: 1, item: "Onions", quantity: "100kg", frequency: "Weekly", nextDelivery: "Tomorrow", active: true, savings: 1250 },
    { id: 2, item: "Oil", quantity: "20L", frequency: "Bi-weekly", nextDelivery: "5 days", active: true, savings: 580 },
    { id: 3, item: "Potatoes", quantity: "50kg", frequency: "Weekly", nextDelivery: "3 days", active: false, savings: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="glass-card marketplace-shadow sticky top-0 z-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-2xl marketplace-floating">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Vendor Profile</h1>
                <p className="text-sm text-green-700">Manage your BazaarBandhu profile</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="marketplace-floating"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card className="gradient-card marketplace-shadow">
              <CardContent className="py-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 mx-auto marketplace-floating">
                      <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white text-2xl">
                        {vendorData.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input value={vendorData.name} className="text-center font-semibold" />
                        <Input value={vendorData.businessName} className="text-center text-sm" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-gray-900">{vendorData.name}</h2>
                        <p className="text-green-700 font-medium">{vendorData.businessName}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Badge className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Trust: {stats.trustScore}%
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      Member since {vendorData.joinedDate}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="gradient-card marketplace-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Phone</Label>
                  {isEditing ? (
                    <Input value={vendorData.phone} />
                  ) : (
                    <p className="text-sm font-medium">{vendorData.phone}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Email</Label>
                  {isEditing ? (
                    <Input value={vendorData.email} />
                  ) : (
                    <p className="text-sm font-medium">{vendorData.email}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Location</Label>
                  {isEditing ? (
                    <Input value={vendorData.location} />
                  ) : (
                    <p className="text-sm font-medium flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      {vendorData.location}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="gradient-card marketplace-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">₹{(stats.totalSavings / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-600">Total Savings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.groupContributions}</p>
                    <p className="text-xs text-gray-600">Group Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.referralCount}</p>
                    <p className="text-xs text-gray-600">Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm marketplace-shadow">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Trust Score</span>
                            <span className="font-medium">{stats.trustScore}%</span>
                          </div>
                          <Progress value={stats.trustScore} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Delivery Success</span>
                            <span className="font-medium">{Math.round((stats.successfulDeliveries / stats.totalOrders) * 100)}%</span>
                          </div>
                          <Progress value={(stats.successfulDeliveries / stats.totalOrders) * 100} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Sustainability Score</span>
                            <span className="font-medium">{stats.sustainabilityScore}%</span>
                          </div>
                          <Progress value={stats.sustainabilityScore} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Business Growth</span>
                            <span className="font-medium">+{stats.businessGrowth}%</span>
                          </div>
                          <Progress value={stats.businessGrowth} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Details */}
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-green-600" />
                      <span>Business Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Stall Type</Label>
                        <p className="font-medium">{vendorData.stallType}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Business Hours</Label>
                        <p className="font-medium">{vendorData.businessHours}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Daily Footfall</Label>
                        <p className="font-medium">{vendorData.dailyFootfall} customers</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Avg Order Value</Label>
                        <p className="font-medium">₹{vendorData.avgOrderValue}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Full Address</Label>
                      <p className="font-medium">{vendorData.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span>Achievements & Badges</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id} 
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            achievement.earned 
                              ? "bg-white border-green-200 marketplace-floating" 
                              : "bg-gray-50 border-gray-200 opacity-60"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              achievement.earned ? "bg-green-100" : "bg-gray-200"
                            )}>
                              <achievement.icon className={cn(
                                "h-5 w-5",
                                achievement.earned ? achievement.color : "text-gray-500"
                              )} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              {achievement.earned && (
                                <Badge className="mt-2 bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Earned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-6">
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>Active Subscriptions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className={cn(
                          "p-4 rounded-lg border",
                          sub.active ? "bg-white border-green-200" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              sub.active ? "bg-green-500" : "bg-gray-400"
                            )} />
                            <div>
                              <h4 className="font-medium">{sub.item}</h4>
                              <p className="text-sm text-gray-600">
                                {sub.quantity} • {sub.frequency}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Next: {sub.nextDelivery}</p>
                            {sub.active && (
                              <p className="text-xs text-green-600">Saved ₹{sub.savings}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="gradient-card marketplace-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <activity.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
