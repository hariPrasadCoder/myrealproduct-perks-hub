import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface DealCardProps {
  deal: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    external_url: string;
    access_type: string;
    value_highlight: string | null;
    expiry_date: string | null;
    is_featured: boolean;
    logo_url: string | null;
  };
  isLocked: boolean;
  onUnlock: () => void;
}

export const DealCard = ({ deal, isLocked, onUnlock }: DealCardProps) => {
  const isExpired = deal.expiry_date ? new Date(deal.expiry_date) < new Date() : false;

  const handleClick = () => {
    if (isLocked) {
      onUnlock();
    } else {
      window.open(deal.external_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 flex flex-col h-full ${deal.is_featured ? 'border-primary' : ''} ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {deal.logo_url ? (
                <img
                  src={deal.logo_url}
                  alt={`${deal.name} logo`}
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load logo for ${deal.name}:`, deal.logo_url);
                    // Hide image on error, container stays for alignment
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-2 line-clamp-2">{deal.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-3">{deal.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            {deal.is_featured && !isExpired && (
              <Badge variant="default" className="text-xs bg-primary">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {deal.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {deal.access_type}
          </Badge>
          {deal.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex-grow">
          {deal.value_highlight && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{deal.value_highlight}</span>
            </div>
          )}

          {deal.expiry_date && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Valid until {format(new Date(deal.expiry_date), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleClick}
          disabled={isExpired}
          className="w-full mt-auto"
          variant={isLocked ? "secondary" : "default"}
        >
          {isExpired ? "Deal Expired" : isLocked ? "Unlock to Access" : "Get Deal"}
          {!isLocked && !isExpired && <ExternalLink className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  );
};