import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  has_full_access: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  verifyAccessCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to MyRealProduct Deals Hub",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    toast({
      title: "Logged out",
      description: "You have been signed out successfully",
    });
  };

  const resetPassword = async (email: string) => {
    // Send OTP code via email (no redirect URL needed)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Don't set redirectTo - we'll use OTP instead
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "OTP code sent",
        description: "Check your email for a 6-digit code",
      });
    }

    return { error };
  };

  const verifyOTP = async (email: string, token: string) => {
    // Verify the OTP token for password recovery
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: error.message,
      });
    } else {
      toast({
        title: "Code verified",
        description: "You can now set a new password",
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
    }

    return { error };
  };

  const verifyAccessCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    try {
      // Read the access code from the database
      const { data: setting, error: settingError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'MRP_DEALS_ACCESS_CODE')
        .single();

      if (settingError || !setting) {
        console.error('Error reading access code from database:', settingError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify access code. Please try again.",
        });
        return { success: false, error: "Failed to read access code" };
      }

      const correctCode = setting.value?.trim();
      const userCode = code?.trim();

      // Verify the code matches
      if (userCode !== correctCode) {
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: "Please contact Hari if you think this is a mistake",
        });
        return { success: false, error: "Invalid code" };
      }

      // Code is correct, update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_full_access: true })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update access. Please try again.",
        });
        return { success: false, error: "Failed to update profile" };
      }

      // Refresh the profile to get the updated data
      await refreshProfile();
      
      toast({
        title: "Access unlocked!",
        description: "You now have full access to all deals",
      });
      return { success: true };
    } catch (error) {
      console.error('Error verifying access code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify access code",
      });
      return { success: false, error: "Failed to verify" };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        verifyOTP,
        updatePassword,
        verifyAccessCode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};