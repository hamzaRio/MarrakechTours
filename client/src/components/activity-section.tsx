import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ActivityCard from "./activity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@shared/schema";

interface ActivitySectionProps {
  onBookActivity: (activityId: number) => void;
}

export default function ActivitySection({ onBookActivity }: ActivitySectionProps) {
  const { t } = useTranslation();
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const handleBookNow = (activityId: number) => {
    onBookActivity(activityId);
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="activities" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">{t('activities.featured')}</h2>
            <div className="h-1 w-16 bg-terracotta mx-auto mt-3"></div>
            <p className="mt-4 text-gray-600">{t('activities.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-md overflow-hidden shadow-md">
                <Skeleton className="w-full h-56" />
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-16 w-full mt-2" />
                  <Skeleton className="h-9 w-full mt-4" />
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
      <section id="activities" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
            {t('activities.loadError')}
          </h2>
          <p className="text-gray-600">
            {t('activities.tryAgain')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="activities" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">{t('activities.featured')}</h2>
          <div className="h-1 w-16 bg-terracotta mx-auto mt-3"></div>
          <p className="mt-4 text-gray-600">{t('activities.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
