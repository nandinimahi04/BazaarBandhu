import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Package, Plus, Edit2, Trash2, ChevronLeft, Save, AlertTriangle, TrendingUp, IndianRupee, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

const CATEGORIES = ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Dry Goods", "Beverages", "Packaging", "Oils", "Flour", "Frozen"];
const UNITS = ["kg", "g", "litre", "ml", "piece", "pack", "dozen", "box", "tin", "bag"];
const QUALITIES = ["A+", "A", "B+", "B"];

const emptyForm = { name: "", category: "Vegetables", unit: "kg", pricePerUnit: "", marketPrice: "", inventory: "", minStock: "10", maxStock: "1000", quality: "A", description: "" };

export default function SupplierInventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<any>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await api.get("/supplier-inventory");
            setProducts(data.products || []);
        } catch { toast.error("Failed to load inventory"); }
        finally { setIsLoading(false); }
    };

    const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
    const openEdit = (p: any) => {
        setEditingId(p._id);
        setForm({ name: p.name, category: p.category, unit: p.unit, pricePerUnit: p.pricePerUnit, marketPrice: p.marketPrice || "", inventory: p.inventory, minStock: p.minStock, maxStock: p.maxStock, quality: p.quality, description: p.description || "" });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.pricePerUnit || !form.inventory) { toast.error("Name, price and inventory are required"); return; }
        setSaving(true);
        try {
            let data;
            if (editingId) {
                data = await api.put(`/supplier-inventory/${editingId}`, form);
            } else {
                data = await api.post("/supplier-inventory", form);
            }
            setProducts(data.products || []);
            setDialogOpen(false);
            toast.success(editingId ? "Product updated!" : "Product added!");
        } catch (e: any) { toast.error(e.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (p: any) => {
        if (!confirm(`Remove "${p.name}" from your catalog?`)) return;
        try {
            const data = await api.delete(`/supplier-inventory/${p._id}`);
            setProducts(data.products || []);
            toast.success("Product removed");
        } catch { toast.error("Failed to remove product"); }
    };

    const handleStockEdit = async (p: any, newVal: string) => {
        const val = parseFloat(newVal);
        if (isNaN(val) || val < 0) return;
        try {
            const data = await api.patch(`/supplier-inventory/${p._id}/stock`, { inventory: val });
            setProducts(data.products || []);
            toast.success("Stock updated");
        } catch { toast.error("Failed to update stock"); }
    };

    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
    const stats = { total: products.length, lowStock: products.filter(p => p.inventory < p.minStock).length, totalValue: products.reduce((a, p) => a + (p.inventory * p.pricePerUnit), 0) };

    const catEmoji: Record<string, string> = { Vegetables: "🧅", Fruits: "🍎", Spices: "🌶️", Grains: "🌾", Dairy: "🥛", Meat: "🥩", Oils: "🛢️", Flour: "🌾", Beverages: "🧃", Packaging: "📦", Frozen: "🧊", "Dry Goods": "🥜" };

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/supplier-dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full"><ChevronLeft className="w-5 h-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Supplier Catalog</h1>
                            <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">Inventory Management</p>
                        </div>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 px-6 font-bold" onClick={openAdd}>
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Products", value: stats.total, icon: Package, color: "blue" },
                        { label: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "red" },
                        { label: "Inventory Value", value: `₹${stats.totalValue.toLocaleString()}`, icon: IndianRupee, color: "green" },
                    ].map((s, i) => (
                        <Card key={i} className="border-none shadow-md">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-${s.color}-100`}>
                                    <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input placeholder="Search products or categories…" className="pl-12 h-12 bg-white border-none shadow-md rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(p => {
                        const isLow = p.inventory < p.minStock;
                        return (
                            <Card key={p._id} className={`border-none shadow-md hover:shadow-xl transition-shadow rounded-2xl overflow-hidden ${isLow ? 'ring-2 ring-red-200' : ''}`}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">
                                                {catEmoji[p.category] || "📦"}
                                            </div>
                                            <div>
                                                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-none text-[10px] font-black uppercase mb-1">{p.category}</Badge>
                                                <h3 className="font-black text-slate-900">{p.name}</h3>
                                            </div>
                                        </div>
                                        <Badge className={isLow ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}>
                                            {isLow ? "Low" : "OK"}
                                        </Badge>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Price / {p.unit}</span>
                                            <span className="font-black text-slate-900">₹{p.pricePerUnit}</span>
                                        </div>
                                        {p.marketPrice && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Market Price</span>
                                                <span className="font-bold text-slate-400 line-through">₹{p.marketPrice}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Stock ({p.unit})</span>
                                            <input
                                                type="number"
                                                defaultValue={p.inventory}
                                                className="w-24 text-right font-black text-orange-600 bg-white border border-orange-100 rounded-lg px-2 py-1 text-sm"
                                                onBlur={e => handleStockEdit(p, e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-600 h-9" onClick={() => openEdit(p)}>
                                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 h-9 px-3" onClick={() => handleDelete(p)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-md">
                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No products yet</h3>
                        <p className="text-slate-500 mb-6">Add your first product to start receiving orders.</p>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl" onClick={openAdd}>
                            <Plus className="w-4 h-4 mr-2" /> Add First Product
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update the details of your product below." : "Enter the details to add a new product to your catalog."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Product Name *</label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fresh Red Onions" className="h-11 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Category *</label>
                                <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Unit *</label>
                                <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                    {UNITS.map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Your Price (₹) *</label>
                                <Input type="number" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} className="h-11 rounded-xl" />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Market Price (₹)</label>
                                <Input type="number" value={form.marketPrice} onChange={e => setForm({ ...form, marketPrice: e.target.value })} placeholder="Optional" className="h-11 rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Stock *</label>
                                <Input type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} className="h-11 rounded-xl" />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Min Stock</label>
                                <Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} className="h-11 rounded-xl" />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Quality</label>
                                <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700" value={form.quality} onChange={e => setForm({ ...form, quality: e.target.value })}>
                                    {QUALITIES.map(q => <option key={q}>{q}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes about this product" className="h-11 rounded-xl" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl flex-1">Cancel</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex-1" onClick={handleSave} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : editingId ? "Update Product" : "Add Product"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
