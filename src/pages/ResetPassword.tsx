import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Verify the reset token from the URL
    const verifyToken = async () => {
      try {
        // Check if we have a session (which means the token is valid)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setVerified(true);
        } else {
          // Try to get the session from the URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!error) {
              setVerified(true);
            }
          }
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(newPassword);
    
    setLoading(false);
    
    if (!error) {
      navigate("/login");
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <p className="text-center mt-4 text-muted-foreground">
                  Verifying reset link...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Invalid or Expired Link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired. Please request a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-destructive">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

