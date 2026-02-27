import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  User,
  Phone,
  Store,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Mic,
  Globe,
  Truck,
  ShieldCheck
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "vendor"; // default to vendor

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    businessCategory: "",
    location: "",
    address: "",
    language: "english",
    dailyBudget: "",
    primaryItems: [],
    // Supplier specific
    gstNumber: "",
    pincode: "",
    deliveryRadius: "10",
    minOrderAmount: "500"
  });

  const [verificationDocumentUrl, setVerificationDocumentUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("document", file);

    try {
      setIsUploading(true);
      const response = await api.post("/upload/document", uploadData);
      setVerificationDocumentUrl(response.url);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stallTypes = [
    "Pani Puri Stall",
    "Vada Pav Stall",
    "Chaat Counter",
    "Dosa Point",
    "Pav Bhaji",
    "Samosa Stall",
    "Tea Stall",
    "Fruit Juice",
    "Other"
  ];

  const categories = [
    "Vegetables",
    "Fruits",
    "Spices",
    "Grains",
    "Dairy",
    "Meat",
    "Dry Goods",
    "Beverages"
  ];

  const languages = [
    { label: "हिंदी", value: "hindi" },
    { label: "मराठी", value: "marathi" },
    { label: "अंग्रेजी", value: "english" },
    { label: "गुजराती", value: "gujarati" }
  ];

  const commonItems = [
    "प्याज", "टमाटर", "आलू", "हरी मिर्च", "अदरक-लहसुन",
    "तेल", "मसाले", "चावल", "दाल", "आटा"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleItemToggle = (item: string) => {
    const currentItems = formData.primaryItems;
    const updatedItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];

    setFormData({ ...formData, primaryItems: updatedItems });
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('❌ Please fill in all required basic fields.');
      return;
    }

    // Role specific validation
    if (role === 'supplier' && formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      toast.error('❌ Invalid GST number format. Example: 27AABCU9603R1ZX');
      return;
    }

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: role, // 'vendor' or 'supplier'
        businessName: formData.businessName || formData.name,
        address: formData.address || formData.location || 'Local Market',
        addressDetails: {
          street: formData.location || 'Local Market',
          city: 'Solapur',
          state: 'Maharashtra',
          pincode: formData.pincode || '413001'
        },
        ...(role === 'supplier' ? {
          gstNumber: formData.gstNumber,
          deliveryRadius: parseInt(formData.deliveryRadius) || 10,
          minOrderAmount: parseInt(formData.minOrderAmount) || 500,
          productCategories: formData.businessCategory ? [formData.businessCategory] : (formData.primaryItems.length > 0 ? formData.primaryItems : ['Vegetables']),
          fssaiLicense: verificationDocumentUrl,
          paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
          workingHoursFrom: '08:00',
          workingHoursTo: '20:00'
        } : {
          businessCategory: 'street_food',
          stallName: formData.businessName || formData.name,
          stallType: formData.businessCategory || 'street_food',
          verificationDocument: verificationDocumentUrl
        })
      };

      const data = await api.post("/auth/register", payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('🎉 Registration Successful! Welcome to BazaarBandhu.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900 leading-tight">BazaarBandhu</h1>
                <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">
                  {role === 'supplier' ? 'Supplier Registration' : 'Vendor Registration'}
                </p>
              </div>
            </Link>

            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              Step {currentStep} / {totalSteps}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm font-bold text-orange-900 mb-2">
            <span>{currentStep === 4 ? 'Almost Done!' : 'Your Progress'}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-white/50 border border-orange-100" />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-xl shadow-orange-100/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400" />
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-2xl text-slate-900">
                <div className="bg-orange-100 p-2 rounded-lg">
                  {currentStep === 1 && <User className="h-6 w-6 text-orange-600" />}
                  {currentStep === 2 && (role === 'supplier' ? <Truck className="h-6 w-6 text-orange-600" /> : <Store className="h-6 w-6 text-orange-600" />)}
                  {currentStep === 3 && <MapPin className="h-6 w-6 text-orange-600" />}
                  {currentStep === 4 && <ShieldCheck className="h-6 w-6 text-orange-600" />}
                </div>
                <span>
                  {currentStep === 1 && "Personal Details"}
                  {currentStep === 2 && (role === 'supplier' ? "Business Verification" : "Shop Information")}
                  {currentStep === 3 && "Location & Accessibility"}
                  {currentStep === 4 && "Final Review"}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Rahul Sharma"
                        className="h-12 rounded-xl"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <div className="flex">
                        <div className="bg-slate-100 px-3 py-2 rounded-l-xl border border-r-0 text-sm text-slate-600 flex items-center">
                          +91
                        </div>
                        <Input
                          id="phone"
                          placeholder="9876543210"
                          className="rounded-l-none h-12 rounded-r-xl"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rahul@example.com"
                      className="h-12 rounded-xl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Set Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      className="h-12 rounded-xl"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shop/Business Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">{role === 'supplier' ? 'Company/Trade Name *' : 'Stall/Shop Name *'}</Label>
                    <Input
                      id="businessName"
                      placeholder={role === 'supplier' ? "e.g. Fresh Garden Veggies" : "e.g. Rahul Vada Pav Center"}
                      className="h-12 rounded-xl"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessCategory">{role === 'supplier' ? 'Primary Supply Category *' : 'Business Type *'}</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(role === 'supplier' ? categories : stallTypes).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {role === 'supplier' && (
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                      <Input
                        id="gstNumber"
                        placeholder="22AAAAA0000A1Z5"
                        className="h-12 rounded-xl"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-orange-600" />
                        <p className="text-sm font-bold text-orange-900">Certificate / Shop Photo</p>
                      </div>
                      {verificationDocumentUrl && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      Upload your shop license or FSSAI certificate to gain "Verified" status and attract more business.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        id="doc-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "bg-white rounded-lg transition-all",
                          verificationDocumentUrl ? "text-green-600 border-green-200" : "text-orange-700 border-orange-200"
                        )}
                        onClick={() => document.getElementById('doc-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : verificationDocumentUrl ? "Click to Change Document" : "Upload Document"}
                      </Button>
                      {verificationDocumentUrl && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          Document uploaded successfully
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Location and Language */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Operating Area *</Label>
                      <Input
                        id="location"
                        placeholder="e.g. Dadar"
                        className="h-12 rounded-xl"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        className="h-12 rounded-xl"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address for Logistics</Label>
                    <Textarea
                      id="address"
                      placeholder="Full shop/warehouse address"
                      className="rounded-xl min-h-[100px]"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred AI Interaction Language *</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Choose Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mic className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-bold text-blue-900">Voice Assistance Enabled</p>
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      You can manage inventory & place orders using voice commands in {languages.find(l => l.value === formData.language)?.label}.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Final Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {role === 'vendor' ? (
                    <div>
                      <Label className="text-base font-bold text-slate-900">What do you buy most often?</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                        {commonItems.map((item) => (
                          <div
                            key={item}
                            onClick={() => handleItemToggle(item)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium flex items-center justify-between ${formData.primaryItems.includes(item) ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200'}`}
                          >
                            {item}
                            {formData.primaryItems.includes(item) && <CheckCircle className="h-4 w-4" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Delivery Radius (km)</Label>
                          <Input className="h-12 rounded-xl" type="number" value={formData.deliveryRadius} onChange={e => setFormData({ ...formData, deliveryRadius: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Min. Order (₹)</Label>
                          <Input className="h-12 rounded-xl" type="number" value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Your Marketplace Benefits:
                    </h4>
                    <ul className="text-sm text-green-800 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Access to verified business network</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>Automated GST billing and records</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <span>AI Assistant for 24/7 business management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="h-12 px-6 font-bold text-slate-500 rounded-xl"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="h-12 px-8 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="h-12 px-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-orange-200 transition-all hover:scale-[1.02]"
                    onClick={handleSubmit}
                  >
                    Complete Registration
                    <CheckCircle className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
