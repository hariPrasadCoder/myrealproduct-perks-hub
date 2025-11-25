import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DealCard } from "@/components/DealCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Deals() {
  const { user, profile, verifyAccessCode } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("status", "PUBLISHED")
        .order("display_order", { ascending: true })
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Sort deals: those with display_order first, then by featured/created_at
      const sortedDeals = (data || []).sort((a, b) => {
        // If both have display_order, sort by it
        if (a.display_order != null && b.display_order != null) {
          return a.display_order - b.display_order;
        }
        // If only a has display_order, it comes first
        if (a.display_order != null && b.display_order == null) {
          return -1;
        }
        // If only b has display_order, it comes first
        if (a.display_order == null && b.display_order != null) {
          return 1;
        }
        // If neither has display_order, use featured/created_at
        if (a.is_featured !== b.is_featured) {
          return a.is_featured ? -1 : 1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setDeals(sortedDeals);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    if (!user) {
      // Redirect to login
      window.location.href = "/login";
    } else if (!profile?.has_full_access) {
      setShowCodeDialog(true);
    }
  };

  const handleVerifyCode = async () => {
    setVerifying(true);
    const result = await verifyAccessCode(accessCode);
    setVerifying(false);
    
    if (result.success) {
      setShowCodeDialog(false);
      setAccessCode("");
    }
  };

  const isLocked = !user || !profile?.has_full_access;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">MyRealProduct Deals</h1>
            <p className="text-lg text-muted-foreground">
              Curated software perks and free tools for builders
            </p>
          </div>

          {isLocked && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Want full access?{" "}
                {user ? (
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setShowCodeDialog(true)}
                  >
                    Enter your secret code to unlock all links
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="link" className="p-0 h-auto font-semibold">
                        Login
                      </Button>
                    </Link>
                    {" "}and enter your secret code to unlock all links
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No deals available at the moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  isLocked={isLocked}
                  onUnlock={handleUnlock}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Access Code</DialogTitle>
            <DialogDescription>
              Enter the secret access code you received from Hari to unlock all deals
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Input
              placeholder="Access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && accessCode) {
                  handleVerifyCode();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCodeDialog(false);
                setAccessCode("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={!accessCode || verifying}
            >
              {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}