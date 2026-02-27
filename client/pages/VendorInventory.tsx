import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    ChevronLeft,
    IndianRupee,
    AlertTriangle,
    Save,
    X,
    Filter,
    BarChart3,
    ArrowUpRight,
    TrendingUp,
    Zap,
    History,
    ShoppingCart,
    MoreVertical
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function VendorInventory() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        productName: "",
        category: "Vegetables",
        quantity: 0,
        unit: "kg",
        costPrice: 0
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const data = await api.get("/vendors/profile");
            setInventory(data.currentInventory || []);
        } catch (error) {
            console.error("Fetch inventory error:", error);
            toast.error("Failed to load inventory");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveItem = async () => {
        if (!formData.productName) {
            toast.error("Product name is required");
            return;
        }

        try {
            let updatedInventory;
            if (editingItem) {
                updatedInventory = inventory.map(item =>
                    item._id === editingItem._id ? { ...item, ...formData } : item
                );
            } else {
                updatedInventory = [...inventory, { ...formData, purchaseDate: new Date() }];
            }

            await api.patch("/vendors/inventory", { currentInventory: updatedInventory });
            setInventory(updatedInventory);
            setIsAddDialogOpen(false);
            setEditingItem(null);
            setFormData({ productName: "", category: "Vegetables", quantity: 0, unit: "kg", costPrice: 0 });
            toast.success(editingItem ? "Inventory updated" : "New item added");
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to remove this item?")) return;

        try {
            const updatedInventory = inventory.filter(item => item._id !== id);
            await api.patch("/vendors/inventory", { currentInventory: updatedInventory });
            setInventory(updatedInventory);
            toast.success("Item removed");
        } catch (error) {
            toast.error("Failed to remove");
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalItems: inventory.length,
        lowStock: inventory.filter(item => item.quantity < 5).length,
        totalValue: inventory.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0),
        mostStocked: [...inventory].sort((a, b) => b.quantity - a.quantity)[0]?.productName || "N/A"
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Loading Your Inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-orange-50 text-slate-600">
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
                                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Stock Control Panel</p>
                            </div>
                        </div>
                        <Button
                            className="bg-slate-900 hover:bg-black text-white rounded-2xl h-12 px-6 shadow-xl shadow-slate-200 font-black"
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({ productName: "", category: "Vegetables", quantity: 0, unit: "kg", costPrice: 0 });
                                setIsAddDialogOpen(true);
                            }}
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Item
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Items", value: stats.totalItems, icon: Package, color: "blue", bg: "bg-blue-50" },
                        { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "red", bg: "bg-red-50" },
                        { label: "Inventory Value", value: `₹${stats.totalValue.toLocaleString()}`, icon: IndianRupee, color: "green", bg: "bg-green-50" },
                        { label: "Highest Stock", value: stats.mostStocked, icon: TrendingUp, color: "orange", bg: "bg-orange-50" },
                    ].map((stat, idx) => (
                        <Card key={idx} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden marketplace-floating">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className={cn("p-4 rounded-2xl", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", `text-${stat.color}-600`)} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 h-5 w-5 transition-colors" />
                        <Input
                            placeholder="Search your stock (Onions, Spices, Oil...)"
                            className="pl-12 h-14 bg-white border-none shadow-xl shadow-slate-100 rounded-2xl text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-14 px-6 rounded-2xl border-none shadow-xl shadow-slate-100 bg-white font-bold text-slate-600">
                        <Filter className="w-5 h-5 mr-2" /> Filter
                    </Button>
                </div>

                {/* Inventory Table/Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item) => (
                        <Card key={item._id} className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl text-2xl group-hover:scale-110 transition-transform">
                                            {item.category === "Vegetables" ? "🧅" : item.category === "Spices" ? "🌶️" : item.category === "Oil" ? "🛢️" : "📦"}
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-none uppercase text-[10px] font-black tracking-widest mb-1 px-3">
                                                {item.category}
                                            </Badge>
                                            <h3 className="text-xl font-black text-slate-900">{item.productName}</h3>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                <MoreVertical className="w-5 h-5 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                                            <DropdownMenuItem
                                                className="rounded-xl py-3 font-bold cursor-pointer"
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setFormData({
                                                        productName: item.productName,
                                                        category: item.category,
                                                        quantity: item.quantity,
                                                        unit: item.unit,
                                                        costPrice: item.costPrice || 0
                                                    });
                                                    setIsAddDialogOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Edit Item
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-xl py-3 font-bold text-red-500 focus:text-red-500 cursor-pointer"
                                                onClick={() => handleDeleteItem(item._id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="bg-slate-50/80 rounded-3xl p-5 mb-6">
                                    <div className="flex items-center justify-between mb-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Current Stock</span>
                                        <span className={cn("px-4 py-1.5 rounded-full text-[10px]", item.quantity < 5 ? "bg-red-500 text-white" : "bg-green-100 text-green-700")}>
                                            {item.quantity < 5 ? "Low Stock" : "Healthy"}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-baseline space-x-1">
                                            <span className="text-4xl font-black text-slate-900">{item.quantity}</span>
                                            <span className="text-lg font-black text-slate-400 tracking-tighter">{item.unit}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Cost</p>
                                            <p className="text-lg font-black text-slate-900">₹{item.costPrice || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-4">
                                    <span className="flex items-center">
                                        <History className="w-3 h-3 mr-1" /> Updated {new Date(item.purchaseDate).toLocaleDateString()}
                                    </span>
                                    <Link to="/suppliers">
                                        <Button variant="link" className="h-auto p-0 text-orange-600 font-black flex items-center">
                                            Order Refill <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-slate-100">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 italic">Ready to set up Shop?</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Your storage is empty. Start by tracking your stock levels to prevent running out during rush hour!</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="bg-orange-600 hover:bg-orange-700 h-14 px-10 rounded-2xl font-black" onClick={() => setIsAddDialogOpen(true)}>
                                Add Your First Item
                            </Button>
                            <Button
                                variant="outline"
                                className="border-2 border-slate-900 h-14 px-10 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all"
                                onClick={async () => {
                                    const defaults = [
                                        { productName: 'Potatoes', category: 'Vegetables', quantity: 20, unit: 'kg', costPrice: 25 },
                                        { productName: 'Puris', category: 'Grains', quantity: 1000, unit: 'pcs', costPrice: 0.5 },
                                        { productName: 'Chickpeas', category: 'Grains', quantity: 10, unit: 'kg', costPrice: 80 },
                                        { productName: 'Tamarind', category: 'Spices', quantity: 5, unit: 'kg', costPrice: 120 },
                                        { productName: 'Mint', category: 'Vegetables', quantity: 2, unit: 'kg', costPrice: 40 },
                                        { productName: 'Green Chilies', category: 'Vegetables', quantity: 1, unit: 'kg', costPrice: 60 },
                                        { productName: 'Oil', category: 'Oil', quantity: 15, unit: 'Litre', costPrice: 140 },
                                        { productName: 'Chaat Masala', category: 'Spices', quantity: 2, unit: 'kg', costPrice: 250 }
                                    ];
                                    try {
                                        await api.patch("/vendors/inventory", { currentInventory: defaults });
                                        setInventory(defaults);
                                        toast.success("Template loaded successfully!");
                                    } catch (error) {
                                        toast.error("Failed to load template");
                                    }
                                }}
                            >
                                <Zap className="w-5 h-5 mr-2" /> Load Panipuri Template
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Reorder FAB */}
            {stats.lowStock > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <Link to="/suppliers">
                        <Button className="h-14 px-8 rounded-full bg-slate-900 text-white shadow-2xl flex items-center space-x-3 hover:scale-105 transition-transform group">
                            <Zap className="w-5 h-5 text-orange-400 fill-orange-400" />
                            <span className="font-bold">Smart Reorder {stats.lowStock} Items Now</span>
                        </Button>
                    </Link>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[3rem] border-none shadow-2xl p-8 bg-[#F8FAFC]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 mb-2">{editingItem ? 'Edit Stock Item' : 'New Stock Item'}</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">Track your inventory levels and costs accurately.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                            <Input
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                placeholder="e.g. Maharashtra Red Onions"
                                className="h-12 rounded-2xl border-slate-100 bg-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                <select
                                    className="h-12 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Spices">Spices</option>
                                    <option value="Oil">Oil & Ghee</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Grains">Grains</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Unit</label>
                                <Input
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="kg, Litre, Pack"
                                    className="h-12 rounded-2xl border-slate-100 bg-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-black text-orange-600 uppercase tracking-widest px-1">Stock Level</label>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                                    className="h-12 rounded-2xl border-orange-100 bg-white"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Cost / Unit (₹)</label>
                                <Input
                                    type="number"
                                    value={formData.costPrice}
                                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                    className="h-12 rounded-2xl border-slate-100 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-2xl h-14 font-bold flex-1">Cancel</Button>
                        <Button className="bg-slate-900 hover:bg-black text-white rounded-2xl h-14 px-8 font-black flex-1 shadow-xl shadow-slate-200" onClick={handleSaveItem}>
                            <Save className="w-5 h-5 mr-2" /> {editingItem ? 'Update Stock' : 'Add Stock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
