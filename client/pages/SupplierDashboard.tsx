import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Package,
    Truck,
    TrendingUp,
    Plus,
    Clock,
    Star,
    IndianRupee,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    CheckCircle,
    Bell,
    BarChart3,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function SupplierDashboard() {
    const navigate = useNavigate();
    const [supplierData, setSupplierData] = useState<any>(null);
    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
    });
    const [products, setProducts] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSupplierDashboard();
    }, []);

    const loadSupplierDashboard = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Profile
            const profile = await api.get("/suppliers/profile");
            setSupplierData(profile);
            setProducts(profile.products || []);

            // 2. Fetch Analytics
            try {
                const stats = await api.get("/suppliers/analytics");
                setAnalytics(stats.analytics);
            } catch (err) {
                console.warn("Analytics fetch failed:", err);
            }

            // 3. Fetch Orders
            try {
                const ordersData = await api.get("/orders");
                setRecentOrders(ordersData.orders?.slice(0, 5) || []);
            } catch (err) {
                console.warn("Orders fetch failed:", err);
            }

        } catch (error) {
            console.error("Dashboard load error:", error);
            toast.error("डैशबोर्ड डेटा लोड करने में विफल");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
        toast.success("सफलतापूर्वक लॉगआउट किया गया");
    };

    if (isLoading) {
        return (
            <div className="p-8 lg:ml-64 space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-1/4 mb-10"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden lg:block">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">SupplierHub</span>
                </div>

                <nav className="space-y-4">
                    <Link to="/supplier-dashboard" className="flex items-center space-x-3 text-orange-400 bg-white/5 p-3 rounded-xl">
                        <BarChart3 className="w-5 h-5" />
                        <span>Overview</span>
                    </Link>
                    <Link to="/inventory" className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors p-3">
                        <Package className="w-5 h-5" />
                        <span>Manage Catalog</span>
                    </Link>
                    <Link to="/supplier-orders" className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors p-3">
                        <Truck className="w-5 h-5" />
                        <span>Orders</span>
                    </Link>
                    <div className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors p-3 cursor-pointer">
                        <Star className="w-5 h-5" />
                        <span>Reviews</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors p-3 cursor-pointer">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </div>
                </nav>

                <div className="absolute bottom-8 left-6 right-6">
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64 p-8">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Suprabhat, {supplierData?.fullName?.split(' ')[0] || "Supplier"}! 👋
                        </h1>
                        <p className="text-slate-500">{supplierData?.businessName} Performance Summary</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" className="rounded-full shadow-sm">
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-orange-100 text-orange-800">
                                {supplierData?.fullName?.charAt(0) || "S"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <IndianRupee className="w-6 h-6 text-orange-600" />
                                </div>
                                <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-100">
                                    Total Sales
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Business Volume</p>
                            <p className="text-2xl font-bold text-slate-900">₹{analytics.totalSales.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">
                                    {analytics.pendingOrders} Pending
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Active Orders</p>
                            <p className="text-2xl font-bold text-slate-900">{analytics.totalOrders}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                                <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-100">
                                    {products.length} Items
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Items Sold</p>
                            <p className="text-2xl font-bold text-slate-900">{analytics.totalItemsSold}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-yellow-100 rounded-xl">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                                <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-100">
                                    {supplierData?.rating?.average || 0} Avg
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Reviews</p>
                            <p className="text-2xl font-bold text-slate-900">{supplierData?.rating?.count || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Incoming Orders */}
                    <Card className="lg:col-span-2 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Incoming Orders</CardTitle>
                            <Link to="/supplier-orders">
                                <Button variant="ghost" size="sm" className="text-orange-600">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div key={order._id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                                                    {order.vendor?.businessName?.charAt(0) || "V"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{order.vendor?.businessName || "Unknown Vendor"}</p>
                                                    <p className="text-sm text-slate-500">{order.items?.[0]?.productName} & {order.items?.length - 1} more</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">₹{order.totalAmount}</p>
                                                <Badge className={
                                                    order.status === "pending" ? "bg-orange-100 text-orange-600" :
                                                        order.status === "dispatched" ? "bg-blue-100 text-blue-600" :
                                                            "bg-green-100 text-green-600"
                                                }>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No incoming orders yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Catalog Summary */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Quick Stocks</CardTitle>
                            <Link to="/inventory">
                                <Button size="icon" variant="outline" className="rounded-full">
                                    <Plus className="w-5 h-5 text-orange-600" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {products.slice(0, 5).map((product, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-bold text-slate-900">{product.name}</p>
                                            <p className="text-sm font-medium text-orange-600">₹{product.pricePerUnit}/{product.unit}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Inventory: {product.inventory} {product.unit}</span>
                                            <span className={product.inventory < 50 ? "text-red-500 font-bold" : "text-green-500"}>
                                                {product.inventory < 50 ? "Low" : "Normal"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/inventory">
                                <Button className="w-full mt-6 bg-slate-900 hover:bg-black text-white rounded-xl h-12">
                                    Manage Full Inventory Catalog
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
