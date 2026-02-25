import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

/**
 * DeepSeekChat Component
 * 
 * This component provides a chat interface that uses the local DeepSeek-R1 model
 * instead of the OpenAI API. It demonstrates how to integrate the DeepSeek model
 * with the BazaarBandhu application.
 */
const DeepSeekChat: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your DeepSeek-R1 AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {      
      // Call the DeepSeek-R1 endpoint
      const response = await fetch('/api/deepseek-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input.trim(),
          language: 'en' // Default to English for now
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add assistant response to messages
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-green-800">BazaarBandhu</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Bot className="h-6 w-6 text-green-600" />
            <span className="font-medium text-green-700">DeepSeek-R1 Chat</span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-green-100">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-green-800 flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                DeepSeek-R1 Assistant
              </CardTitle>
              <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Local Model
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Chat with our local AI assistant powered by DeepSeek-R1
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.sender === 'user' 
                        ? 'bg-green-600 text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div 
                      className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-center my-4">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t border-green-100 p-4">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This model runs locally on the server and does not use the OpenAI API
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeepSeekChat;