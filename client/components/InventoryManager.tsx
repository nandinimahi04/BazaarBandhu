import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, TrendingUp, AlertTriangle, History, 
  Trash2, ArrowUpRight, ArrowDownRight, Info, Search,
  Filter, IndianRupee, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { api } from '@/lib/api';

interface InventoryItem {
  _id: string;
  productName: string;
  category: string;
  currentQuantity: number;
  unit: string;
  minThreshold: number;
  costPrice: number;
  status: string;
  lastRestockDate: string;
}

interface Movement {
  _id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTAGE' | 'RETURN';
  quantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
  notes?: string;
}

const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<Movement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form States
  const [newItem, setNewItem] = useState({
    productName: '',
    category: 'Vegetables',
    currentQuantity: 0,
    unit: 'kg',
    minThreshold: 5,
    costPrice: 0
  });

  const [adjustment, setAdjustment] = useState({
    quantityChange: 0,
    type: 'OUT' as any,
    reason: 'sale',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setItems(res || []);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (itemId: string) => {
    try {
      const res = await api.get(`/inventory/${itemId}/history`);
      setHistory(res || []);
    } catch (err) {
      toast.error("Failed to load history");
    }
  };

  const handleAddItem = async () => {
    try {
      await api.post('/inventory', newItem);
      toast.success("Item added successfully");
      setShowAddModal(false);
      fetchInventory();
      setNewItem({ productName: '', category: 'Vegetables', currentQuantity: 0, unit: 'kg', minThreshold: 5, costPrice: 0 });
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  const handleAdjustment = async () => {
    if (!activeItem) return;
    try {
      await api.patch(`/inventory/${activeItem._id}`, adjustment);
      toast.success("Stock updated");
      setShowAdjustModal(false);
      fetchInventory();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  const filteredItems = items.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalValue: items.reduce((acc, item) => acc + (item.currentQuantity * item.costPrice), 0),
    lowStockCount: items.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length,
    totalItems: items.length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 📊 Inventory Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Inventory Value
              <IndianRupee className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">Market value of on-hand stock</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Critical Alerts
              <AlertTriangle className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs opacity-80 mt-1">Items below threshold</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Active SKUs
              <Package className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalItems}</div>
            <p className="text-xs opacity-80 mt-1">Total trackable products</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-green-50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search products or categories..." 
            className="pl-10 border-green-100 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-green-200">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" /> Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Product to Inventory</DialogTitle>
                <DialogDescription>Track stock levels and alerts for your business.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input value={newItem.productName} onChange={e => setNewItem({...newItem, productName: e.target.value})} placeholder="e.g. Basmati Rice" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newItem.category} onValueChange={v => setNewItem({...newItem, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Vegetables', 'Grains', 'Spices', 'Dairy', 'Packaging', 'Oils', 'Flour'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Initial Qty</label>
                    <Input type="number" value={newItem.currentQuantity} onChange={e => setNewItem({...newItem, currentQuantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Select value={newItem.unit} onValueChange={v => setNewItem({...newItem, unit: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['kg', 'pcs', 'litre', 'pack'].map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Alert Level (Min)</label>
                    <Input type="number" value={newItem.minThreshold} onChange={e => setNewItem({...newItem, minThreshold: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={handleAddItem} className="bg-green-600">Save Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 📦 Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow group border-green-50">
            <CardHeader className="pb-2 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-1 text-[10px] uppercase font-bold text-slate-500">{item.category}</Badge>
                  <CardTitle className="text-lg">{item.productName}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{item.currentQuantity}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.unit}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Stock Status</span>
                  <span className={item.status === 'in_stock' ? 'text-green-600' : 'text-orange-600'}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <Progress 
                  value={(item.currentQuantity / (item.minThreshold * 3)) * 100} 
                  className={`h-1.5 ${item.status === 'low_stock' ? 'bg-orange-100' : 'bg-green-100'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-slate-50 rounded-lg flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <div>
                    <p className="text-slate-400">Last Restock</p>
                    <p className="font-bold">{new Date(item.lastRestockDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex items-center gap-2">
                  <IndianRupee className="h-3 w-3 text-slate-400" />
                  <div>
                    <p className="text-slate-400">Value</p>
                    <p className="font-bold">₹{(item.currentQuantity * item.costPrice).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    setActiveItem(item);
                    setAdjustment({...adjustment, type: 'OUT', reason: 'sale'});
                    setShowAdjustModal(true);
                  }}
                >
                  Log Sale/Waste
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => {
                    setActiveItem(item);
                    setAdjustment({...adjustment, type: 'IN', reason: 'purchase'});
                    setShowAdjustModal(true);
                  }}
                >
                  Restock
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 text-slate-400 hover:text-blue-500"
                  onClick={() => {
                    setActiveItem(item);
                    fetchHistory(item._id);
                  }}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🛠️ Adjustment Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {activeItem?.productName}</DialogTitle>
            <DialogDescription>Current Inventory: {activeItem?.currentQuantity} {activeItem?.unit}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Transaction Type</label>
                <Select value={adjustment.type} onValueChange={v => setAdjustment({...adjustment, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUT">Sale / Usage (Stock Out)</SelectItem>
                    <SelectItem value="IN">Restock (Stock In)</SelectItem>
                    <SelectItem value="WASTAGE">Damage / Spoilage</SelectItem>
                    <SelectItem value="ADJUSTMENT">Manual Fix (Exact Set)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Quantity ({activeItem?.unit})</label>
                <Input type="number" value={adjustment.quantityChange} onChange={e => setAdjustment({...adjustment, quantityChange: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes</label>
              <Input value={adjustment.notes} onChange={e => setAdjustment({...adjustment, notes: e.target.value})} placeholder="Internal notes for tracking..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
            <Button onClick={handleAdjustment} className="bg-green-600">Apply Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;
