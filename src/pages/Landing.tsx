import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Cloud, Zap, GraduationCap, Users, CheckCircle2, TrendingUp, Rocket, ExternalLink } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Get <span className="text-primary">$50,000+</span> worth of software perks by building with MyRealProduct
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our builder community and unlock curated deals on cloud credits, SaaS tools, and AI products
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/deals">
              <Button size="lg" className="text-lg px-8">
                View Deals
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login / Join
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <CardTitle>Join the Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sign up for MyRealProduct and become part of our growing builder community
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <CardTitle>Get Access Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receive your secret access code to unlock all premium deals and offers
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <CardTitle>Start Building</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access deals, save money, and focus on building amazing products
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What You Get */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Cloud Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Up to $350,000 in credits from GCP, AWS, Azure, and more
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <CardTitle>SaaS Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Free trials and discounts on productivity and development tools
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <CardTitle>AI Products</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access to cutting-edge AI platforms and API credits
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Special discounts for students and educational resources
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MyRealProduct Workshop Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  Join Our MyRealProduct 4-Week Hands-On AI Workshop
                </CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  Build an end-to-end AI product in 4 weeks. Learn while you build with live classes, mentorship, and hands-on projects. Perfect for Data Analysts, Data Scientists, and anyone ready to break into AI.
                </CardDescription>
                <div className="pt-4">
                  <a 
                    href="https://myrealproduct.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="text-lg px-8">
                      Learn More & Enroll
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Who Is This For?</h2>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Data Analysts & Scientists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>AI & ML Engineers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Indie Makers & Builders</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Startup Founders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Students & Researchers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>Tech Entrepreneurs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Users className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-4xl font-bold">Ready to Start Saving?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of builders who are already saving money with our curated deals
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/deals">
              <Button size="lg" className="text-lg px-8">
                Browse Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 MyRealProduct. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/deals" className="text-muted-foreground hover:text-foreground transition-colors">
                Deals
              </Link>
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}