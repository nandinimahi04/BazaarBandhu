import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    X
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Inventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "Vegetables",
        pricePerUnit: 0,
        unit: "kg",
        inventory: 0,
        marketPrice: 0
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const profile = await api.get("/suppliers/profile");
            setProducts(profile.products || []);
        } catch (error) {
            console.error("Fetch inventory error:", error);
            toast.error("इंवेंट्री लोड करने में विफल");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!formData.name) {
            toast.error("कृपया उत्पाद का नाम दर्ज करें");
            return;
        }

        try {
            const updatedProducts = editingProduct
                ? products.map(p => p._id === editingProduct._id ? { ...p, ...formData } : p)
                : [...products, formData];

            const response = await api.post("/suppliers/products", { products: updatedProducts });
            setProducts(response.products);
            setIsAddDialogOpen(false);
            setEditingProduct(null);
            setFormData({ name: "", category: "Vegetables", pricePerUnit: 0, unit: "kg", inventory: 0, marketPrice: 0 });
            toast.success(editingProduct ? "उत्पाद अपडेट किया गया" : "नया उत्पाद जोड़ा गया");
        } catch (error) {
            toast.error("सहेजने में विफल");
        }
    };

    const handleDeleteProduct = async (name: string) => {
        if (!confirm(`क्या आप वाकई ${name} को हटाना चाहते हैं?`)) return;

        try {
            const updatedProducts = products.filter(p => p.name !== name);
            const response = await api.post("/suppliers/products", { products: updatedProducts });
            setProducts(response.products);
            toast.success("उत्पाद हटा दिया गया");
        } catch (error) {
            toast.error("हटाने में विफल");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-8 text-center">Loading Inventory...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link to="/supplier-dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Manage Catalog</h1>
                        <p className="text-slate-500">Update your prices and stock levels</p>
                    </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" /> Add New Item
                </Button>
            </header>

            <Card className="border-none shadow-md mb-8">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search products by name or category..."
                            className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product._id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none uppercase text-[10px] tracking-wider">
                                {product.category}
                            </Badge>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-600" onClick={() => {
                                    setEditingProduct(product);
                                    setFormData({
                                        name: product.name,
                                        category: product.category,
                                        pricePerUnit: product.pricePerUnit,
                                        unit: product.unit,
                                        inventory: product.inventory,
                                        marketPrice: product.marketPrice || product.pricePerUnit * 1.2
                                    });
                                    setIsAddDialogOpen(true);
                                }}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteProduct(product.name)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                                    <p className="text-slate-500 text-sm">Unit: {product.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-orange-600">₹{product.pricePerUnit}</p>
                                    <p className="text-[10px] text-slate-400 line-through">₹{Math.round(product.marketPrice || product.pricePerUnit * 1.2)}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 flex items-center">
                                        <Package className="w-4 h-4 mr-2 opacity-50" /> Stock Level
                                    </span>
                                    <span className={`font-bold ${product.inventory < 50 ? 'text-red-500' : 'text-slate-900'}`}>
                                        {product.inventory} {product.unit}
                                    </span>
                                </div>
                                {product.inventory < 50 && (
                                    <div className="flex items-center text-[10px] text-red-500 font-bold bg-red-50 p-1.5 rounded-lg">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> CRITICAL LOW STOCK
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Fresh Onions" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Spices">Spices</option>
                                    <option value="Oil">Oil & Ghee</option>
                                    <option value="Grains">Grains & Pulses</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Unit</label>
                                <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, L, box" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-orange-600">Your Price (₹)</label>
                                <Input type="number" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-400">Market Price (₹)</label>
                                <Input type="number" value={formData.marketPrice} onChange={(e) => setFormData({ ...formData, marketPrice: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Initial Inventory Level</label>
                            <Input type="number" value={formData.inventory} onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSaveProduct}>
                            <Save className="w-4 h-4 mr-2" /> {editingProduct ? 'Update Product' : 'Add to Catalog'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
