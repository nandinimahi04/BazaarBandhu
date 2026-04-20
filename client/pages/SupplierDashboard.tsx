import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Package, Truck, TrendingUp, Plus, Clock, Star, IndianRupee,
    Settings, LogOut, ChevronRight, Search, CheckCircle, Bell,
    BarChart3, AlertTriangle, CheckCircle2, Save, User, Phone, Mail, MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-orange-100 text-orange-600",
    confirmed: "bg-blue-100 text-blue-600",
    packed: "bg-indigo-100 text-indigo-600",
    dispatched: "bg-purple-100 text-purple-600",
    delivered: "bg-green-100 text-green-600",
    cancelled: "bg-red-100 text-red-600",
};

export default function SupplierDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [supplierData, setSupplierData] = useState<any>(null);
    const [analytics, setAnalytics] = useState({ totalOrders: 0, totalSales: 0, totalItemsSold: 0, averageOrderValue: 0, pendingOrders: 0, deliveredOrders: 0 });
    const [products, setProducts] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [settingsForm, setSettingsForm] = useState({ 
        businessName: "", 
        phone: "", 
        email: "", 
        gstNumber: "", 
        autoConfirm: false, 
        emailNotifications: true 
    });
    const [settingsSaving, setSettingsSaving] = useState(false);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            const profile = await api.get("/suppliers/profile");
            setSupplierData(profile);
            setProducts(profile.products || []);
            setSettingsForm({
                businessName: profile.businessName || "",
                phone: profile.phone || "",
                email: profile.email || "",
                gstNumber: profile.gstNumber || "",
                autoConfirm: profile.autoConfirm || false,
                emailNotifications: profile.emailNotifications !== false,
            });

            try {
                const stats = await api.get("/suppliers/analytics");
                setAnalytics(stats.analytics);
            } catch { /* ignore */ }

            try {
                const ordersData = await api.get("/orders");
                const allOrders = ordersData.orders || [];
                setRecentOrders(allOrders.slice(0, 5));
                // Build reviews from delivered orders that have vendor ratings
                const rated = allOrders.filter((o: any) => o.rating?.vendor?.overall);
                setReviews(rated);
            } catch { /* ignore */ }
        } catch {
            toast.error("Failed to load dashboard");
        } finally { setIsLoading(false); }
    };

    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        try {
            await api.put("/suppliers/profile", {
                businessName: settingsForm.businessName,
                phone: settingsForm.phone,
            });
            setSupplierData((prev: any) => ({ ...prev, businessName: settingsForm.businessName, phone: settingsForm.phone }));
            toast.success("Settings saved successfully!");
        } catch { toast.error("Failed to save settings"); }
        finally { setSettingsSaving(false); }
    };

    const handleLogout = () => { logout(); navigate("/login"); toast.success("Logged out"); };

    const navItems = [
        { id: "overview", icon: BarChart3, label: "Overview", action: () => setActiveTab("overview") },
        { id: "inventory", icon: Package, label: "Catalog / Inventory", href: "/supplier-inventory" },
        { id: "orders", icon: Truck, label: "Orders", href: "/supplier-orders" },
        { id: "reviews", icon: Star, label: "Reviews", action: () => setActiveTab("reviews") },
        { id: "settings", icon: Settings, label: "Settings", action: () => setActiveTab("settings") },
    ];

    if (isLoading) return (
        <div className="p-8 lg:ml-64 space-y-6 animate-pulse">
            <div className="h-10 bg-slate-200 rounded w-1/4 mb-10" />
            <div className="grid grid-cols-4 gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">SupplierHub</span>
                </div>

                <nav className="space-y-1 flex-1">
                    {navItems.map(item => {
                        const isActive = (item.id === "inventory" || item.id === "orders")
                            ? false
                            : activeTab === item.id;
                        const classes = `w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${isActive ? 'text-orange-400 bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                        if (item.href) return (
                            <Link key={item.id} to={item.href} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${classes}`}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </Link>
                        );
                        return (
                            <button key={item.id} onClick={item.action} className={classes}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                </Button>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64 p-8">

                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                    <>
                        <header className="flex items-center justify-between mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Good Morning, {supplierData?.fullName?.split(' ')[0] || "Supplier"}! 👋</h1>
                                <p className="text-slate-500">{supplierData?.businessName} · Performance Summary</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button variant="outline" size="icon" className="rounded-full shadow-sm"><Bell className="w-5 h-5" /></Button>
                                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                                    <AvatarFallback className="bg-orange-100 text-orange-800">{supplierData?.fullName?.charAt(0) || "S"}</AvatarFallback>
                                </Avatar>
                            </div>
                        </header>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {[
                                { label: "Business Volume", value: `₹${analytics.totalSales.toLocaleString()}`, sub: "Total Sales", icon: IndianRupee, color: "orange" },
                                { label: "Active Orders", value: analytics.totalOrders, sub: `${analytics.pendingOrders} Pending`, icon: Clock, color: "blue" },
                                { label: "Items Sold", value: analytics.totalItemsSold, sub: `${products.length} in catalog`, icon: Package, color: "purple" },
                                { label: "Avg Rating", value: supplierData?.rating?.average || "–", sub: `${supplierData?.rating?.count || 0} reviews`, icon: Star, color: "yellow" },
                            ].map((s, i) => (
                                <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 bg-${s.color}-100 rounded-xl`}>
                                                <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                                            </div>
                                            <Badge variant="outline" className={`text-${s.color}-600 bg-${s.color}-50 border-${s.color}-100`}>{s.sub}</Badge>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Orders */}
                            <Card className="lg:col-span-2 border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Incoming Orders</CardTitle>
                                    <Link to="/supplier-orders"><Button variant="ghost" size="sm" className="text-orange-600">View All →</Button></Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentOrders.length > 0 ? recentOrders.map(order => (
                                            <div key={order._id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center font-bold text-orange-600">
                                                        {order.vendor?.businessName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{order.vendor?.businessName || "Unknown Vendor"}</p>
                                                        <p className="text-xs text-slate-500">{order.items?.[0]?.productName}{order.items?.length > 1 ? ` +${order.items.length - 1} more` : ""}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900">₹{order.totalAmount}</p>
                                                    <Badge className={`text-xs ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}>{order.status}</Badge>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-10 text-slate-400">
                                                <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No orders yet. Share your catalog to start receiving orders.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Catalog */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Quick Stocks</CardTitle>
                                    <Link to="/supplier-inventory">
                                        <Button size="icon" variant="outline" className="rounded-full"><Plus className="w-5 h-5 text-orange-600" /></Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {products.length > 0 ? products.slice(0, 5).map((p, i) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-xl">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                                                    <p className="text-sm font-medium text-orange-600">₹{p.pricePerUnit}/{p.unit}</p>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Stock: {p.inventory} {p.unit}</span>
                                                    <span className={p.inventory < p.minStock ? "text-red-500 font-bold" : "text-green-600"}>
                                                        {p.inventory < p.minStock ? "⚠ Low" : "✓ OK"}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6">
                                                <p className="text-slate-500 text-sm mb-4">No products in catalog</p>
                                                <Link to="/supplier-inventory">
                                                    <Button variant="outline" size="sm" className="w-full border-dashed border-2 hover:bg-orange-50 border-orange-200 text-orange-600">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Products
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/supplier-inventory">
                                        <Button className="w-full mt-5 bg-slate-900 hover:bg-black text-white rounded-xl h-11">Manage Full Catalog</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* ── REVIEWS TAB ── */}
                {activeTab === "reviews" && (
                    <div className="space-y-6">
                        <header>
                            <h1 className="text-3xl font-bold text-slate-900">Customer Reviews</h1>
                            <p className="text-slate-500">Feedback from your vendors</p>
                        </header>

                        {/* Rating summary */}
                        <Card className="border-none shadow-md">
                            <CardContent className="p-6 flex items-center space-x-8">
                                <div className="text-center">
                                    <p className="text-5xl font-black text-slate-900">{supplierData?.rating?.average?.toFixed(1) || "–"}</p>
                                    <div className="flex text-yellow-400 justify-center my-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(supplierData?.rating?.average || 0) ? "fill-yellow-400" : ""}`} />)}
                                    </div>
                                    <p className="text-sm text-slate-500">{supplierData?.rating?.count || 0} reviews</p>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = reviews.filter((r: any) => Math.round(r.rating?.vendor?.overall || 0) === star).length;
                                        const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center space-x-3">
                                                <span className="text-sm font-bold text-slate-600 w-6">{star}★</span>
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-400 w-6">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Individual Reviews */}
                        <div className="space-y-4">
                            {reviews.length > 0 ? reviews.map((order: any) => {
                                const r = order.rating?.vendor;
                                return (
                                    <Card key={order._id} className="border-none shadow-md">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center font-bold text-orange-600">
                                                        {order.vendor?.businessName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{order.vendor?.businessName || "Vendor"}</p>
                                                        <p className="text-xs text-slate-500">{order.deliveredAt ? format(new Date(order.deliveredAt), 'MMM dd, yyyy') : "Delivered"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(r?.overall || 0) ? "fill-yellow-400" : ""}`} />)}
                                                </div>
                                            </div>
                                            {r?.review && <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-xl italic">"{r.review}"</p>}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {r?.productQuality && <Badge variant="outline" className="text-xs">Quality: {r.productQuality}/5</Badge>}
                                                {r?.deliverySpeed && <Badge variant="outline" className="text-xs">Delivery: {r.deliverySpeed}/5</Badge>}
                                                {r?.packaging && <Badge variant="outline" className="text-xs">Packaging: {r.packaging}/5</Badge>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }) : (
                                <Card className="border-none shadow-md">
                                    <CardContent className="p-10 text-center text-slate-400">
                                        <Star className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No reviews yet</p>
                                        <p className="text-sm">Fulfill orders to receive vendor ratings here.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* ── SETTINGS TAB ── */}
                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <header>
                            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                            <p className="text-slate-500">Manage your business profile and preferences</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Business Profile */}
                            <Card className="border-none shadow-md">
                                <CardHeader><CardTitle className="flex items-center space-x-2"><User className="w-5 h-5 text-orange-600" /><span>Business Profile</span></CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">Business Name</label>
                                        <Input
                                            value={settingsForm.businessName}
                                            onChange={e => setSettingsForm(p => ({ ...p, businessName: e.target.value }))}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">Contact Number</label>
                                        <Input
                                            value={settingsForm.phone}
                                            onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">Email Address</label>
                                        <Input value={settingsForm.email} disabled className="h-11 rounded-xl bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">GST Number</label>
                                        <Input value={settingsForm.gstNumber} disabled className="h-11 rounded-xl bg-slate-50" placeholder="Not provided" />
                                    </div>
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full h-11 rounded-xl" onClick={handleSaveSettings} disabled={settingsSaving}>
                                        <Save className="w-4 h-4 mr-2" /> {settingsSaving ? "Saving…" : "Save Changes"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Operating Preferences */}
                            <Card className="border-none shadow-md">
                                <CardHeader><CardTitle className="flex items-center space-x-2"><Settings className="w-5 h-5 text-orange-600" /><span>Preferences</span></CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-bold">Auto-Confirm Orders</p>
                                            <p className="text-xs text-slate-500">Automatically accept incoming orders</p>
                                        </div>
                                        <button
                                            onClick={() => setSettingsForm(p => ({ ...p, autoConfirm: !p.autoConfirm }))}
                                            className={`h-6 w-11 rounded-full transition-colors ${settingsForm.autoConfirm ? "bg-orange-600" : "bg-slate-200"}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md mx-0.5 transition-transform ${settingsForm.autoConfirm ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-bold">Email Notifications</p>
                                            <p className="text-xs text-slate-500">Receive order alerts via email</p>
                                        </div>
                                        <button
                                            onClick={() => setSettingsForm(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                                            className={`h-6 w-11 rounded-full transition-colors ${settingsForm.emailNotifications ? "bg-orange-600" : "bg-slate-200"}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md mx-0.5 transition-transform ${settingsForm.emailNotifications ? "translate-x-5" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                    {/* Working Hours (read-only) */}
                                    {supplierData?.workingHours && (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <p className="font-bold text-sm text-orange-800 mb-1">Working Hours</p>
                                            <p className="text-orange-700">{supplierData.workingHours.from} – {supplierData.workingHours.to}</p>
                                        </div>
                                    )}
                                    {/* Address */}
                                    {supplierData?.address && (
                                        <div className="p-4 bg-slate-50 rounded-xl flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-700">Business Address</p>
                                                <p className="text-sm text-slate-500">{supplierData.address.street}, {supplierData.address.city}, {supplierData.address.state} – {supplierData.address.pincode}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
