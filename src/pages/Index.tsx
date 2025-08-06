import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, FileText, MessageSquareText, User } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isRTL = t('common.language') === 'العربية';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12" dir={isRTL ? 'rtl' : 'ltr'}>
          <h1 className="text-4xl font-bold text-gradient-clip mb-4">
            Welcome to Jooy
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Interactive Worksheet Learning Platform
          </p>
          {user && profile && (
            <p className="text-lg text-gray-700">
              Hello, {profile.full_name || user.email}!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/')}>
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Scan a worksheet QR code to get started
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/profile')}>
            <CardHeader className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Manage your account settings
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <CardTitle className="text-gray-500">My Worksheets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center">
                Coming soon - view your worksheet history
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Scan a QR Code</h3>
                  <p className="text-gray-600">Use your device camera to scan a worksheet QR code</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Interact with Content</h3>
                  <p className="text-gray-600">Tap on highlighted regions to access guided learning</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Get AI Help</h3>
                  <p className="text-gray-600">Use the AI chat feature for personalized assistance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
