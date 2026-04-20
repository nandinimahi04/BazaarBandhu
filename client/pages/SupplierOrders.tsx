import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Truck, Package, Clock, CheckCircle, ChevronLeft,
    Phone, MapPin, AlertCircle, CheckCircle2, X, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";

const STEPS = [
    { key: "pending", label: "Ordered", icon: Clock, color: "orange" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle, color: "blue" },
    { key: "packed", label: "Packed", icon: Package, color: "indigo" },
    { key: "dispatched", label: "Dispatched", icon: Truck, color: "purple" },
    { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "green" },
];

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700",
    dispatched: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function SupplierOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await api.get("/orders");
            setOrders(data.orders || []);
        } catch {
            toast.error("Failed to load orders");
        } finally { setIsLoading(false); }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await api.patch(`/orders/${orderId}/status`, {
                status: newStatus,
                location: "Supplier Warehouse",
                description: `Order ${newStatus} by supplier`
            });
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch { toast.error("Failed to update status"); }
        finally { setUpdatingId(null); }
    };

    const filtered = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);
    const stepIdx = (status: string) => STEPS.findIndex(s => s.key === status);

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                    <Link to="/supplier-dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full"><ChevronLeft className="w-6 h-6" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Incoming Orders</h1>
                        <p className="text-slate-500">Manage and fulfil customer orders</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                        {["all", "pending", "confirmed", "packed", "dispatched", "delivered"].map(s => (
                            <Button
                                key={s}
                                variant={filterStatus === s ? "default" : "ghost"}
                                className={`rounded-lg capitalize text-xs whitespace-nowrap h-8 px-3 ${filterStatus === s ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-slate-500 hover:text-orange-600"}`}
                                onClick={() => setFilterStatus(s)}
                            >{s}</Button>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchOrders}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="space-y-6">
                {filtered.length > 0 ? filtered.map(order => {
                    const currentIdx = stepIdx(order.status);
                    const isActive = !["delivered", "cancelled"].includes(order.status);

                    return (
                        <Card key={order._id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Left: order details */}
                                    <div className="p-6 flex-1">
                                        {/* Order header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">Order #{order._id?.slice(-6)}</h3>
                                                    <p className="text-xs text-slate-500">{order.placedAt ? format(new Date(order.placedAt), "MMM dd, yyyy • hh:mm a") : "–"}</p>
                                                </div>
                                            </div>
                                            <Badge className={`${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"} border-none px-3 py-1 rounded-full font-bold uppercase text-xs`}>
                                                {order.status}
                                            </Badge>
                                        </div>

                                        {/* ── VISUAL ORDER FLOW (like vendor shipment cards) ── */}
                                        {order.status !== "cancelled" && (
                                            <div className="mb-6 px-1">
                                                {/* Step labels + icons */}
                                                <div className="relative flex justify-between mb-2">
                                                    {STEPS.map((step, idx) => {
                                                        const done = idx <= currentIdx;
                                                        const active = idx === currentIdx;
                                                        return (
                                                            <div key={step.key} className="flex flex-col items-center" style={{ width: "20%" }}>
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? `border-${step.color}-500 bg-${step.color}-100` : "border-slate-200 bg-white"} ${active ? "ring-2 ring-orange-300 ring-offset-1" : ""}`}>
                                                                    <step.icon className={`w-4 h-4 ${done ? `text-${step.color}-600` : "text-slate-300"}`} />
                                                                </div>
                                                                <span className={`text-[9px] font-bold mt-1 text-center uppercase tracking-tight ${done ? "text-slate-700" : "text-slate-300"}`}>
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    {/* Connector line behind icons */}
                                                    <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-0" />
                                                </div>
                                                {/* Progress bar */}
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${Math.max(5, ((currentIdx + 1) / STEPS.length) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Customer + Items */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Customer */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Details</p>
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                                                        {order.vendor?.businessName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{order.vendor?.businessName || "Unknown Vendor"}</p>
                                                        <p className="text-xs text-slate-500">{order.vendor?.fullName}</p>
                                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                                            <MapPin className="w-3 h-3 mr-1 text-red-400" />
                                                            {order.delivery?.address?.street}, {order.delivery?.address?.city}
                                                        </p>
                                                        <a href={`tel:${order.vendor?.phone}`} className="text-xs text-blue-600 flex items-center mt-1 font-medium hover:underline">
                                                            <Phone className="w-3 h-3 mr-1" /> {order.vendor?.phone || "N/A"}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order Items ({order.items?.length})</p>
                                                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
                                                    {order.items?.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-white last:border-0">
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                                                                <p className="text-[10px] text-slate-500">{item.quantity} {item.unit} @ ₹{item.pricePerUnit}</p>
                                                            </div>
                                                            <span className="font-bold text-slate-800 text-sm">₹{item.totalPrice}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                                                        <span className="font-black text-orange-600">₹{order.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {order.specialInstructions && (
                                            <div className="flex items-start space-x-2 bg-yellow-50 p-3 rounded-xl border border-yellow-100 mt-4">
                                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                <p className="text-xs font-medium text-yellow-800"><span className="font-bold">Instructions:</span> {order.specialInstructions}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: action panel */}
                                    <div className="bg-slate-900/3 lg:w-64 p-5 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Update Status</p>

                                        {order.status === "pending" && (
                                            <>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10" disabled={updatingId === order._id} onClick={() => updateStatus(order._id, "confirmed")}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
                                                </Button>
                                                <Button variant="outline" className="w-full text-red-600 border-red-100 hover:bg-red-50 rounded-xl h-10" onClick={() => updateStatus(order._id, "cancelled")}>
                                                    <X className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {order.status === "confirmed" && (
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10" disabled={updatingId === order._id} onClick={() => updateStatus(order._id, "packed")}>
                                                <Package className="w-4 h-4 mr-2" /> Mark as Packed
                                            </Button>
                                        )}
                                        {order.status === "packed" && (
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10" disabled={updatingId === order._id} onClick={() => updateStatus(order._id, "dispatched")}>
                                                <Truck className="w-4 h-4 mr-2" /> Dispatch Order
                                            </Button>
                                        )}
                                        {order.status === "dispatched" && (
                                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10" disabled={updatingId === order._id} onClick={() => updateStatus(order._id, "delivered")}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Delivery
                                            </Button>
                                        )}
                                        {order.status === "delivered" && (
                                            <div className="text-center py-4 text-green-600 font-bold flex flex-col items-center bg-green-50 rounded-2xl border border-green-100">
                                                <CheckCircle2 className="w-8 h-8 mb-1" /> Order Fulfilled
                                            </div>
                                        )}
                                        {order.status === "cancelled" && (
                                            <div className="text-center py-4 text-red-600 font-bold flex flex-col items-center bg-red-50 rounded-2xl border border-red-100">
                                                <X className="w-8 h-8 mb-1" /> Cancelled
                                            </div>
                                        )}

                                        {/* Order meta */}
                                        <div className="pt-2 space-y-1 text-xs text-slate-500">
                                            <div className="flex justify-between"><span>Payment</span><span className="font-bold">{order.payment?.method?.toUpperCase() || "–"}</span></div>
                                            <div className="flex justify-between"><span>Delivery by</span><span className="font-bold">{order.delivery?.scheduledDate ? format(new Date(order.delivery.scheduledDate), "MMM dd") : "–"}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
                        <p className="text-slate-500 mt-1">Incoming orders will appear here once vendors start ordering.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
