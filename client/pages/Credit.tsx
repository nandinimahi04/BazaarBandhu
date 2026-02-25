import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  IndianRupee, 
  Shield, 
  TrendingUp, 
  Clock, 
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  FileText,
  Phone,
  Star,
  Award,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Credit() {
  const [creditAmount, setCreditAmount] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  const creditProfile = {
    currentLimit: 850,
    usedCredit: 320,
    availableCredit: 530,
    trustScore: 85,
    totalRepaid: 2400,
    onTimePayments: 12,
    defaultRate: 0,
    memberSince: "3 महीने",
    nextDueDate: "27 जनवरी",
    nextDueAmount: 85,
    interestRate: 2.5
  };

  const creditHistory = [
    {
      id: "CR-001",
      date: "15 जनवरी",
      amount: 500,
      purpose: "सब्जी खरीदारी",
      status: "चुकता",
      dueDate: "22 जनवरी",
      paidDate: "20 जनवरी",
      interest: 12.5
    },
    {
      id: "CR-002", 
      date: "8 जनवरी",
      amount: 300,
      purpose: "मसाले का स्टॉक",
      status: "चुकता",
      dueDate: "15 जनवरी",
      paidDate: "14 जनवरी",
      interest: 7.5
    },
    {
      id: "CR-003",
      date: "20 दिसंबर",
      amount: 750,
      purpose: "तेल की खरीदारी",
      status: "चुकता",
      dueDate: "27 दिसंबर", 
      paidDate: "26 दिसंबर",
      interest: 18.75
    }
  ];

  const groupMembers = [
    { name: "कमलेश भाई", trustScore: 92, contribution: 450, status: "excellent" },
    { name: "रेखा दीदी", trustScore: 88, contribution: 380, status: "good" },
    { name: "सुरेश जी", trustScore: 79, contribution: 290, status: "average" },
    { name: "आरती बेन", trustScore: 94, contribution: 520, status: "excellent" }
  ];

  const getTrustBadge = (score: number) => {
    if (score >= 90) return { color: "bg-green-100 text-green-800", label: "उत्कृष्ट" };
    if (score >= 75) return { color: "bg-blue-100 text-blue-800", label: "अच्छा" };
    if (score >= 60) return { color: "bg-yellow-100 text-yellow-800", label: "औसत" };
    return { color: "bg-red-100 text-red-800", label: "सुधार चाहिए" };
  };

  const creditUtilization = (creditProfile.usedCredit / creditProfile.currentLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">उधार चेन</h1>
                <p className="text-sm text-orange-700">स्मार्ट माइक्रो क्रेडिट</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Shield className="h-3 w-3 mr-1" />
                ट्रस्ट स्कोर: {creditProfile.trustScore}%
              </Badge>
              <Link to="/">
                <Button variant="outline" size="sm">
                  डैशबोर्ड
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Credit Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <IndianRupee className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700">उपलब्ध लिमिट</p>
                  <p className="text-lg font-bold text-purple-900">₹{creditProfile.availableCredit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">ट्रस्ट स्कोर</p>
                  <p className="text-lg font-bold text-blue-900">{creditProfile.trustScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">समय पर चुकताई</p>
                  <p className="text-lg font-bold text-green-900">{creditProfile.onTimePayments}/12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-700">अगली EMI</p>
                  <p className="text-lg font-bold text-orange-900">₹{creditProfile.nextDueAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ओवरव्यू</TabsTrigger>
            <TabsTrigger value="borrow">उधार लें</TabsTrigger>
            <TabsTrigger value="history">हिस्ट्री</TabsTrigger>
            <TabsTrigger value="group">ग्रु��� ट्रस्ट</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span>क्रेडिट स्थिति</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>कुल लिमिट</span>
                      <span className="font-semibold">₹{creditProfile.currentLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>इस्तेमाल की गई</span>
                      <span className="text-red-600">₹{creditProfile.usedCredit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>उपलब्ध</span>
                      <span className="text-green-600 font-semibold">₹{creditProfile.availableCredit}</span>
                    </div>
                    <Progress value={creditUtilization} className="h-2" />
                    <p className="text-xs text-gray-600">{Math.round(creditUtilization)}% इस्तेमाल</p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>ब्याज दर</span>
                      <span className="text-blue-600">{creditProfile.interestRate}% मासिक</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>कुल चुकताई</span>
                      <span className="text-green-600">₹{creditProfile.totalRepaid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>सदस्य बने</span>
                      <span>{creditProfile.memberSince}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Score Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>ट्रस्ट स्कोर विवरण</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{creditProfile.trustScore}%</div>
                    <Badge className={getTrustBadge(creditProfile.trustScore).color}>
                      {getTrustBadge(creditProfile.trustScore).label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">पेमेंट हिस्ट्री</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={95} className="w-16 h-2" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ग्रुप ट्रस्ट</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={88} className="w-16 h-2" />
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">बिजनेस स्टेबिलिटी</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={82} className="w-16 h-2" />
                        <span className="text-sm font-medium">82%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">FSSAI/KYC</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Payment */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Calendar className="h-5 w-5" />
                  <span>अगली पेमेंट</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">₹{creditProfile.nextDueAmount}</p>
                    <p className="text-sm text-gray-600">देय तारीख: {creditProfile.nextDueDate}</p>
                    <p className="text-xs text-gray-500">5 दिन बाकी</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500">
                      अभी पे करें
                    </Button>
                    <Button variant="outline" size="sm">
                      रिमाइंडर सेट करें
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>नया उधार लें</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">राशि (₹50 - ₹{creditProfile.availableCredit})</Label>
                  <Input
                    id="amount"
                    placeholder="राशि दर्ज करें"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                  />
                </div>
                
                {creditAmount && parseInt(creditAmount) > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-blue-900">लोन विवरण:</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>मुख्य राशि:</span>
                        <span>₹{creditAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ब्याज ({creditProfile.interestRate}% मासिक):</span>
                        <span>₹{Math.round(parseInt(creditAmount || "0") * creditProfile.interestRate / 100)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>कुल चुकताई:</span>
                        <span>₹{parseInt(creditAmount || "0") + Math.round(parseInt(creditAmount || "0") * creditProfile.interestRate / 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>चुकताई की तारीख:</span>
                        <span>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('hi-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium">उधार का कारण:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["सब्जी खरीदारी", "मसाले का स्टॉक", "तेल की खरीदारी", "अन्य कच्चा माल"].map((reason) => (
                      <Button key={reason} variant="outline" size="sm" className="justify-start">
                        {reason}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                  disabled={!creditAmount || parseInt(creditAmount) <= 0}
                >
                  उधार के लिए अप्लाई करें
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {creditHistory.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">₹{record.amount}</h3>
                        <p className="text-sm text-gray-600">{record.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {record.date} • देय: {record.dueDate} • चुकता: {record.paidDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">
                        {record.status}
                      </Badge>
                      <p className="text-xs text-gray-600">ब्याज: ₹{record.interest}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>ग्रुप ट्रस्ट नेटवर्क</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">कुल योगदान: ₹{member.contribution}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getTrustBadge(member.trustScore).color}>
                          {member.trustScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">ग्रुप बेनिफिट्स:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ज्यादा ट्रस्ट स्कोर = बेहतर इंटरेस्ट रेट</li>
                    <li>• ग्रुप ��ारंटी से फास्ट अप्रूवल</li>
                    <li>• सभी मेंबर्स की परफॉर्मेंस से आपका स्कोर बढ़ता है</li>
                    <li>• ग्रुप सेविंग्स से बोनस क्रेडिट लिमिट</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
