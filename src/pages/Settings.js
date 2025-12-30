import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/hooks/useAuth';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "../utils";

// Replace Base44 imports with your own services
import { getAppSettingsFromSupabase, saveAppSettingsToSupabase } from "../services/settingsService";

export default function Settings() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({ 
        shopeeAffiliateId: '', 
        shopeePartnerId: '',
        shopeeApiEnabled: false,
        shopeeApiKey: '',       
        shopeeApiSecret: ''     
    });
    const [settingsRecord, setSettingsRecord] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isLoading) return; 
        if (!isAuthenticated) {
            navigate(createPageUrl("Home"));
            return;
        }
        if (user?.role === 'admin') {
            loadSettings();
        }
    }, [isAuthenticated, user, isLoading, navigate]);

    const loadSettings = async () => {
        const appSettings = await getAppSettingsFromSupabase();
        if (appSettings) {
            setSettingsRecord(appSettings);
            setSettings({
                shopeeAffiliateId: appSettings.shopee_affiliate_id || '',
                shopeePartnerId: appSettings.shopee_partner_id || '',
                shopeeApiEnabled: appSettings.shopee_api_enabled || false,
                shopeeApiKey: appSettings.shopee_api_key || '',           
                shopeeApiSecret: appSettings.shopee_api_secret || ''      
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            const savedSettings = await saveAppSettingsToSupabase({
                shopee_affiliate_id: settings.shopeeAffiliateId,
                shopee_partner_id: settings.shopeePartnerId,
                shopee_api_enabled: settings.shopeeApiEnabled,
                shopee_api_key: settings.shopeeApiKey,
                shopee_api_secret: settings.shopeeApiSecret,
                userId: user?.id
            });
            
            setSettingsRecord(savedSettings);
            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving settings. Please try again.');
            console.error(error);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="revolut-card max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You must be an administrator to view this page.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <SettingsIcon className="w-8 h-8 text-blue-500" />
                    <h1 className="text-3xl font-bold text-white">App Settings</h1>
                </div>

                <Card className="revolut-card">
                    <CardHeader>
                        <CardTitle>Shopee Affiliate Configuration</CardTitle>
                        <CardDescription>
                            Enter your Shopee affiliate details to automatically generate commission links in search results.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="shopeePartnerId" className="text-gray-300">Shopee Partner ID (pid)</Label>
                            <Input
                                id="shopeePartnerId"
                                value={settings.shopeePartnerId}
                                onChange={(e) => setSettings({ ...settings, shopeePartnerId: e.target.value })}
                                placeholder="e.g., partnerize_int"
                                className="revolut-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shopeeAffiliateId" className="text-gray-300">Shopee Affiliate/Campaign ID (c)</Label>
                            <Input
                                id="shopeeAffiliateId"
                                value={settings.shopeeAffiliateId}
                                onChange={(e) => setSettings({ ...settings, shopeeAffiliateId: e.target.value })}
                                placeholder="Your unique affiliate ID"
                                className="revolut-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shopeeApiEnabled" className="text-gray-300">Enable API Integration (Future)</Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="shopeeApiEnabled"
                                    checked={settings.shopeeApiEnabled}
                                    onChange={(e) => setSettings({ ...settings, shopeeApiEnabled: e.target.checked })}
                                    className="rounded"
                                />
                                <Label htmlFor="shopeeApiEnabled" className="text-sm text-gray-400">Enable automatic Shopee API link generation</Label>
                            </div>
                            {settings.shopeeApiEnabled && (
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shopeeApiKey" className="text-gray-300">Shopee API Key</Label>
                                        <Input
                                            id="shopeeApiKey"
                                            value={settings.shopeeApiKey}
                                            onChange={(e) => setSettings({ ...settings, shopeeApiKey: e.target.value })}
                                            placeholder="Your Shopee API key"
                                            className="revolut-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shopeeApiSecret" className="text-gray-300">Shopee API Secret</Label>
                                        <Input
                                            id="shopeeApiSecret"
                                            value={settings.shopeeApiSecret}
                                            onChange={(e) => setSettings({ ...settings, shopeeApiSecret: e.target.value })}
                                            placeholder="Your Shopee API secret"
                                            type="password"
                                            className="revolut-input"
                                        />
                                    </div>
                                    <div className="text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg">
                                        ⚠️ API integration is currently disabled in code. This will be implemented when Shopee API details are available.
                                    </div>
                                </div>
                            )}
                        </div>

                        {message && (
                            <Alert variant={message.includes('Error') ? 'destructive' : 'default'} className={message.includes('Error') ? 'bg-red-900/50 border-red-500/50 text-white' : 'bg-green-900/50 border-green-500/50 text-white'}>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        <Button onClick={handleSave} disabled={isSaving} className="revolut-button w-full text-lg py-6">
                            {isSaving ? (
                               <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                Saving...
                               </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-5 h-5"/> Save Settings
                                </div>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}