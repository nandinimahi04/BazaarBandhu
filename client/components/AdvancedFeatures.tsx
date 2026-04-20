import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
    MessageSquare, 
    BellRing, 
    Share2, 
    Zap, 
    ShieldCheck, 
    Users2, 
    ArrowUpRight,
    TrendingDown,
    Map
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export const AdvancedFeatures = () => {
    const [recovery, setRecovery] = useState<any>(null);
    const [nearby, setNearby] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeatures = async () => {
            try {
                const [recData, nearData, predData] = await Promise.all([
                    api.get('/features/recovery-status'),
                    api.get('/features/group-buying/nearby'),
                    api.get('/features/predictions')
                ]);
                setRecovery(recData);
                setNearby(nearData);
                setPredictions(predData);
            } catch (error) {
                console.error("Advanced Features Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFeatures();
    }, []);

    if (isLoading) return <div className="animate-pulse h-40 bg-slate-100 rounded-2xl" />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {/* WhatsApp Integration Status */}
            <Card className="clay-element border-green-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center justify-between text-green-700">
                        WhatsApp (Active)
                        <MessageSquare className="w-4 h-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-black">No App Mode</p>
                        <p className="text-sm font-medium">Auto-sync with WhatsApp Business is ON.</p>
                        <Button variant="outline" className="w-full text-[10px] h-7 border-green-200 text-green-700 bg-green-50">
                            Sync Manual Stock
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Smart Recovery */}
            <Card className="clay-element border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center justify-between text-blue-700">
                        Recovery Engine
                        <BellRing className="w-4 h-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                            {recovery?.records?.map((r: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-700">{r.party}</p>
                                        <p className="text-[12px] font-black text-blue-600">₹{r.amount}</p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-6 text-[9px] border-blue-200 text-blue-600 px-2"
                                        onClick={async () => {
                                            try {
                                                await api.post('/features/recovery/remind', { orderId: r.id });
                                                alert(`Sent smart ${r.tone} reminder to ${r.party}`);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                    >
                                        Remind
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] h-8 rounded-xl mt-2">
                             Send All Reminders
                        </Button>
                </CardContent>
            </Card>

            {/* Group Buying Moat */}
            <Card className="clay-element border-orange-100 overflow-hidden relative">
                <div className="absolute top-2 right-2 flex gap-1">
                    <Users2 className="w-4 h-4 text-orange-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-orange-700">Bazaar Group Savings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Map className="w-3 h-3 text-orange-400" />
                            <p className="text-[10px] font-bold">{nearby?.nearbyVendorsReady || 0} vendors active nearby</p>
                        </div>
                        {nearby?.groups?.slice(0, 1).map((g: any, i: number) => (
                            <div key={i} className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-xs">{g.name}</span>
                                    <span className="text-green-600 font-black text-xs">-{g.savings || '15%'}</span>
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-500 mb-2">
                                    <span>{Math.round((g.currentQuantity/g.targetQuantity)*100)}% full</span>
                                    <span className="text-orange-600 font-bold">Ends in 2 days</span>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full h-7 text-[10px] bg-orange-500 hover:bg-orange-600"
                                    onClick={async () => {
                                        try {
                                            await api.post('/features/group-buying/join', { groupId: g.id || g._id, quantity: 50 });
                                            toast.success("Joined group buy! You will be notified when it closes.");
                                        } catch (e) {
                                            toast.error("Failed to join group");
                                        }
                                    }}
                                >
                                    Join Group Order <ArrowUpRight className="w-2 h-2 ml-1" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Prediction (Kal Kya Bikega) */}
            <Card className="clay-element border-purple-100 col-span-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center justify-between text-purple-700">
                        AI Demand Predictor (Kal Kya Bikega?)
                        <Zap className="w-4 h-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {predictions.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-100">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    {p.demand === 'High' ? <Zap className="w-5 h-5 text-yellow-500" /> : <TrendingDown className="w-5 h-5 text-purple-400" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-xs underline decoration-purple-200">{p.item}</p>
                                        <span className="text-[10px] font-mono font-bold text-purple-600">{p.confidence} match</span>
                                    </div>
                                    <p className="text-base font-black text-slate-900">Demand: {p.demand}</p>
                                    <p className="text-[9px] text-slate-500">{p.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
