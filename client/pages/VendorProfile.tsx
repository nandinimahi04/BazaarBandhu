import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User as UserIcon,
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
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  ShoppingCart,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function VendorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [vendorData, setVendorData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    location: "",
    address: "",
    joinedDate: "",
    stallType: "",
    dailyFootfall: 0,
    avgOrderValue: 0,
    businessHours: "6:00 AM - 10:00 PM",
    avatar: "VP"
  });

  const [stats, setStats] = useState({
    trustScore: 0,
    totalOrders: 0,
    totalSavings: 0,
    successfulDeliveries: 0,
    groupContributions: 0,
    referralCount: 12,
    sustainabilityScore: 88,
    businessGrowth: 23,
    totalSpent: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await api.get("/vendors/profile");
      setProfile(data);

      setVendorData({
        name: data.fullName || "Vendor Name",
        businessName: data.businessName || "Business Name",
        phone: data.phone || "",
        email: data.email || "",
        location: `${data.address?.city || ""}, ${data.address?.state || ""}`,
        address: `${data.address?.street || ""}, ${data.address?.city || ""}, ${data.address?.pincode || ""}`,
        joinedDate: new Date(data.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        stallType: data.businessCategory || "Street Food",
        dailyFootfall: 200,
        avgOrderValue: data.purchaseAnalytics?.averageOrderValue || 0,
        businessHours: `${data.preferences?.preferredDeliveryTime?.from || "06:00"} - ${data.preferences?.preferredDeliveryTime?.to || "22:00"}`,
        avatar: data.fullName?.substring(0, 2).toUpperCase() || "VP"
      });

      setStats({
        trustScore: data.trustScore || 85,
        totalOrders: data.totalOrders || 0,
        totalSavings: data.totalSavings || 0,
        successfulDeliveries: Math.round((data.totalOrders || 0) * 0.98),
        groupContributions: data.groupBuying?.contributionScore || 0,
        referralCount: data.groupMembers?.length || 0,
        sustainabilityScore: 92,
        businessGrowth: 15,
        totalSpent: data.totalSpent || 0
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("प्रोफ़ाइल लोड करने में विफल");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      // Find the names in vendorData and map back to schema
      const updateData = {
        fullName: vendorData.name,
        businessName: vendorData.businessName,
        phone: vendorData.phone,
        email: vendorData.email
      };

      await api.put("/vendors/profile", updateData);
      setIsEditing(false);
      toast.success("प्रोफ़ाइल सफलतापूर्वक अपडेट की गई");
      fetchProfile();
    } catch (error) {
      toast.error("सबमिट करने में विफल");
    }
  };

  // Mock data for Odoo-like insights
  const spendData = [
    { name: 'Jan', spent: 4500, savings: 450 },
    { name: 'Feb', spent: 5200, savings: 680 },
    { name: 'Mar', spent: 4800, savings: 520 },
    { name: 'Apr', spent: 6100, savings: 890 },
    { name: 'May', spent: 5900, savings: 740 },
    { name: 'Jun', spent: 6500, savings: 920 },
  ];

  const inventoryHealth = [
    { name: 'In Stock', value: 65, color: '#10b981' },
    { name: 'Low Stock', value: 25, color: '#f59e0b' },
    { name: 'Out of Stock', value: 10, color: '#ef4444' },
  ];

  const achievements = [
    { id: 1, title: "Top Saver", description: `Saved ₹${(stats.totalSavings).toLocaleString()}+ total`, icon: Trophy, color: "text-yellow-600", earned: stats.totalSavings > 1000 },
    { id: 2, title: "Group Leader", description: "Led 50+ group orders", icon: Handshake, color: "text-blue-600", earned: stats.groupContributions > 100 },
    { id: 3, title: "Eco Warrior", description: "Zero food waste for 30 days", icon: Heart, color: "text-green-600", earned: true },
    { id: 4, title: "Trust Champion", description: "90+ trust score for 3 months", icon: Shield, color: "text-purple-600", earned: stats.trustScore > 90 },
    { id: 5, title: "Growth Master", description: "25% business growth", icon: TrendingUp, color: "text-orange-600", earned: false },
    { id: 6, title: "Community Builder", description: "Refer 20+ vendors", icon: Award, color: "text-pink-600", earned: stats.referralCount > 5 }
  ];

  const subscriptions = profile?.recurringOrders || [
    { _id: 1, productName: "Onions", quantity: 100, unit: "kg", frequency: "Weekly", nextDeliveryDate: "Tomorrow", isActive: true },
    { _id: 2, productName: "Oil", quantity: 20, unit: "L", frequency: "Bi-weekly", nextDeliveryDate: "5 days", isActive: true }
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4"></div>
        <p className="text-green-800 font-medium">प्रोफ़ाइल लोड हो रही है...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-xs text-slate-500">Manage your business profile & performance</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
                className={cn(
                  "rounded-full px-5 transition-all",
                  isEditing ? "bg-green-600 hover:bg-green-700" : "hover:bg-slate-50"
                )}
              >
                {isEditing ? (
                  <><CheckCircle className="h-4 w-4 mr-2" /> Save Changes</>
                ) : (
                  <><Edit className="h-4 w-4 mr-2" /> Edit Profile</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-3xl">
              <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-600"></div>
              <CardContent className="relative pt-0 pb-8 text-center">
                <div className="relative -mt-16 mb-4 inline-block">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl mx-auto">
                    <AvatarImage src={profile?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-700 text-white text-3xl font-bold">
                      {vendorData.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg bg-white text-slate-900 hover:bg-slate-50">
                      <Camera className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  {isEditing ? (
                    <div className="space-y-3 px-4">
                      <Input
                        value={vendorData.name}
                        onChange={e => setVendorData({ ...vendorData, name: e.target.value })}
                        className="text-center font-bold text-lg rounded-xl h-12"
                        placeholder="Full Name"
                      />
                      <Input
                        value={vendorData.businessName}
                        onChange={e => setVendorData({ ...vendorData, businessName: e.target.value })}
                        className="text-center text-sm text-green-700 rounded-xl"
                        placeholder="Business Name"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black text-slate-900">{vendorData.name}</h2>
                      <p className="text-emerald-600 font-bold flex items-center justify-center">
                        <Store className="h-4 w-4 mr-2" />
                        {vendorData.businessName}
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 font-medium">TRUST SCORE</p>
                    <div className="flex items-center justify-center space-x-1 text-emerald-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-xl font-black">{stats.trustScore}%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 font-medium">SAVES</p>
                    <div className="flex items-center justify-center space-x-1 text-blue-600">
                      <Zap className="h-4 w-4" />
                      <span className="text-xl font-black">₹{stats.totalSavings}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email Address</p>
                    {isEditing ? (
                      <Input value={vendorData.email} onChange={e => setVendorData({ ...vendorData, email: e.target.value })} className="mt-1 h-8 rounded-lg text-sm" />
                    ) : (
                      <p className="text-sm font-bold text-slate-700">{vendorData.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Phone Number</p>
                    {isEditing ? (
                      <Input value={vendorData.phone} onChange={e => setVendorData({ ...vendorData, phone: e.target.value })} className="mt-1 h-8 rounded-lg text-sm" />
                    ) : (
                      <p className="text-sm font-bold text-slate-700">{vendorData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Business Location</p>
                    <p className="text-sm font-bold text-slate-700">{vendorData.location}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{vendorData.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content - Odoo-like Insights */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="insights" className="space-y-6">
              <TabsList className="p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm inline-flex w-full overflow-x-auto h-auto">
                <TabsTrigger value="insights" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">
                  <BarChart3 className="h-4 w-4 mr-2" /> Insights
                </TabsTrigger>
                <TabsTrigger value="business" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">
                  <Store className="h-4 w-4 mr-2" /> Business
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">
                  <Calendar className="h-4 w-4 mr-2" /> Subscriptions
                </TabsTrigger>
                <TabsTrigger value="awards" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">
                  <Award className="h-4 w-4 mr-2" /> Awards
                </TabsTrigger>
              </TabsList>

              {/* Odoo-Style Insights Tab */}
              <TabsContent value="insights" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-none shadow-lg shadow-slate-200/50 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 p-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-2xl">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <Badge className="bg-green-50 text-green-600 border-none">+12% vs LY</Badge>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Total Spending</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">₹{stats.totalSpent.toLocaleString()}</h3>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg shadow-slate-200/50 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 p-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-2xl">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none">Top 5% Eco</Badge>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Total Savings</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">₹{stats.totalSavings.toLocaleString()}</h3>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg shadow-slate-200/50 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 p-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                          <ShoppingCart className="h-6 w-6 text-purple-600" />
                        </div>
                        <Badge className="bg-purple-50 text-purple-600 border-none">Daily: 14</Badge>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
                    </CardContent>
                  </Card>
                </div>

                {/* Analytical Charts Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spending & Savings Trend */}
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="pb-0 pt-8 px-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-black text-slate-900">Spending Analysis</CardTitle>
                          <CardDescription>Monthly spend vs platform savings</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-[10px] font-bold text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> SPEND
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> SAVINGS
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spendData}>
                          <defs>
                            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                          />
                          <Area type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                          <Area type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Inventory Health Donut */}
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="pb-0 pt-8 px-8">
                      <CardTitle className="text-lg font-black text-slate-900">Inventory Health</CardTitle>
                      <CardDescription>Overall stock status efficiency</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                      <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryHealth}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {inventoryHealth.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                          <p className="text-2xl font-black text-slate-900">92%</p>
                          <p className="text-[10px] text-slate-400 font-bold">HEALTH</p>
                        </div>
                      </div>
                      <div className="w-full mt-4 space-y-3">
                        {inventoryHealth.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm font-medium text-slate-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Intelligence Section */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black text-slate-900">Business Intelligence</CardTitle>
                        <p className="text-slate-500 text-sm mt-1">AI-powered recommendations based on your usage</p>
                      </div>
                      <Button variant="ghost" className="rounded-full text-green-600 hover:text-green-700 hover:bg-green-50 font-bold">
                        View History
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      <div className="p-6 flex items-start space-x-6 hover:bg-slate-50/50 transition-colors">
                        <div className="p-4 bg-orange-100 rounded-3xl shrink-0">
                          <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">Predictive Restock: Potatoes</h4>
                            <Badge className="bg-orange-50 text-orange-600 border-none">URGENT</Badge>
                          </div>
                          <p className="text-slate-500 text-sm mt-1">Your potato stock will likely run out in 2 days based on weekend sales trends. 3 suppliers currently offer bulk discounts.</p>
                          <div className="mt-4 flex space-x-3">
                            <Button size="sm" className="bg-slate-900 text-white rounded-full px-5">Order Now</Button>
                            <Button size="sm" variant="outline" className="rounded-full px-5 border-slate-200">Snooze</Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex items-start space-x-6 hover:bg-slate-50/50 transition-colors">
                        <div className="p-4 bg-blue-100 rounded-3xl shrink-0">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">Price Optimization Alert</h4>
                            <Badge className="bg-blue-50 text-blue-600 border-none">NEW SAVINGS</Badge>
                          </div>
                          <p className="text-slate-500 text-sm mt-1">"Ravi Traders" just lowered Mustard Oil price by 8%. Switch your bi-weekly subscription to save ₹450 monthly.</p>
                          <div className="mt-4 flex space-x-3">
                            <Button size="sm" className="bg-blue-600 text-white rounded-full px-5">Review Offer</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Overview Tab */}
              <TabsContent value="business" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black text-slate-900">Business Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Business Category</Label>
                        <p className="text-lg font-bold text-slate-700 capitalize">{vendorData.stallType.replace('_', ' ')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Operating Hours</Label>
                        <p className="text-lg font-bold text-slate-700">{vendorData.businessHours}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Daily Footfall (Avg)</Label>
                        <p className="text-lg font-bold text-slate-700">{vendorData.dailyFootfall} customers</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Average Order Value</Label>
                        <p className="text-lg font-bold text-slate-700">₹{vendorData.avgOrderValue}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                      <Label className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Complete Physical Address</Label>
                      <p className="text-slate-700 mt-2 leading-relaxed">{vendorData.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-6 bg-gradient-to-br from-white to-green-50/30">
                    <h4 className="font-black text-slate-900 mb-6">Delivery Performance</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-600">Success Rate</span>
                          <span className="font-black text-emerald-600">98%</span>
                        </div>
                        <Progress value={98} className="h-2 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-600">On-Time Probability</span>
                          <span className="font-black text-emerald-600">94%</span>
                        </div>
                        <Progress value={94} className="h-2 bg-slate-200" />
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-6 bg-gradient-to-br from-white to-blue-50/30">
                    <h4 className="font-black text-slate-900 mb-6">Sustainability Metrics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-600">Eco-Friendly Sourcing</span>
                          <span className="font-black text-blue-600">82%</span>
                        </div>
                        <Progress value={82} className="h-2 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-600">Waste Reduction</span>
                          <span className="font-black text-blue-600">75%</span>
                        </div>
                        <Progress value={75} className="h-2 bg-slate-200" />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black text-slate-900">Active Supply Subscriptions</CardTitle>
                        <p className="text-slate-500 text-sm mt-1">Automated recurring orders for your business staples</p>
                      </div>
                      <Button className="bg-green-600 text-white rounded-full px-6">New Subscription</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {subscriptions.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {subscriptions.map((sub: any) => (
                          <div key={sub._id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center space-x-6">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                sub.isActive ? "bg-green-100" : "bg-slate-100"
                              )}>
                                <Package className={cn("h-7 w-7", sub.isActive ? "text-green-600" : "text-slate-400")} />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900">{sub.productName}</h4>
                                <p className="text-sm font-bold text-slate-500">
                                  {sub.quantity} {sub.unit} • {sub.frequency} Delivery
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end mb-2">
                                <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase", sub.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500")}>
                                  {sub.isActive ? "Active" : "Paused"}
                                </Badge>
                              </div>
                              <p className="text-xs font-bold text-slate-400">NEXT: {sub.nextDeliveryDate instanceof Date ? sub.nextDeliveryDate.toLocaleDateString() : sub.nextDeliveryDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-20 text-center text-slate-400">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No active subscriptions yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Awards Tab */}
              <TabsContent value="awards" className="animate-in fade-in slide-in-from-right-2 duration-500">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-xl font-black text-slate-900">Achievement Showcase</CardTitle>
                    <p className="text-slate-500 text-sm">Your journey and milestones on BazaarBandhu</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={cn(
                            "group p-6 rounded-[2rem] border-2 transition-all duration-300",
                            achievement.earned
                              ? "bg-white border-green-100 shadow-lg shadow-green-100/20 hover:scale-105"
                              : "bg-slate-50 border-slate-100 grayscale opacity-50"
                          )}
                        >
                          <div className="flex items-center space-x-5">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:rotate-12",
                              achievement.earned ? "bg-green-100/50" : "bg-slate-200"
                            )}>
                              <achievement.icon className={cn(
                                "h-8 w-8",
                                achievement.earned ? achievement.color : "text-slate-400"
                              )} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-slate-900">{achievement.title}</h4>
                              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{achievement.description}</p>
                              {achievement.earned && (
                                <div className="mt-3 flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Unlocked
                                </div>
                              )}
                            </div>
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
