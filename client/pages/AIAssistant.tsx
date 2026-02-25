import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Volume2, Bot, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {fetchAIResponse}  from "@/lib/fetchAIResponse";

const AIAssistant = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">BazzarBandhu AI Assistant</h1>
      <p className="text-gray-700">
        I can help you check mandi prices, find suppliers, and place group orders.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="clay-element p-4 text-center">
          <ShoppingCart className="mx-auto text-orange-500 mb-2" />
          <p className="text-sm font-medium">Order Raw Materials</p>
        </Card>
        <Card className="clay-element p-4 text-center">
          <Volume2 className="mx-auto text-orange-500 mb-2" />
          <p className="text-sm font-medium">Voice Interaction</p>
        </Card>
        <Card className="clay-element p-4 text-center">
          <Bot className="mx-auto text-orange-500 mb-2" />
          <p className="text-sm font-medium">Local Mandi Rates</p>
        </Card>
        <Card className="clay-element p-4 text-center">
          <RefreshCw className="mx-auto text-orange-500 mb-2" />
          <p className="text-sm font-medium">Group Orders</p>
        </Card>
      </div>

      <div className="mt-8 text-center space-y-4">
        <Button
          className="clay-button text-lg px-6 py-3"
          onClick={() => navigate("/Chat")}
        >
          Launch OpenAI Chat Assistant
        </Button>
        
        <div>
          <Button
            className="clay-button text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/deepseek-chat")}
          >
            Try DeepSeek-R1 Local Model
          </Button>
          <p className="text-sm text-gray-500 mt-2">Powered by local DeepSeek-R1 model</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
