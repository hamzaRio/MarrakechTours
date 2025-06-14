import React from "react";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Share2, 
  Link as LinkIcon,
  MessageCircle,
  Copy,
  X
} from "lucide-react";
import { Activity } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  activity: Activity;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
  onClose?: () => void;
}

export function SocialShare({ 
  activity, 
  className,
  iconSize = 18,
  showLabel = false,
  onClose
}: SocialShareProps) {
  const { toast } = useToast();
  const [canShare, setCanShare] = React.useState(false);
  
  React.useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 
               typeof navigator.share === 'function');
  }, []);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out ${activity.title} with MarrakechDeserts!`;
  const shareText = `${activity.description.substring(0, 100)}...`;
  
  const shareData = {
    title: shareTitle,
    text: shareText,
    url: shareUrl,
  };

  const handleShare = async (platform: string) => {
    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            toast({
              title: "Shared successfully",
              description: "Thank you for sharing!",
            });
          } catch (err) {
            console.error("Error sharing:", err);
          }
        } else {
          toast({
            title: "Sharing not supported",
            description: "Your browser doesn't support native sharing",
            variant: "destructive",
          });
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Tour link copied to clipboard",
        });
        break;
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-600 hover:text-terracotta hover:bg-terracotta/10"
        onClick={() => handleShare('facebook')}
      >
        <Facebook size={iconSize} />
        {showLabel && <span className="ml-2">Facebook</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-600 hover:text-terracotta hover:bg-terracotta/10"
        onClick={() => handleShare('twitter')}
      >
        <Twitter size={iconSize} />
        {showLabel && <span className="ml-2">Twitter</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-600 hover:text-terracotta hover:bg-terracotta/10"
        onClick={() => handleShare('whatsapp')}
      >
        <MessageCircle size={iconSize} />
        {showLabel && <span className="ml-2">WhatsApp</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-600 hover:text-terracotta hover:bg-terracotta/10"
        onClick={() => handleShare('copy')}
      >
        <Copy size={iconSize} />
        {showLabel && <span className="ml-2">Copy Link</span>}
      </Button>
      
      {canShare && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:text-terracotta hover:bg-terracotta/10"
          onClick={() => handleShare('native')}
        >
          <Share2 size={iconSize} />
          {showLabel && <span className="ml-2">Share</span>}
        </Button>
      )}
    </div>
  );
}

export function SocialSharePopover({ activity, className }: SocialShareProps) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("flex items-center gap-2 bg-white", className)}
        >
          <Share2 size={16} />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-md rounded-lg" align="end">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-800">Share this tour</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setOpen(false)}
          >
            <X size={16} />
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Share this amazing tour with your friends and family
        </p>
        <SocialShare 
          activity={activity} 
          showLabel={true} 
          onClose={() => setOpen(false)}
          className="flex-col items-stretch gap-2"
        />
      </PopoverContent>
    </Popover>
  );
}