import { useState } from "react";
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
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    stallName: "",
    stallType: "",
    location: "",
    address: "",
    language: "",
    dailyBudget: "",
    primaryItems: []
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stallTypes = [
    "वडा पाव स्टॉल",
    "चाट काउंटर",
    "डोसा पॉइंट",
    "पाव भाजी",
    "समोसा स्टॉल",
    "चाय स्टॉल",
    "फ्रूट जूस",
    "अन्य"
  ];

  const languages = [
    "हिंदी",
    "मराठी",
    "तमिल",
    "बंगाली",
    "गुजराती",
    "तेलुगु",
    "कन्नड़",
    "अंग्रेजी"
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
                <h1 className="text-2xl font-bold text-orange-900">Saarthi+</h1>
                <p className="text-sm text-orange-700">नए विक्रेता का स्वागत</p>
              </div>
            </Link>

            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              चरण {currentStep} / {totalSteps}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>पंजीकरण प्रगति</span>
            <span>{Math.round(progress)}% पूर्ण</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentStep === 1 && <User className="h-5 w-5 text-orange-600" />}
                {currentStep === 2 && <Store className="h-5 w-5 text-orange-600" />}
                {currentStep === 3 && <MapPin className="h-5 w-5 text-orange-600" />}
                {currentStep === 4 && <CheckCircle className="h-5 w-5 text-orange-600" />}
                <span>
                  {currentStep === 1 && "व्यक्तिगत जानकारी"}
                  {currentStep === 2 && "दुकान की जानकारी"}
                  {currentStep === 3 && "स्थान और भाषा"}
                  {currentStep === 4 && "खरीदारी की प्राथमिकताएं"}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">आपका नाम *</Label>
                    <Input
                      id="name"
                      placeholder="जैसे: कमलेश भाई पटेल"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">ईमेल पता *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">पासवर्ड *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">मोबाइल नंबर *</Label>
                    <div className="flex">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 text-sm text-gray-600">
                        +91
                      </div>
                      <Input
                        id="phone"
                        placeholder="9876543210"
                        className="rounded-l-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">OTP भेजा जाएगा</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">व्हाट्सएप अपडेट</p>
                    </div>
                    <p className="text-xs text-blue-700">
                      दैनिक रेट, ऑर्डर अपडेट और समूह की जानकारी के लिए व्हाट्सएप पर मैसेज आएंगे
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Shop Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stallName">दुकान/स्टॉल का नाम *</Label>
                    <Input
                      id="stallName"
                      placeholder="जैसे: कमलेश वडा पाव सेंटर"
                      value={formData.stallName}
                      onChange={(e) => setFormData({ ...formData, stallName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stallType">स्टॉल का प्रकार *</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, stallType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="अपना स्टॉल प्रकार चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {stallTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dailyBudget">दैनिक खरीदारी का बजट</Label>
                    <div className="flex">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 text-sm text-gray-600">
                        ₹
                      </div>
                      <Input
                        id="dailyBudget"
                        placeholder="500"
                        className="rounded-l-none"
                        value={formData.dailyBudget}
                        onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">औसतन दैनिक सामान की खरीदारी</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Camera className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">FSSAI लाइसेंस (वैकल्पिक)</p>
                    </div>
                    <p className="text-xs text-green-700 mb-2">
                      FSSAI लाइसेंस अपलोड करें बेहतर रेट और विश्वसनीयता के लिए
                    </p>
                    <Button variant="outline" size="sm" className="text-green-700 border-green-200">
                      <Camera className="h-3 w-3 mr-1" />
                      फोटो लें
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Location and Language */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">स्टॉल का इलाका *</Label>
                    <Input
                      id="location"
                      placeholder="जैसे: सोलापुर सेंट्रल मार्केट"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <Button variant="outline" size="sm" className="mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      GPS से लोकेशन लें
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="address">पूरा पता</Label>
                    <Textarea
                      id="address"
                      placeholder="दुकान का पूरा पता लिखें"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="language">पसंदीदा भाषा *</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="AI असिस्टेंट की भाषा चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mic className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">आवाज़ से ऑर्डर</p>
                    </div>
                    <p className="text-xs text-purple-700">
                      आप बोलकर ऑर्डर दे सकेंगे: "Saarthi, आज प्याज 5 किलो चाहिए"
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Shopping Preferences */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>आपको कौन सा सामान सबसे ज्यादा चाहिए? (कई चुन सकते हैं)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {commonItems.map((item) => (
                        <Button
                          key={item}
                          variant={formData.primaryItems.includes(item) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleItemToggle(item)}
                          className="justify-start"
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-900">PM SVANidhi योजना</p>
                    </div>
                    <p className="text-xs text-yellow-700 mb-2">
                      ₹50,000 तक का लोन 4% सालाना ब्याज दर पर
                    </p>
                    <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-200">
                      जानकारी देखें
                    </Button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">आपके फायदे:</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• समूह में खरीदारी से 15-25% बचत</li>
                      <li>• विश्वसनीय सप्लायर से डायरेक्ट खरीदारी</li>
                      <li>• AI असिस्टेंट से 24/7 सहायता</li>
                      <li>• उधार सुविधा (₹1000 तक)</li>
                      <li>• GST बिल और रिकॉर्ड की सुविधा</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  पिछला
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    अगला
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={async () => {
                      try {
                        const payload = {
                          fullName: formData.name,
                          email: formData.email,
                          password: formData.password,
                          phone: formData.phone,
                          userType: 'vendor', // This page seems specific to vendors
                          stallName: formData.stallName,
                          stallType: formData.stallType,
                          addressDetails: {
                            street: formData.address || formData.location,
                            city: 'City',
                            state: 'State',
                            pincode: '000000'
                          }
                        };

                        const response = await fetch('http://localhost:5004/api/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          throw new Error(data.error || 'Registration failed');
                        }

                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        alert('🎉 पंजीकरण सफल! Saarthi+ में आपका स्वागत है।');
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Registration error:', error);
                        alert(`❌ त्रुटी: ${error.message}`);
                      }
                    }}
                  >
                    पंजीकरण पूरा करें
                    <CheckCircle className="h-4 w-4 ml-2" />
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
