import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOrdering, setShowOrdering] = useState(false);
  const [orderedDeals, setOrderedDeals] = useState<any[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Cloud",
    tags: "",
    external_url: "",
    access_type: "Free",
    value_highlight: "",
    expiry_date: "",
    is_featured: false,
    status: "PUBLISHED",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (profile && !profile.is_admin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges",
      });
      navigate("/deals");
    } else if (profile?.is_admin) {
      fetchDeals();
    }
  }, [user, profile, navigate]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Sort deals: those with display_order first, then by created_at
      const sortedDeals = (data || []).sort((a, b) => {
        if (a.display_order != null && b.display_order != null) {
          return a.display_order - b.display_order;
        }
        if (a.display_order != null && b.display_order == null) {
          return -1;
        }
        if (a.display_order == null && b.display_order != null) {
          return 1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setDeals(sortedDeals);
      // Initialize ordered deals for the ordering interface
      const dealsWithOrder = sortedDeals.map((deal, index) => ({
        ...deal,
        display_order: deal.display_order ?? index + 1,
      }));
      setOrderedDeals(dealsWithOrder);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "Cloud",
      tags: "",
      external_url: "",
      access_type: "Free",
      value_highlight: "",
      expiry_date: "",
      is_featured: false,
      status: "PUBLISHED",
      logo_url: "",
    });
    setEditingDeal(null);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleOpenDialog = (deal?: any) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        name: deal.name,
        description: deal.description,
        category: deal.category,
        tags: deal.tags.join(", "),
        external_url: deal.external_url,
        access_type: deal.access_type,
        value_highlight: deal.value_highlight || "",
        expiry_date: deal.expiry_date ? format(new Date(deal.expiry_date), "yyyy-MM-dd") : "",
        is_featured: deal.is_featured,
        status: deal.status,
        logo_url: deal.logo_url || "",
      });
      setLogoPreview(deal.logo_url || null);
      setLogoFile(null);
    } else {
      resetForm();
    }
    setShowDealDialog(true);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploadingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `deal-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('deal-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('deal-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "Failed to upload logo",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an image file",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoUrl = formData.logo_url;

    // Upload new logo if a file was selected
    if (logoFile) {
      const uploadedUrl = await uploadLogo(logoFile);
      if (!uploadedUrl) {
        return; // Error already shown in uploadLogo
      }
      logoUrl = uploadedUrl;
    }

    const dealData = {
      ...formData,
      logo_url: logoUrl || null,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      expiry_date: formData.expiry_date || null,
      value_highlight: formData.value_highlight || null,
    };

    try {
      if (editingDeal) {
        const { error } = await supabase
          .from("deals")
          .update(dealData)
          .eq("id", editingDeal.id);

        if (error) throw error;
        
        toast({
          title: "Deal updated",
          description: "The deal has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("deals")
          .insert([dealData]);

        if (error) throw error;
        
        toast({
          title: "Deal created",
          description: "The deal has been created successfully",
        });
      }

      setShowDealDialog(false);
      resetForm();
      fetchDeals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;

      toast({
        title: "Deal deleted",
        description: "The deal has been deleted successfully",
      });

      fetchDeals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleToggleStatus = async (deal: any) => {
    const newStatus = deal.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", deal.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Deal ${newStatus === "PUBLISHED" ? "published" : "unpublished"}`,
      });

      fetchDeals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleMoveDeal = (index: number, direction: "up" | "down") => {
    const newOrderedDeals = [...orderedDeals];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrderedDeals.length) return;
    
    // Swap the deals
    [newOrderedDeals[index], newOrderedDeals[targetIndex]] = 
      [newOrderedDeals[targetIndex], newOrderedDeals[index]];
    
    // Update display_order values
    newOrderedDeals.forEach((deal, idx) => {
      deal.display_order = idx + 1;
    });
    
    setOrderedDeals(newOrderedDeals);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      // Update all deals with their new display_order
      const updates = orderedDeals.map((deal) => ({
        id: deal.id,
        display_order: deal.display_order,
      }));

      // Batch update deals
      for (const update of updates) {
        const { error } = await supabase
          .from("deals")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast({
        title: "Order saved",
        description: "Deal display order has been updated successfully",
      });

      setShowOrdering(false);
      fetchDeals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save deal order",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || deal.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Manage deals and track performance
              </p>
            </div>
            
            <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={() => handleOpenDialog()}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Deal
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDeal ? "Edit Deal" : "Create New Deal"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDeal ? "Update the deal information" : "Add a new deal to the platform"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                      {logoPreview && (
                        <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          disabled={uploadingLogo}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a company logo (max 5MB, PNG/JPG)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cloud">Cloud</SelectItem>
                          <SelectItem value="Productivity">Productivity</SelectItem>
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access_type">Access Type *</Label>
                      <Select value={formData.access_type} onValueChange={(value) => setFormData({ ...formData, access_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Discount">Discount</SelectItem>
                          <SelectItem value="Credit">Credit</SelectItem>
                          <SelectItem value="Trial">Trial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="external_url">External URL *</Label>
                    <Input
                      id="external_url"
                      type="url"
                      value={formData.external_url}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="student friendly, no credit card, limited time"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value_highlight">Value Highlight</Label>
                    <Input
                      id="value_highlight"
                      placeholder="Save up to $500"
                      value={formData.value_highlight}
                      onChange={(e) => setFormData({ ...formData, value_highlight: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Featured Deal</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDealDialog(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploadingLogo}>
                      {uploadingLogo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingDeal ? "Update Deal" : "Create Deal"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cloud">Cloud</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Ordering Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deal Display Order</CardTitle>
                  <CardDescription>
                    Rearrange the order in which deals appear on the deals page
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {showOrdering ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowOrdering(false);
                          fetchDeals(); // Reset to original order
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                      >
                        {savingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Order
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOrdering(true);
                        // Filter to only published deals for ordering
                        const publishedDeals = deals
                          .filter((deal) => deal.status === "PUBLISHED")
                          .map((deal, index) => ({
                            ...deal,
                            display_order: deal.display_order ?? index + 1,
                          }))
                          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                        setOrderedDeals(publishedDeals);
                      }}
                    >
                      <GripVertical className="w-4 h-4 mr-2" />
                      Rearrange Deals
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {showOrdering && (
              <CardContent>
                <div className="space-y-2">
                  {orderedDeals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No published deals to reorder
                    </p>
                  ) : (
                    orderedDeals.map((deal, index) => (
                      <div
                        key={deal.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            #{deal.display_order}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{deal.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {deal.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDeal(index, "up")}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDeal(index, "down")}
                            disabled={index === orderedDeals.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Deals ({filteredDeals.length})</CardTitle>
              <CardDescription>Manage and track all your deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">
                          {deal.name}
                          {deal.is_featured && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{deal.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(deal)}
                          >
                            <Badge variant={deal.status === "PUBLISHED" ? "default" : "outline"}>
                              {deal.status}
                            </Badge>
                          </Button>
                        </TableCell>
                        <TableCell>{deal.click_count}</TableCell>
                        <TableCell>{format(new Date(deal.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(deal)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(deal.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}