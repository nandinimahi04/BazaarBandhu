import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Building2,
    ShoppingBag,
    IndianRupee,
    ShieldCheck,
    AlertCircle,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from "lucide-react";
import { api } from "@/lib/api";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 1240,
        totalSuppliers: 85,
        totalOrders: 4520,
        totalRevenue: 850000,
        growth: 12.5
    });

    const data = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">System Administration</h1>
                        <p className="text-slate-500">Global marketplace overview and control panel</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" className="rounded-xl">Report Export</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">System Logs</Button>
                    </div>
                </div>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Vendors</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.totalUsers}</h3>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+8% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Active Suppliers</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.totalSuppliers}</h3>
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+3 from last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Monthly Orders</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.totalOrders}</h3>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-lg">
                                <ShoppingBag className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-red-600 font-bold">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            <span>-2% from peak</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">System Revenue</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
                            </div>
                            <div className="bg-green-50 p-2 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span>+15.2% growth</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Platform Transaction volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Notifications & Security */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center">
                                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                                Security Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                <span className="text-xs font-medium text-green-800">Auth Services</span>
                                <Badge className="bg-green-500 text-white">HEALTHY</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-xs font-medium text-red-800">Payment Gateway Latency</span>
                                <span className="text-xs font-bold text-red-600">High (1.2s)</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                                Pending Verifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold">Supplier #{1020 + i}</p>
                                        <p className="text-[10px] text-slate-500">GST Verification needed</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold text-blue-600">Review</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* User Management Table Section */}
            <div className="mt-8">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent User Activity</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search users..." className="pl-10 h-9 text-sm rounded-lg" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {[
                                { name: "Rahul Sharma", role: "VENDOR", status: "Active", lastSeen: "2m ago" },
                                { name: "Fresh Garden Traders", role: "SUPPLIER", status: "Active", lastSeen: "5m ago" },
                                { name: "Priya Patil", role: "VENDOR", status: "Idle", lastSeen: "1h ago" },
                                { name: "Solapur Wholesale", role: "SUPPLIER", status: "Active", lastSeen: "12m ago" },
                            ].map((user, idx) => (
                                <div key={idx} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 mt-1">{user.role}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-8">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-slate-500">Last Seen</p>
                                            <p className="text-sm font-bold text-slate-900">{user.lastSeen}</p>
                                        </div>
                                        <div className="w-24 text-right">
                                            <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                                                {user.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
