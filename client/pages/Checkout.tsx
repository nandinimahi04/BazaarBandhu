import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ChevronLeft,
    CreditCard,
    Truck,
    CheckCircle2,
    AlertCircle,
    IndianRupee
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Checkout() {
    const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Success
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const navigate = useNavigate();

    const deliveryCharge = totalAmount > 2000 ? 0 : 50;
    const finalTotal = totalAmount + deliveryCharge;

    const handlePlaceOrder = async () => {
        try {
            const payload = {
                supplierId: cart[0].supplierId || "67be00000000000000000000", // Fallback if missing
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unit: item.unit || 'kg',
                    pricePerUnit: item.price
                })),
                deliveryAddress: {
                    street: "Main Street",
                    city: "Solapur",
                    state: "Maharashtra",
                    pincode: "413001"
                },
                scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                timeSlot: "09:00 - 12:00",
                paymentMethod,
                specialInstructions: "Please deliver near the main gate."
            };

            const data = await api.post("/orders", payload);
            setStep(3);
            clearCart();
            toast.success("ऑर्डर सफलतापूर्वक दिया गया!");
        } catch (error: any) {
            console.error("Order placement error:", error);
            toast.error(error.message || "ऑर्डर देने में विफल। कृपया पुनः प्रयास करें।");
        }
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">आपका कार्ट खाली है</h2>
                <p className="text-slate-500 mb-8">Seems like you haven't added anything to your cart yet.</p>
                <Link to="/suppliers">
                    <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-xl font-bold">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-10">
                {step !== 3 && (
                    <div className="flex items-center justify-between mb-8">
                        <Link to="/suppliers" className="flex items-center text-slate-500 hover:text-orange-600 transition-colors">
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Suppliers
                        </Link>
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                            <div className="w-10 h-1 bg-slate-200" />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-3xl font-extrabold text-slate-900">Review Items</h1>
                            {cart.map((item) => (
                                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{item.name}</h3>
                                                <p className="text-sm text-slate-500">{item.supplierName}</p>
                                                <p className="text-sm font-bold text-orange-600">₹{item.price}/{item.unit}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-3">
                                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-lg bg-white overflow-hidden">
                                <div className="h-2 bg-orange-600" />
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>₹{totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Delivery Fee</span>
                                        <span>{deliveryCharge === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${deliveryCharge}`}</span>
                                    </div>
                                    {deliveryCharge > 0 && (
                                        <div className="flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Add ₹{2000 - totalAmount} more for FREE delivery!</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-4 flex justify-between font-extrabold text-xl text-slate-900">
                                        <span>Total Amount</span>
                                        <span>₹{finalTotal}</span>
                                    </div>
                                    <Button className="w-full h-14 bg-slate-900 hover:bg-black rounded-xl text-lg font-bold" onClick={() => setStep(2)}>
                                        Continue to Payment
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 text-center">Select Payment</h1>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: "upi", name: "UPI (Google Pay, PhonePe, Paytm)", icon: IndianRupee },
                                { id: "card", name: "Credit / Debit Card", icon: CreditCard },
                                { id: "cod", name: "Cash on Delivery (Udhaar Available)", icon: Truck },
                            ].map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-4 ${paymentMethod === method.id ? 'border-orange-600 bg-orange-50' : 'border-slate-100 hover:border-orange-200 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === method.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <method.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${paymentMethod === method.id ? 'text-orange-900' : 'text-slate-700'}`}>{method.name}</span>
                                    {paymentMethod === method.id && <CheckCircle2 className="ml-auto text-orange-600 w-6 h-6" />}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">Final Amount</p>
                                    <p className="text-3xl font-extrabold text-slate-900">₹{finalTotal}</p>
                                </div>
                                <Button className="h-14 px-10 bg-orange-600 hover:bg-orange-700 rounded-xl text-lg font-bold shadow-lg shadow-orange-200" onClick={handlePlaceOrder}>
                                    Place Order Now
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400 text-center">By clicking place order, you agree to BazaarBandhu's terms of service.</p>
                        </div>
                        <Button variant="ghost" className="w-full text-slate-500" onClick={() => setStep(1)}>Go back to review items</Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-lg mx-auto text-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100 px-10">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">बधाई हो! 🎉</h1>
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">Order Placed Successfully</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed">
                            Your order has been sent to our verified suppliers. They will confirm and dispatch your items within the promised time.
                        </p>
                        <div className="space-y-4">
                            <Link to="/orders">
                                <Button className="w-full h-14 bg-slate-900 hover:bg-black rounded-xl text-lg font-bold">
                                    View My Orders
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="ghost" className="w-full text-slate-500">
                                    Return to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
