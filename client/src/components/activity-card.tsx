import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Activity } from "@shared/schema";
import { ArrowRight } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onBookNow: (activityId: number) => void;
}

export default function ActivityCard({ activity, onBookNow }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover-lift bg-white">
      <div className="relative">
        <img 
          src={activity.imageUrl} 
          alt={activity.title} 
          className="w-full h-56 object-cover"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex flex-col mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-medium text-gray-800">{activity.title}</h3>
            <span className="bg-terracotta/90 text-white px-3 py-1 rounded text-sm">
              {formatPrice(activity.price)}/person
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.description}</p>
          <Button 
            onClick={() => onBookNow(activity.id)}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white mt-2"
          >
            Book Now <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
