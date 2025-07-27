import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Shield, User } from 'lucide-react';
import { web3Service } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionProps {
  onConnectionChange: (connected: boolean, address: string | null, isAdmin: boolean) => void;
}

export const WalletConnection = ({ onConnectionChange }: WalletConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    const currentAccount = web3Service.getCurrentAccount();
    if (currentAccount) {
      setAccount(currentAccount);
      setIsAdmin(web3Service.getIsAdmin());
      onConnectionChange(true, currentAccount, web3Service.getIsAdmin());
    }
  }, [onConnectionChange]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await web3Service.connectWallet();
      const adminStatus = web3Service.getIsAdmin();
      
      setAccount(address);
      setIsAdmin(adminStatus);
      onConnectionChange(true, address, adminStatus);

      toast({
        title: "Wallet Connected",
        description: `Connected as ${adminStatus ? 'Admin' : 'Voter'}: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Service.disconnectWallet();
      setAccount(null);
      setIsAdmin(false);
      onConnectionChange(false, null, false);

      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  if (!account) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your wallet to participate in blockchain voting
              </p>
            </div>
            <Button 
              variant="connect" 
              size="lg" 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              {isAdmin ? (
                <Shield className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                  {isAdmin ? "Admin" : "Voter"}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};