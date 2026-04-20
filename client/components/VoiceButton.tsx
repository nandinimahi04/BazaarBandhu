import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Play } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const VoiceButton = () => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Supports Hinglish/Indian English

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);
            processVoice(result);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }

    const startListening = () => {
        if (!recognition) {
            toast.error("Voice recognition not supported in this browser");
            return;
        }
        setTranscript('');
        setIsListening(true);
        recognition.start();
        toast.info("Listening... Speak now (Hindi/English)");
    };

    const processVoice = async (text: string) => {
        setIsProcessing(true);
        try {
            const response = await api.post('/features/voice-process', { transcript: text });
            if (response.status === 'SUCCESS') {
                toast.success(response.message, {
                    description: `Heard: "${text}"`,
                    icon: <Play className="w-4 h-4 text-green-500" />
                });
            } else {
                toast.info(response.message);
            }
        } catch (error) {
            toast.error("Failed to process voice command");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
            {transcript && (
                <div className="bg-white/90 backdrop-blur shadow-lg border border-orange-100 p-3 rounded-2xl max-w-xs animate-in slide-in-from-right-4">
                    <p className="text-xs text-orange-500 font-bold mb-1 uppercase tracking-wider">You said:</p>
                    <p className="text-sm text-slate-700 italic">"{transcript}"</p>
                </div>
            )}
            
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase">Bolke Business Chalao</span>
                <Button 
                    size="icon" 
                    className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 ${
                        isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                        : 'bg-gradient-to-br from-orange-500 to-red-600 hover:scale-105'
                    }`}
                    onClick={isListening ? () => recognition.stop() : startListening}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : isListening ? (
                        <MicOff className="h-8 w-8" />
                    ) : (
                        <Mic className="h-8 w-8" />
                    )}
                </Button>
            </div>
        </div>
    );
};
