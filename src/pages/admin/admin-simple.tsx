import React from 'react';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Admin: React.FC = () => {
  const { account, isConnected } = useSuiWallet();
  const address = account?.address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OneChain Admin Panel</h1>
          <p className="text-xl text-gray-600">Manage your OneChain RWA platform</p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Connect your wallet to access admin functions</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Connected as: {address?.slice(0, 8)}...{address?.slice(-6)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Total Issuers</h3>
                    <p className="text-2xl font-bold text-blue-600">-</p>
                    <p className="text-sm text-blue-700">OneChain integration pending</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Active Assets</h3>
                    <p className="text-2xl font-bold text-green-600">-</p>
                    <p className="text-sm text-green-700">OneChain integration pending</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900">Marketplace Status</h3>
                    <p className="text-2xl font-bold text-purple-600">Active</p>
                    <p className="text-sm text-purple-700">OneChain marketplace operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Functions</CardTitle>
                <CardDescription>Administrative controls for the OneChain platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Issuer Management</h4>
                    <p className="text-gray-600 mb-2">Manage authorized asset issuers on OneChain</p>
                    <Button disabled variant="outline">
                      Coming Soon - OneChain Integration
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Marketplace Controls</h4>
                    <p className="text-gray-600 mb-2">Control marketplace operations and settings</p>
                    <Button disabled variant="outline">
                      Coming Soon - OneChain Integration
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Asset Monitoring</h4>
                    <p className="text-gray-600 mb-2">Monitor and manage all RWA assets</p>
                    <Button disabled variant="outline">
                      Coming Soon - OneChain Integration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Migration Status</CardTitle>
                <CardDescription>OneChain migration progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span>Contract deployment to OneChain ✅</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span>Frontend Sui SDK integration ✅</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span>Asset creation & marketplace ✅</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>Admin functions integration 🚧</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
