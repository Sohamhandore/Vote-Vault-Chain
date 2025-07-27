import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnection } from '@/components/WalletConnection';
import { AdminPanel } from '@/components/AdminPanel';
import { VotingPanel } from '@/components/VotingPanel';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { Shield, Vote, BarChart, Blocks, Lock, Users, CheckCircle } from 'lucide-react';

export const VoteVaultChain = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('vote');

  const handleConnectionChange = (connected: boolean, address: string | null, adminStatus: boolean) => {
    setIsConnected(connected);
    setAccount(address);
    setIsAdmin(adminStatus);
    
    // Auto-switch to admin tab if user is admin
    if (connected && adminStatus) {
      setActiveTab('admin');
    } else if (connected) {
      setActiveTab('vote');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_50%)] opacity-20" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--secondary)_0%,_transparent_50%)] opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-8">
              <Blocks className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VoteVault Chain
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Secure, transparent, and immutable blockchain-based voting system powered by Ethereum smart contracts
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Immutable Security</h3>
                  <p className="text-sm text-muted-foreground">
                    All votes are cryptographically secured and stored permanently on the blockchain
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">One Vote Per Person</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart contracts ensure each registered wallet can only vote once per election
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Real-time Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Transparent, publicly verifiable results updated instantly on the blockchain
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Connection */}
            <WalletConnection onConnectionChange={handleConnectionChange} />
          </div>

          {/* Technology Stack */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-8">Built with Modern Blockchain Technology</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">S</span>
                </div>
                <span>Solidity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-secondary">E</span>
                </div>
                <span>Ethereum</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">W3</span>
                </div>
                <span>Web3.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">R</span>
                </div>
                <span>React</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Blocks className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">VoteVault Chain</h1>
            </div>
            
            <WalletConnection onConnectionChange={handleConnectionChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-card/50 backdrop-blur-sm">
              <TabsTrigger 
                value="vote" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Vote className="w-4 h-4" />
                <span className="hidden sm:inline">Vote</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="results" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart className="w-4 h-4" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
              
              {isAdmin && (
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="vote" className="space-y-6">
            <VotingPanel isVisible={activeTab === 'vote'} account={account} />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ResultsDashboard isVisible={activeTab === 'results'} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel isVisible={activeTab === 'admin'} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              VoteVault Chain - Secure Blockchain Voting System
            </p>
            <p className="text-sm">
              Powered by Ethereum Smart Contracts | Built with React & Solidity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};