import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Lock, Unlock } from "lucide-react";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
          MyRealProduct
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/deals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Deals
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              {profile?.has_full_access ? (
                <Badge variant="default" className="bg-success text-success-foreground">
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
              
              {profile?.is_admin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">Login / Join</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};