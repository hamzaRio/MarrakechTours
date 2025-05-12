import React from "react";
import { useQuery } from "@tanstack/react-query";
import ActivityCard from "./activity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@shared/schema";

interface ActivitySectionProps {
  onBookActivity: (activityId: number) => void;
}

export default function ActivitySection({ onBookActivity }: ActivitySectionProps) {
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const handleBookNow = (activityId: number) => {
    onBookActivity(activityId);
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="activities" className="py-16 bg-sandy/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-arabic font-bold text-moroccan-brown">Featured Activities</h2>
            <div className="h-1 w-24 bg-moroccan-gold mx-auto mt-4"></div>
            <p className="mt-4 text-lg text-gray-700">Explore our most popular Moroccan experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                <Skeleton className="w-full h-56" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-20 w-full mt-2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="activities" className="py-16 bg-sandy/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-arabic font-bold text-moroccan-brown mb-4">
            Unable to Load Activities
          </h2>
          <p className="text-gray-700">
            We're having trouble loading our activities. Please refresh the page or try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="activities" className="py-16 bg-sandy/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-arabic font-bold text-moroccan-brown">Featured Activities</h2>
          <div className="h-1 w-24 bg-moroccan-gold mx-auto mt-4"></div>
          <p className="mt-4 text-lg text-gray-700">Explore our most popular Moroccan experiences</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
