import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Activity } from "@shared/schema";

interface ActivityCardProps {
  activity: Activity;
  onBookNow: (activityId: number) => void;
}

export default function ActivityCard({ activity, onBookNow }: ActivityCardProps) {
  return (
    <Card className="card-pattern rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
      <img 
        src={activity.imageUrl} 
        alt={activity.title} 
        className="w-full h-56 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-arabic font-bold text-moroccan-brown">{activity.title}</h3>
          <span className="bg-moroccan-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
            {formatPrice(activity.price)}/person
          </span>
        </div>
        <p className="text-gray-700 mb-4">{activity.description}</p>
        <Button 
          onClick={() => onBookNow(activity.id)}
          className="w-full bg-terracotta hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition"
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}
