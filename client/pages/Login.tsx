import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.post("/auth/login", { email, password });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success("Login successful!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-orange-100 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-yellow-500" />
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-2xl shadow-lg shadow-orange-200">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Login to BazaarBandhu</CardTitle>
                    <p className="text-slate-500">नमस्ते! अपने खाते में लॉग इन करें।</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-orange-500 transition-all rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-sm font-medium text-orange-600 hover:text-orange-700">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-orange-500 transition-all rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 transition-all group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <>
                                    Login Now
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                        <div className="text-center pt-4">
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/landing" className="font-bold text-orange-600 hover:text-orange-700">Join as Vendor/Supplier</Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
