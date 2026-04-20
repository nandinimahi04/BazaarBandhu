import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
        });

        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            toast.success('BazaarBandhu installed successfully!');
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    if (!isInstallable) return null;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-2xl flex items-center justify-between mb-6 shadow-lg animate-bounce-subtle">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold">Install BazaarBandhu App</p>
                    <p className="text-[10px] opacity-90">Access your business even offline from your home screen!</p>
                </div>
            </div>
            <Button 
                onClick={handleInstallClick}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs h-8"
            >
                <Download className="w-3 h-3 mr-2" /> Install Now
            </Button>
        </div>
    );
};
