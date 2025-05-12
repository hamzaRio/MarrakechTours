import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Activity } from "@shared/schema";
import { ArrowRight, Info } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onBookNow: (activityId: number) => void;
}

export default function ActivityCard({ activity, onBookNow }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link href={`/activity/${activity.id}`}>
        <a className="block cursor-pointer">
          <div className="relative">
            <img 
              src={activity.imageUrl} 
              alt={activity.title} 
              className="w-full h-56 object-cover"
            />
          </div>
        </a>
      </Link>
      <CardContent className="p-5">
        <div className="flex flex-col mb-2">
          <div className="flex justify-between items-center mb-2">
            <Link href={`/activity/${activity.id}`}>
              <a className="hover:text-terracotta transition-colors">
                <h3 className="text-xl font-medium text-gray-800">{activity.title}</h3>
              </a>
            </Link>
            <span className="bg-terracotta/90 text-white px-3 py-1 rounded text-sm">
              {formatPrice(activity.price)}/person
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.description}</p>
          
          <div className="flex gap-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onBookNow(activity.id);
              }}
              className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white"
            >
              Book Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            
            <Link href={`/activity/${activity.id}`}>
              <a className="block">
                <Button 
                  variant="outline"
                  className="border-terracotta text-terracotta hover:bg-terracotta/10"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
