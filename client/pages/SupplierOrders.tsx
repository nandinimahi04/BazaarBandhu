import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Truck,
    Package,
    Clock,
    CheckCircle,
    ChevronLeft,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2,
    X
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function SupplierOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await api.get("/orders");
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("ऑर्डर लोड करने में विफल");
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, {
                status: newStatus,
                location: "Warehouse",
                description: `Order updated to ${newStatus}`
            });
            toast.success(`ऑर्डर स्थिति अपडेट की गई: ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error("अपडेट करने में विफल");
        }
    };

    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-600";
            case "confirmed": return "bg-blue-100 text-blue-600";
            case "dispatched": return "bg-purple-100 text-purple-600";
            case "delivered": return "bg-green-100 text-green-600";
            case "cancelled": return "bg-red-100 text-red-600";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading Orders...</div>;
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
                        <h1 className="text-3xl font-bold text-slate-900">Incoming Orders</h1>
                        <p className="text-slate-500">Manage and fulfill your customer orders</p>
                    </div>
                </div>

                <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    {["all", "pending", "confirmed", "dispatched", "delivered"].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "ghost"}
                            className={`rounded-lg capitalize ${filterStatus === status ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'text-slate-500 hover:text-orange-600'}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </header>

            <div className="space-y-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Card key={order._id} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex flex-col lg:flex-row">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Order #{order._id.slice(-6)}</h3>
                                                <p className="text-sm text-slate-500">{format(new Date(order.placedAt), 'MMM dd, yyyy • hh:mm a')}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(order.status)} border-none px-4 py-1.5 rounded-full text-sm font-bold uppercase`}>
                                            {order.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Details</p>
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                        {order.vendor?.businessName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{order.vendor?.businessName || "Unknown Vendor"}</p>
                                                        <p className="text-sm text-slate-500 flex items-center mt-1">
                                                            <MapPin className="w-3 h-3 mr-1" /> {order.delivery?.address?.city}, {order.delivery?.address?.state}
                                                        </p>
                                                        <p className="text-sm text-blue-600 flex items-center mt-1 cursor-pointer hover:underline">
                                                            <Phone className="w-3 h-3 mr-1" /> {order.vendor?.phone || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Items</p>
                                                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-slate-700 font-medium">{item.productName} × {item.quantity} {item.unit}</span>
                                                            <span className="text-slate-900 font-bold">₹{item.totalPrice}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between">
                                                        <span className="font-bold text-slate-900">Total Amount</span>
                                                        <span className="font-black text-orange-600 text-lg">₹{order.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {order.specialInstructions && (
                                        <div className="flex items-start space-x-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-6">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                            <p className="text-sm text-yellow-800"><span className="font-bold">Instructions:</span> {order.specialInstructions}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-900/5 lg:w-72 p-6 flex flex-col justify-center space-y-3 border-l border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Actions</p>

                                    {order.status === 'pending' && (
                                        <>
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl" onClick={() => updateOrderStatus(order._id, 'confirmed')}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
                                            </Button>
                                            <Button variant="outline" className="w-full text-red-600 border-red-100 hover:bg-red-50 rounded-xl" onClick={() => updateOrderStatus(order._id, 'cancelled')}>
                                                <X className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </>
                                    )}

                                    {order.status === 'confirmed' && (
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl" onClick={() => updateOrderStatus(order._id, 'dispatched')}>
                                            <Truck className="w-4 h-4 mr-2" /> Dispatch
                                        </Button>
                                    )}

                                    {order.status === 'dispatched' && (
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => updateOrderStatus(order._id, 'delivered')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                                        </Button>
                                    )}

                                    {order.status === 'delivered' && (
                                        <div className="text-center py-4 text-green-600 font-bold flex flex-col items-center">
                                            <CheckCircle2 className="w-10 h-10 mb-2" />
                                            Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
                        <p className="text-slate-500">Incoming orders will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
