import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Store,
    Truck,
    ChevronRight,
    ShieldCheck,
    Zap,
    Users,
    ArrowRight,
    TrendingUp,
    MessageCircle,
    IndianRupee
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
            <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        .hero-gradient {
          background: radial-gradient(circle at top right, #fff5eb, transparent),
                      radial-gradient(circle at bottom left, #f0f7ff, transparent);
        }
      `}</style>

            {/* Background Blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden hero-gradient">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-white/60 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Store className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-800">
                            BazaarBandhu
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
                        <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-orange-600 transition-colors">How it Works</a>
                        <Link to="/login" className="hover:text-orange-600 transition-colors">Login</Link>
                    </div>
                    <Link to="/register?role=vendor">
                        <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200/50 rounded-full px-6">
                            Join Now
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-20 pb-24 text-center">
                <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-8 animate-bounce">
                    <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                    <span className="text-sm font-semibold text-orange-800 tracking-wide uppercase">AI-Powered Marketplace</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight">
                    आपका विश्वसनीय <span className="text-orange-600">बाज़ार साथी</span><br />
                    <span className="text-gray-400">Your Trusted Marketplace Partner</span>
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Empowering Indian street food vendors with AI voice shopping, group buying savings,
                    and seamless supplier connections. Everything you need to grow your business.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
                    {/* Vendor Card */}
                    <Link to="/register?role=vendor" className="w-full">
                        <Card className="glass-card hover:border-orange-200 transition-all duration-300 group cursor-pointer overflow-hidden p-8 h-full">
                            <div className="absolute top-2 right-2 w-24 h-24 bg-orange-100 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 opacity-20" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Store className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Join as Vendor</h3>
                                <p className="text-gray-500 mb-6">Buy smarter, save more with group orders and AI assistance.</p>
                                <div className="flex items-center text-orange-600 font-bold">
                                    Start Selling <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Card>
                    </Link>

                    {/* Supplier Card */}
                    <Link to="/register?role=supplier" className="w-full">
                        <Card className="glass-card hover:border-blue-200 transition-all duration-300 group cursor-pointer overflow-hidden p-8 h-full">
                            <div className="absolute top-2 right-2 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 opacity-20" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Truck className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Join as Supplier</h3>
                                <p className="text-gray-500 mb-6">Reach thousands of vendors and manage your inventory easily.</p>
                                <div className="flex items-center text-blue-600 font-bold">
                                    Start Supplying <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="bg-white py-24 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Growth</h2>
                        <p className="text-gray-500">Tailored specifically for the Indian marketplace ecosystem</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: MessageCircle, title: "AI Voice Shopping", desc: "Order supplies in your native language with our intelligent AI assistant.", color: "orange" },
                            { icon: Users, title: "Group Buying", desc: "Join forces with nearby vendors to unlock massive wholesale discounts.", color: "blue" },
                            { icon: IndianRupee, title: "Digital Udhaar", desc: "Build your trust score and access short-term credit for your business.", color: "green" },
                            { icon: TrendingUp, title: "Smart Inventory", desc: "Never run out of stock with real-time alerts and demand forecasting.", color: "purple" },
                            { icon: ShieldCheck, title: "Verified Suppliers", desc: "Buy with confidence from 100% verified and rated sellers.", color: "indigo" },
                            { icon: Zap, title: "Instant Payments", desc: "Secure multi-method payments including UPI, Card, and Wallets.", color: "red" },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col space-y-4">
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center`}>
                                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">{feature.title}</h4>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 hero-gradient">
                <div className="container mx-auto px-6">
                    <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Already supporting thousands of vendors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            <div>
                                <p className="text-4xl font-extrabold text-orange-600 mb-2">5000+</p>
                                <p className="text-gray-500 font-medium">Active Vendors</p>
                            </div>
                            <div>
                                <p className="text-4xl font-extrabold text-blue-600 mb-2">250+</p>
                                <p className="text-gray-500 font-medium">Verified Suppliers</p>
                            </div>
                            <div>
                                <p className="text-4xl font-extrabold text-green-600 mb-2">₹2.5Cr+</p>
                                <p className="text-gray-500 font-medium">Monthly Savings</p>
                            </div>
                            <div>
                                <p className="text-4xl font-extrabold text-purple-600 mb-2">15+</p>
                                <p className="text-gray-500 font-medium">Market Hubs</p>
                            </div>
                        </div>
                        <Button size="lg" className="bg-gray-900 hover:bg-black text-white px-10 rounded-full h-14 text-lg">
                            Download the Mobile App <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-8">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                            <Store className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">BazaarBandhu</span>
                    </div>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Making the Indian marketplace accessible, digital, and growing for everyone.
                    </p>
                    <div className="flex justify-center space-x-6 mb-12">
                        <a href="#" className="text-gray-400 hover:text-orange-600">Twitter</a>
                        <a href="#" className="text-gray-400 hover:text-orange-600">Facebook</a>
                        <a href="#" className="text-gray-400 hover:text-orange-600">LinkedIn</a>
                    </div>
                    <p className="text-gray-400 text-sm">
                        © 2025 BazaarBandhu. All rights reserved. Built with ❤️ for India.
                    </p>
                </div>
            </footer>
        </div>
    );
}
