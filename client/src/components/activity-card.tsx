import React from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Activity } from "@shared/schema";
import { ArrowRight, Info, Users } from "lucide-react";
import { CapacityBadge } from "./capacity-display";

// Extended type to handle both image property variants
interface ActivityWithImageUrl extends Activity {
  imageUrl?: string;
}

interface ActivityCardProps {
  activity: ActivityWithImageUrl;
  onBookNow: (activityId: number) => void;
}

export default function ActivityCard({ activity, onBookNow }: ActivityCardProps) {
  const { t } = useTranslation();
  // Use today's date for capacity display
  const today = new Date();
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <div 
        className="cursor-pointer"
        onClick={() => window.location.href = `/activity/${activity.id}`}
      >
        <div className="relative">
          <img 
            src={activity.image || activity.imageUrl} 
            alt={activity.title} 
            className="w-full h-56 object-cover"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.src = "/attached_assets/bahia.jpg";
              console.error(`Image failed to load: ${activity.image || activity.imageUrl}`);
            }}
          />
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex flex-col mb-2">
          <div className="flex justify-between items-center mb-2">
            <div 
              className="cursor-pointer hover:text-terracotta transition-colors"
              onClick={() => window.location.href = `/activity/${activity.id}`}  
            >
              <h3 className="text-xl font-medium text-gray-800">{activity.title}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="bg-terracotta/90 text-white px-3 py-1 rounded text-sm">
                {formatPrice(activity.price)}/{t('activities.people')}
              </span>
              {activity.maxGroupSize && (
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{t('activities.max')}: {activity.maxGroupSize}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2 line-clamp-3">{activity.description}</p>
          
          {activity.id && (
            <div className="mb-3">
              <CapacityBadge
                activityId={activity.id}
                date={today}
                compact={true}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onBookNow(activity.id)}
              className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white"
            >
              {t('activities.booknow')} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              className="border-terracotta text-terracotta hover:bg-terracotta/10"
              onClick={() => window.location.href = `/activity/${activity.id}`}
              title={t('activities.details')}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
