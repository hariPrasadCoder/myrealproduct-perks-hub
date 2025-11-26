import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type ResetStep = 'email' | 'otp' | 'password';

export default function Login() {
  const { user, signIn, signUp, resetPassword, verifyOTP, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Forgot password dialog state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/deals");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    setLoading(false);
    
    if (!error) {
      navigate("/deals");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName);
    
    setLoading(false);
    
    if (!error) {
      navigate("/deals");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    const { error } = await resetPassword(resetEmail);
    
    setResetLoading(false);
    
    if (!error) {
      setResetStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    const { error } = await verifyOTP(resetEmail, otpCode);
    
    setResetLoading(false);
    
    if (!error) {
      setResetStep('password');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    setResetLoading(true);

    const { error } = await updatePassword(newPassword);
    
    setResetLoading(false);
    
    if (!error) {
      setForgotPasswordOpen(false);
      setResetStep('email');
      setResetEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    }
  };

  const handleCloseDialog = () => {
    setForgotPasswordOpen(false);
    // Reset all state when closing
    setTimeout(() => {
      setResetStep('email');
      setResetEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to access your deals and unlock premium content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setForgotPasswordOpen(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join the MyRealProduct community and unlock exclusive deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resetStep === 'email' && 'Reset Password'}
              {resetStep === 'otp' && 'Enter OTP Code'}
              {resetStep === 'password' && 'Set New Password'}
            </DialogTitle>
            <DialogDescription>
              {resetStep === 'email' && "Enter your email address and we will send you a 6-digit code."}
              {resetStep === 'otp' && 'Enter the 6-digit code sent to your email.'}
              {resetStep === 'password' && 'Enter your new password below.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Enter Email */}
          {resetStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Code
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {resetStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-code">6-Digit Code</Label>
                <Input
                  id="otp-code"
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-muted-foreground">
                  Check your email for the code sent to {resetEmail}
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetStep('email')}
                  disabled={resetLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || otpCode.length !== 6}
                >
                  {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify Code
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {resetStep === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetStep('otp')}
                  disabled={resetLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || newPassword !== confirmPassword || newPassword.length < 6}
                >
                  {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}